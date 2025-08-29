'use client';

import { createSupabaseBrowser } from '@/app/lib/supabase/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AlertCircle, CheckCircle, Clock, MapPin, MessageCircle, Phone, Truck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface OrderStatus {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  location?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  buyer_name: string;
  buyer_phone: string;
  pickup_address: string;
  delivery_address: string;
  estimated_delivery: string;
  total_amount: number;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_rating?: number;
  driver_vehicle?: string;
  created_at: string;
  updated_at: string;
}

interface DriverLocation {
  driverId: string;
  orderId: string;
  location: { lat: number; lng: number };
  heading: number;
  speed: number;
  timestamp: string;
}

interface RealTimeOrderTrackerProps {
  orderId: string;
  onStatusUpdate?: (status: string) => void;
  showDriverInfo?: boolean;
  showLocation?: boolean;
  className?: string;
}

export default function RealTimeOrderTracker({
  orderId,
  onStatusUpdate,
  showDriverInfo = true,
  showLocation = true,
  className = ''
}: RealTimeOrderTrackerProps) {
  const supabase = createSupabaseBrowser();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatus[]>([]);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);

  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection for real-time updates
  const { isConnected, connect, disconnect } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000',
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
    onClose: handleWebSocketClose,
    shouldReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  });

  // Fetch initial order data
  useEffect(() => {
    fetchOrderData();
    fetchStatusHistory();
  }, [orderId]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (orderId) {
      connect();
    }

    return () => {
      disconnect();
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [orderId, connect, disconnect]);

  // Set up periodic status checks as fallback
  useEffect(() => {
    if (order && order.status !== 'delivered' && order.status !== 'cancelled') {
      statusCheckInterval.current = setInterval(() => {
        fetchStatusHistory();
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [order]);

  const fetchOrderData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_buyer_id_fkey(full_name, phone),
          driver_profiles!orders_driver_id_fkey(
            full_name,
            phone,
            rating,
            vehicle_info
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const formattedOrder: Order = {
        ...data,
        buyer_name: data.profiles?.full_name || 'Unknown',
        buyer_phone: data.profiles?.phone || 'Unknown',
        driver_name: data.driver_profiles?.full_name,
        driver_phone: data.driver_profiles?.phone,
        driver_rating: data.driver_profiles?.rating,
        driver_vehicle: data.driver_profiles?.vehicle_info?.make + ' ' + data.driver_profiles?.vehicle_info?.model
      };

      setOrder(formattedOrder);

      if (onStatusUpdate) {
        onStatusUpdate(formattedOrder.status);
      }
    } catch (err) {
      console.error('Failed to fetch order data:', err);
      setError('Failed to load order information');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setStatusHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch status history:', err);
    }
  };

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'order:status_change':
          if (data.orderId === orderId) {
            handleOrderStatusUpdate(data);
          }
          break;

        case 'location:driver_update':
          if (data.orderId === orderId) {
            handleDriverLocationUpdate(data);
          }
          break;

        case 'order:assigned':
          if (data.orderId === orderId) {
            handleDriverAssigned(data);
          }
          break;

        default:
          // Handle other message types
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [orderId]);

  const handleWebSocketError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
    setError('Connection error - updates may be delayed');
  }, []);

  const handleWebSocketClose = useCallback(() => {
    console.log('WebSocket connection closed');
    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (orderId) {
        connect();
      }
    }, 5000);
  }, [orderId, connect]);

  const handleOrderStatusUpdate = (data: any) => {
    if (order) {
      const updatedOrder = { ...order, status: data.status };
      setOrder(updatedOrder);

      if (onStatusUpdate) {
        onStatusUpdate(data.status);
      }

      // Refresh status history
      fetchStatusHistory();

      // Update estimated delivery time if status changed
      if (data.status === 'picked_up') {
        updateEstimatedDeliveryTime();
      }
    }
  };

  const handleDriverLocationUpdate = (data: any) => {
    setDriverLocation({
      driverId: data.driverId,
      orderId: data.orderId,
      location: data.location,
      heading: data.heading,
      speed: data.speed,
      timestamp: data.timestamp
    });
  };

  const handleDriverAssigned = (data: any) => {
    if (order) {
      const updatedOrder = {
        ...order,
        driver_id: data.driverId,
        driver_name: data.driverName
      };
      setOrder(updatedOrder);

      // Refresh order data to get complete driver information
      fetchOrderData();
    }
  };

  const updateEstimatedDeliveryTime = () => {
    if (order && order.status === 'picked_up') {
      // Calculate estimated delivery time based on distance and current time
      const now = new Date();
      const estimatedTime = new Date(now.getTime() + 30 * 60000); // Add 30 minutes
      setEstimatedTime(estimatedTime.toLocaleTimeString());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'assigned_to_driver':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'picked_up':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned_to_driver':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'picked_up':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order is being prepared by the seller';
      case 'confirmed':
        return 'Order has been confirmed and is ready for pickup';
      case 'assigned_to_driver':
        return 'A driver has been assigned to your order';
      case 'picked_up':
        return 'Your order has been picked up and is on its way';
      case 'in_transit':
        return 'Your order is currently being delivered';
      case 'delivered':
        return 'Your order has been delivered successfully';
      case 'cancelled':
        return 'Your order has been cancelled';
      default:
        return 'Order status updated';
    }
  };

  const callDriver = () => {
    if (order?.driver_phone) {
      window.open(`tel:${order.driver_phone}`, '_self');
    }
  };

  const messageDriver = () => {
    if (order?.driver_id) {
      // Implement chat functionality
      console.log('Open chat with driver:', order.driver_id);
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <span className="text-gray-500">Order not found</span>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Order Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.order_number}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${order.total_amount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          {getStatusIcon(order.status)}
          <div>
            <h4 className="font-medium text-gray-900">
              {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            <p className="text-sm text-gray-500">
              {getStatusDescription(order.status)}
            </p>
          </div>
        </div>

        {estimatedTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Estimated delivery: {estimatedTime}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Driver Information */}
      {showDriverInfo && order.driver_id && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Your Driver</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{order.driver_name}</p>
                {order.driver_rating && (
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-sm text-gray-500">Rating:</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {order.driver_rating.toFixed(1)} ⭐
                    </span>
                  </div>
                )}
                {order.driver_vehicle && (
                  <p className="text-sm text-gray-500 mt-1">
                    {order.driver_vehicle}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={callDriver}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title="Call driver"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={messageDriver}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                  title="Message driver"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Information */}
      {showLocation && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Delivery Details</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                <p className="text-sm text-gray-600">{order.pickup_address}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Delivery Location</p>
                <p className="text-sm text-gray-600">{order.delivery_address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Progress</h4>
        <div className="space-y-3">
          {statusHistory.map((status, index) => (
            <div key={status.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  index === statusHistory.length - 1 ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status.status)}`}>
                    {status.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(status.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {status.notes && (
                  <p className="text-sm text-gray-600 mt-1">{status.notes}</p>
                )}
                {status.location && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {status.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Real-time updates</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

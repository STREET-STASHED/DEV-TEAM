'use client';

import { createSupabaseBrowser } from '@/app/lib/supabase/browser';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import { Camera, CheckCircle, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

interface DriverProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  vehicle_info: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
  };
  rating: number;
  total_deliveries: number;
  total_earnings: number;
  is_online: boolean;
  is_available: boolean;
  current_location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function DriverDashboardPage() {
  const supabase = createSupabaseBrowser();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoType, setPhotoType] = useState<'pickup' | 'delivery'>('pickup');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [_locationHistory, setLocationHistory] = useState<Array<{lat: number; lng: number; timestamp: string}>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const _locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // GPS tracking hook
  const {
    currentLocation,
    isTracking,
    startTracking,
    stopTracking,
    accuracy
  } = useGPSTracking({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
    intervalMs: 10000, // Update every 10 seconds
    onLocationUpdate: (location) => {
      updateDriverLocation(location.latitude, location.longitude);
      addToLocationHistory(location.latitude, location.longitude);
    }
  });

  const fetchDriverProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Transform database profile to match interface
      const transformedProfile: DriverProfile = {
        id: profile.id,
        user_id: profile.user_id,
        full_name: (profile as any).full_name || 'Unknown',
        phone: (profile as any).phone || 'Unknown',
        vehicle_info: profile.vehicle_info as any || {
          make: 'Unknown',
          model: 'Unknown',
          year: 0,
          color: 'Unknown',
          license_plate: 'Unknown'
        },
        rating: (profile as any).rating || 0,
        total_deliveries: profile.completed_orders || 0,
        total_earnings: (profile as any).total_earnings || 0,
        is_online: profile.is_online || false,
        is_available: (profile as any).is_available || false,
        current_location: profile.current_location as any || {
          lat: 0,
          lng: 0,
          address: 'Unknown'
        }
      };

      setDriverProfile(transformedProfile);
      setIsOnline(profile.is_online || false);
    } catch (error) {
      console.error('Failed to fetch driver profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: driverOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_buyer_id_fkey(full_name, phone)
        `)
        .eq('driver_id', user.id)
        .in('status', ['assigned_to_driver', 'picked_up', 'in_transit'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = driverOrders.map(order => ({
        ...order,
        buyer_name: (order.profiles as any)?.full_name || 'Unknown',
        buyer_phone: (order.profiles as any)?.phone || 'Unknown',
        items: order.items || []
      }));

      setOrders(formattedOrders as any);

      // Set current order if there's an active one
      const activeOrder = formattedOrders.find(o =>
        ['assigned_to_driver', 'picked_up', 'in_transit'].includes(o.status)
      );
      setCurrentOrder(activeOrder as any || null);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, [supabase]);

  // Fetch driver profile and orders
  useEffect(() => {
    fetchDriverProfile();
    fetchOrders();
  }, [fetchDriverProfile, fetchOrders]);

  // Start location tracking when component mounts
  useEffect(() => {
    if (isOnline) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [isOnline, startTracking, stopTracking]);

  const updateDriverLocation = async (lat: number, lng: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('driver_profiles')
        .update({
          current_location: { lat, lng, address: 'Current location' },
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Update local state
      if (driverProfile) {
        setDriverProfile(prev => prev ? {
          ...prev,
          current_location: { lat, lng, address: 'Current location' }
        } : null);
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const addToLocationHistory = (lat: number, lng: number) => {
    setLocationHistory(prev => [
      ...prev.slice(-49), // Keep last 50 locations
      { lat, lng, timestamp: new Date().toISOString() }
    ]);
  };

  const toggleOnlineStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newStatus = !isOnline;
      await supabase.from('driver_profiles')
        .update({
          is_online: newStatus,
          is_available: newStatus,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setIsOnline(newStatus);

      if (newStatus) {
        startTracking();
      } else {
        stopTracking();
      }
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('driver_id', user.id);

      // Add to order status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          driver_id: user.id,
          status: newStatus,
          timestamp: new Date().toISOString(),
          notes: getStatusNotes(newStatus),
          location: currentLocation ? `${currentLocation.latitude}, ${currentLocation.longitude}` : null
        });

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusNotes = (status: string): string => {
    switch (status) {
      case 'picked_up': return 'Order picked up from seller location';
      case 'in_transit': return 'Order in transit to delivery location';
      case 'delivered': return 'Order delivered successfully';
      default: return 'Status updated';
    }
  };

  const handlePhotoCapture = (type: 'pickup' | 'delivery') => {
    setPhotoType(type);
    setShowPhotoModal(true);
  };

  const capturePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoData(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload photo to storage
      const fileName = `${photoType}_${currentOrder?.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('delivery-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Update order with photo proof
      if (currentOrder) {
        await supabase
          .from('orders')
          .update({
            [`${photoType}_photo_url`]: data.path,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentOrder.id);

        // Add to status history
        await supabase
          .from('order_status_history')
          .insert({
            order_id: currentOrder.id,
            driver_id: driverProfile?.user_id,
            status: photoType === 'pickup' ? 'picked_up' : 'delivered',
            timestamp: new Date().toISOString(),
            notes: `${photoType === 'pickup' ? 'Pickup' : 'Delivery'} photo captured`,
            metadata: { photo_url: data.path }
          });

        // Update order status if needed
        if (photoType === 'pickup') {
          updateOrderStatus(currentOrder.id, 'picked_up');
        } else if (photoType === 'delivery') {
          updateOrderStatus(currentOrder.id, 'delivered');
        }
      }

      setShowPhotoModal(false);
      setPhotoData(null);
    } catch (error) {
      console.error('Failed to upload photo:', error);
    }
  };

  const callBuyer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const messageBuyer = (orderId: string) => {
    // Implement chat functionality
    console.log('Open chat for order:', orderId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold text-xl">Loading driver dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gold text-black p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Driver Dashboard</h1>
            <p className="text-sm opacity-80">
              {driverProfile?.full_name} • {driverProfile?.vehicle_info?.make} {driverProfile?.vehicle_info?.model}
            </p>
          </div>
          <button
            onClick={toggleOnlineStatus}
            className={`px-4 py-2 rounded-full font-semibold ${
              isOnline
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-900 p-3 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gold" />
            <span>GPS: {isTracking ? 'Active' : 'Inactive'}</span>
          </div>
          {currentLocation && (
            <>
              <div className="flex items-center space-x-2">
                <span>📍 {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}</span>
              </div>
              {accuracy && (
                <div className="flex items-center space-x-2">
                  <span>Accuracy: {Math.round(accuracy)}m</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Current Order */}
      {currentOrder && (
        <div className="p-4 bg-gray-900 m-4 rounded-lg border border-gold">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gold">Current Order</h2>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentOrder.status === 'assigned_to_driver' ? 'bg-blue-600' :
              currentOrder.status === 'picked_up' ? 'bg-yellow-600' :
              'bg-green-600'
            }`}>
              {currentOrder.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Order #{currentOrder.order_number}</p>
              <p className="font-medium">{currentOrder.buyer_name}</p>
              <p className="text-sm text-gray-400">{currentOrder.buyer_phone}</p>
            </div>

            <div className="bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-400 mb-2">Pickup</p>
              <p className="text-sm">{currentOrder.pickup_address}</p>
            </div>

            <div className="bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-400 mb-2">Delivery</p>
              <p className="text-sm">{currentOrder.delivery_address}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gold font-semibold">
                ${currentOrder.total_amount.toFixed(2)}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => callBuyer(currentOrder.buyer_phone)}
                  className="p-2 bg-blue-600 rounded-full"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => messageBuyer(currentOrder.id)}
                  className="p-2 bg-green-600 rounded-full"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {currentOrder.status === 'assigned_to_driver' && (
                <button
                  onClick={() => handlePhotoCapture('pickup')}
                  className="flex-1 bg-gold text-black py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Pickup Photo</span>
                </button>
              )}

              {currentOrder.status === 'picked_up' && (
                <button
                  onClick={() => handlePhotoCapture('delivery')}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Deliver & Photo</span>
                </button>
              )}

              {currentOrder.status === 'assigned_to_driver' && (
                <button
                  onClick={() => updateOrderStatus(currentOrder.id, 'picked_up')}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold"
                >
                  Mark Picked Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gold">Recent Orders</h3>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">#{order.order_number}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'assigned_to_driver' ? 'bg-blue-600' :
                  order.status === 'picked_up' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400">{order.buyer_name}</p>
              <p className="text-sm text-gray-400">{order.pickup_address}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gold font-semibold">${order.total_amount.toFixed(2)}</span>
                <span className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {driverProfile && (
        <div className="p-4 bg-gray-900 m-4 rounded-lg border border-gold">
          <h3 className="text-lg font-semibold mb-4 text-gold">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">{driverProfile.total_deliveries}</p>
              <p className="text-sm text-gray-400">Total Deliveries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">${driverProfile.total_earnings.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Total Earnings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">{driverProfile.rating.toFixed(1)}</p>
              <p className="text-sm text-gray-400">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">{orders.length}</p>
              <p className="text-sm text-gray-400">Active Orders</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gold">
              Capture {photoType === 'pickup' ? 'Pickup' : 'Delivery'} Photo
            </h3>

            {photoData ? (
              <div className="mb-4">
                <img src={photoData} alt="Preview" className="w-full rounded" />
              </div>
            ) : (
              <div className="mb-4 p-8 border-2 border-dashed border-gray-600 rounded text-center">
                <Camera className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-400">Click to capture photo</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-gold text-black py-2 px-4 rounded font-semibold"
              >
                {photoData ? 'Retake' : 'Capture'}
              </button>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}

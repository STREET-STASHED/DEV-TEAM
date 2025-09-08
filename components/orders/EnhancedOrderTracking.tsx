'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Clock, Package, Truck, CheckCircle, AlertCircle, Phone, MessageCircle, RefreshCw, Download, Share2 } from 'lucide-react'

interface OrderStatus {
  id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'returned'
  timestamp: string
  description: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  estimatedTime?: string
  actualTime?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  items: Array<{
    id: string
    name: string
    image: string
    price: number
    quantity: number
    size?: string
    color?: string
  }>
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  paymentMethod: string
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
  }
  billingAddress: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  tracking: {
    carrier: string
    trackingNumber: string
    estimatedDelivery: string
    actualDelivery?: string
  }
  driver?: {
    name: string
    phone: string
    photo: string
    rating: number
    vehicle: string
    licensePlate: string
  }
  timeline: OrderStatus[]
  createdAt: string
  updatedAt: string
}

interface EnhancedOrderTrackingProps {
  orderId: string
  onStatusUpdate?: (_status: string) => void
  onContactSupport?: () => void
  onReorder?: (_orderId: string) => void
  onReturn?: (_orderId: string) => void
}

export default function EnhancedOrderTracking({
  orderId,
  onStatusUpdate: _onStatusUpdate,
  onContactSupport,
  onReorder,
  onReturn
}: EnhancedOrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_showMap, _setShowMap] = useState(false)
  const [_driverLocation, _setDriverLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock order data
  const mockOrder: Order = {
    id: orderId,
    orderNumber: 'SS-2024-001234',
    status: 'in_transit',
    items: [
      {
        id: '1',
        name: 'Nike Air Jordan 1 Retro High',
        image: '/mock/sneakers-1.jpg',
        price: 299.99,
        quantity: 1,
        size: '10',
        color: 'Red/White/Black'
      },
      {
        id: '2',
        name: 'Supreme Box Logo Hoodie',
        image: '/mock/hoodie-1.jpg',
        price: 450.00,
        quantity: 1,
        size: 'L',
        color: 'Red'
      }
    ],
    total: 749.99,
    subtotal: 749.99,
    shipping: 0,
    tax: 0,
    discount: 0,
    paymentMethod: 'Visa ending in 4242',
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+1 (555) 123-4567'
    },
    billingAddress: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    },
    tracking: {
      carrier: 'StreetStashed Delivery',
      trackingNumber: 'SS123456789',
      estimatedDelivery: '2024-02-15T18:00:00Z'
    },
    driver: {
      name: 'Mike Johnson',
      phone: '+1 (555) 987-6543',
      photo: '/mock/driver-1.jpg',
      rating: 4.8,
      vehicle: 'Honda Civic',
      licensePlate: 'ABC-123'
    },
    timeline: [
      {
        id: '1',
        status: 'pending',
        timestamp: '2024-02-10T10:00:00Z',
        description: 'Order placed successfully',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: '123 Main St, New York, NY 10001'
        }
      },
      {
        id: '2',
        status: 'confirmed',
        timestamp: '2024-02-10T10:30:00Z',
        description: 'Order confirmed by seller',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: '123 Main St, New York, NY 10001'
        }
      },
      {
        id: '3',
        status: 'preparing',
        timestamp: '2024-02-10T14:00:00Z',
        description: 'Seller is preparing your order',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: '123 Main St, New York, NY 10001'
        }
      },
      {
        id: '4',
        status: 'picked_up',
        timestamp: '2024-02-11T09:00:00Z',
        description: 'Order picked up by driver',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: '123 Main St, New York, NY 10001'
        }
      },
      {
        id: '5',
        status: 'in_transit',
        timestamp: '2024-02-11T10:00:00Z',
        description: 'Order is on the way',
        location: {
          lat: 40.7589,
          lng: -73.9851,
          address: '456 Broadway, New York, NY 10013'
        },
        estimatedTime: '2024-02-15T18:00:00Z'
      }
    ],
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-11T10:00:00Z'
  }

  // Load order data
  const loadOrderData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOrder(mockOrder)
      
      // Simulate driver location updates
      if (mockOrder.status === 'in_transit' && mockOrder.driver) {
        _setDriverLocation({
          lat: 40.7589 + (Math.random() - 0.5) * 0.01,
          lng: -73.9851 + (Math.random() - 0.5) * 0.01
        })
      }
    } catch (err) {
      setError('Failed to load order details')
      console.error('Failed to load order:', err)
    } finally {
      setIsLoading(false)
    }
  }, [mockOrder])

  // Refresh order status
  const refreshOrderStatus = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await loadOrderData()
    } catch (err) {
      console.error('Failed to refresh order:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [loadOrderData])

  useEffect(() => {
    loadOrderData()
  }, [loadOrderData])

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />
      case 'preparing':
        return <Package className="w-5 h-5 text-orange-400" />
      case 'picked_up':
        return <Truck className="w-5 h-5 text-purple-400" />
      case 'in_transit':
        return <Truck className="w-5 h-5 text-green-400" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'returned':
        return <RefreshCw className="w-5 h-5 text-gray-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400'
      case 'confirmed':
        return 'text-blue-400'
      case 'preparing':
        return 'text-orange-400'
      case 'picked_up':
        return 'text-purple-400'
      case 'in_transit':
        return 'text-green-400'
      case 'delivered':
        return 'text-green-500'
      case 'cancelled':
        return 'text-red-400'
      case 'returned':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get estimated delivery time
  const getEstimatedDelivery = () => {
    if (!order) return null
    
    const estimated = new Date(order.tracking.estimatedDelivery)
    const now = new Date()
    const diffHours = Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffHours <= 0) return 'Delivered'
    if (diffHours < 24) return `${diffHours} hours`
    const diffDays = Math.ceil(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`
  }

  if (isLoading) {
    return (
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <div className="animate-pulse">
          <div className="h-8 bg-ink-800 rounded mb-4"></div>
          <div className="h-4 bg-ink-800 rounded mb-2"></div>
          <div className="h-4 bg-ink-800 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Unable to load order</h3>
        <p className="text-ink-400 mb-4">{error || 'Order not found'}</p>
        <button
          onClick={loadOrderData}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Order Tracking</h2>
            <p className="text-ink-400">Order #{order.orderNumber}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshOrderStatus}
              disabled={isRefreshing}
              className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="text-lg font-semibold capitalize">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          {order.status === 'in_transit' && (
            <div className="text-ink-400">
              Estimated delivery: {getEstimatedDelivery()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Order Timeline */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Order Timeline</h3>
          <div className="space-y-4">
            {order.timeline.map((status, index) => (
              <div key={status.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === order.timeline.length - 1 ? 'bg-purple-500' : 'bg-ink-800'
                  }`}>
                    {getStatusIcon(status.status)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-semibold ${getStatusColor(status.status)}`}>
                      {status.description}
                    </span>
                    {status.estimatedTime && (
                      <span className="text-ink-400 text-sm">
                        (ETA: {formatDate(status.estimatedTime)})
                      </span>
                    )}
                  </div>
                  <p className="text-ink-400 text-sm">
                    {formatDate(status.timestamp)}
                  </p>
                  {status.location && (
                    <p className="text-ink-500 text-sm mt-1">
                      📍 {status.location.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Driver Info */}
          {order.driver && order.status === 'in_transit' && (
            <div className="mt-8 bg-ink-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Your Driver</h4>
              <div className="flex items-center space-x-4">
                <img
                  src={order.driver.photo}
                  alt={order.driver.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold">{order.driver.name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-ink-400 text-sm">({order.driver.rating})</span>
                  </div>
                  <p className="text-ink-400 text-sm mb-2">
                    {order.driver.vehicle} • {order.driver.licensePlate}
                  </p>
                  <div className="flex space-x-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Call Driver</span>
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 bg-ink-800 rounded-lg p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-ink-400 text-xs">
                      Qty: {item.quantity} • ${item.price}
                    </p>
                    {(item.size || item.color) && (
                      <p className="text-ink-500 text-xs">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="bg-ink-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-ink-300">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-300">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-ink-300">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-ink-700 pt-2">
                <div className="flex justify-between text-white font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-ink-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{order.shippingAddress.name}</p>
                  <p className="text-ink-300 text-sm">{order.shippingAddress.address}</p>
                  <p className="text-ink-300 text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p className="text-ink-400 text-sm">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => onContactSupport?.()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contact Support</span>
            </button>
            
            {order.status === 'delivered' && (
              <>
                <button
                  onClick={() => onReorder?.(order.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Reorder Items
                </button>
                <button
                  onClick={() => onReturn?.(order.id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Return
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

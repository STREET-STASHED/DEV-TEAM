'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPinIcon, ClockIcon, UserIcon, PhoneIcon, CheckCircleIcon, TruckIcon } from '@heroicons/react/24/outline'

export interface OrderTrackingData {
  orderId: string
  status: 'pending' | 'confirmed' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
  estimatedDelivery: Date
  actualDelivery?: Date
  driver?: {
    id: string
    name: string
    phone: string
    photo?: string
    rating: number
    vehicleType: 'bike' | 'scooter' | 'car' | 'van'
    vehicleInfo: string
  }
  location?: {
    lat: number
    lng: number
    address: string
    lastUpdated: Date
  }
  timeline: TrackingEvent[]
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    instructions?: string
  }
  pickupAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    image: string
  }>
}

export interface TrackingEvent {
  id: string
  status: string
  message: string
  timestamp: Date
  location?: {
    lat: number
    lng: number
    address: string
  }
  estimatedTime?: Date
}

interface RealTimeOrderTrackingProps {
  orderId: string
  onStatusUpdate?: (_status: string) => void
}

const STATUS_CONFIG = {
  pending: {
    label: 'Order Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: ClockIcon,
    description: 'Your order is being processed'
  },
  confirmed: {
    label: 'Order Confirmed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: CheckCircleIcon,
    description: 'Order confirmed and being prepared'
  },
  preparing: {
    label: 'Preparing Order',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: ClockIcon,
    description: 'Seller is preparing your items'
  },
  picked_up: {
    label: 'Picked Up',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: TruckIcon,
    description: 'Driver has picked up your order'
  },
  in_transit: {
    label: 'In Transit',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: TruckIcon,
    description: 'Your order is on the way'
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircleIcon,
    description: 'Order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: ClockIcon,
    description: 'Order has been cancelled'
  }
}

export default function RealTimeOrderTracking({ orderId, onStatusUpdate }: RealTimeOrderTrackingProps) {
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_mapCenter, _setMapCenter] = useState<{ lat: number; lng: number } | null>(null)

  // Fetch tracking data
  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}/tracking`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracking data')
      }

      const data = await response.json()
      setTrackingData(data)
      
      if (data.location) {
        setMapCenter(data.location)
      }

      if (onStatusUpdate) {
        onStatusUpdate(data.status)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data')
    } finally {
      setLoading(false)
    }
  }, [orderId, onStatusUpdate])

  // Set up real-time updates
  useEffect(() => {
    fetchTrackingData()

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(`wss://your-websocket-url/orders/${orderId}`)
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        setTrackingData(prev => {
          if (!prev) return prev
          
          return {
            ...prev,
            ...update,
            timeline: [...prev.timeline, ...(update.timeline || [])]
          }
        })

        if (update.location) {
          setMapCenter(update.location)
        }

        if (update.status && onStatusUpdate) {
          onStatusUpdate(update.status)
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [orderId, fetchTrackingData, onStatusUpdate])

  // Poll for updates every 30 seconds as fallback
  useEffect(() => {
    const interval = setInterval(fetchTrackingData, 30000)
    return () => clearInterval(interval)
  }, [fetchTrackingData])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading tracking information...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-2">Error loading tracking data</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <button
          onClick={fetchTrackingData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!trackingData) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-600">No tracking data available</div>
      </div>
    )
  }

  const currentStatus = STATUS_CONFIG[trackingData.status]
  const _StatusIcon = currentStatus.icon

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Order #{trackingData.orderId}</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.bgColor} ${currentStatus.color}`}>
            {currentStatus.label}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>Estimated delivery: {trackingData.estimatedDelivery.toLocaleString()}</span>
          </div>
          {trackingData.actualDelivery && (
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Delivered: {trackingData.actualDelivery.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
            
            <div className="space-y-4">
              {trackingData.timeline.map((event, index) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.message}</div>
                    <div className="text-sm text-gray-500">
                      {event.timestamp.toLocaleString()}
                    </div>
                    {event.location && (
                      <div className="text-sm text-gray-600 mt-1">
                        <MapPinIcon className="h-4 w-4 inline mr-1" />
                        {event.location.address}
                      </div>
                    )}
                    {event.estimatedTime && (
                      <div className="text-sm text-blue-600 mt-1">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        ETA: {event.estimatedTime.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Information */}
          {trackingData.driver && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Your Driver</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {trackingData.driver.photo ? (
                    <img
                      src={trackingData.driver.photo}
                      alt={trackingData.driver.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{trackingData.driver.name}</div>
                  <div className="text-sm text-gray-600">{trackingData.driver.vehicleInfo}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(trackingData.driver.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      ({trackingData.driver.rating.toFixed(1)})
                    </span>
                  </div>
                </div>
                
                <a
                  href={`tel:${trackingData.driver.phone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
            <div className="text-sm text-gray-600">
              <div>{trackingData.deliveryAddress.street}</div>
              <div>
                {trackingData.deliveryAddress.city}, {trackingData.deliveryAddress.state} {trackingData.deliveryAddress.zipCode}
              </div>
              {trackingData.deliveryAddress.instructions && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <strong>Instructions:</strong> {trackingData.deliveryAddress.instructions}
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {trackingData.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Location (if available) */}
          {trackingData.location && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Current Location</h3>
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1 mb-2">
                  <MapPinIcon className="h-4 w-4" />
                  {trackingData.location.address}
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {trackingData.location.lastUpdated.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

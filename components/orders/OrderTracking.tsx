'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  MapPinIcon, 
  ClockIcon, 
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface OrderTrackingProps {
  orderId: string
  onStatusUpdate?: (status: string) => void
}

interface OrderStatus {
  id: string
  order_id: string
  status: string
  timestamp: string
  driver_id?: string
  driver_name?: string
  driver_phone?: string
  location?: string
  notes?: string
}

interface Order {
  id: string
  status: string
  buyer_id: string
  driver_id?: string
  pickup_address: string
  delivery_address: string
  total_amount: number
  delivery_fee: number
  created_at: string
  assigned_at?: string
  picked_up_at?: string
  delivered_at?: string
  driver_name?: string
  driver_phone?: string
  driver_rating?: number
  estimated_delivery?: string
}

const STATUS_STEPS = [
  { key: 'order_placed', label: 'Order Placed', icon: CheckCircleIcon, color: 'text-green-500' },
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircleIcon, color: 'text-green-500' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: CheckCircleIcon, color: 'text-green-500' },
  { key: 'assigned_to_driver', label: 'Driver Assigned', icon: TruckIcon, color: 'text-blue-500' },
  { key: 'picked_up', label: 'Picked Up', icon: TruckIcon, color: 'text-purple-500' },
  { key: 'in_transit', label: 'In Transit', icon: TruckIcon, color: 'text-indigo-500' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon, color: 'text-green-500' }
]

export default function OrderTracking({ orderId, onStatusUpdate }: OrderTrackingProps) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const [order, setOrder] = useState<Order | null>(null)
  const [statusHistory, setStatusHistory] = useState<OrderStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState<string>('')
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    loadOrderData()
    const interval = setInterval(loadOrderData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [orderId])

  const loadOrderData = async () => {
    try {
      // Load order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          driver:driver_profiles!orders_driver_id_fkey(full_name, phone, rating, last_location)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) {
        console.error('Failed to load order:', orderError)
        return
      }

      if (orderData) {
        const formattedOrder = {
          ...orderData,
          driver_name: orderData.driver?.full_name,
          driver_phone: orderData.driver?.phone,
          driver_rating: orderData.driver?.rating
        }
        setOrder(formattedOrder)
        
        // Update current step
        const stepIndex = STATUS_STEPS.findIndex(step => step.key === formattedOrder.status)
        setCurrentStep(Math.max(0, stepIndex))
        
        // Calculate estimated delivery time
        if (formattedOrder.status === 'picked_up' || formattedOrder.status === 'in_transit') {
          calculateEstimatedDelivery(formattedOrder)
        }
        
        // Update driver location if available
        if (formattedOrder.driver?.last_location) {
          setDriverLocation(formattedOrder.driver.last_location)
        }
      }

      // Load status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true })

      if (historyError) {
        console.error('Failed to load status history:', historyError)
      } else if (historyData) {
        setStatusHistory(historyData)
      }
    } catch (error) {
      console.error('Failed to load order data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateEstimatedDelivery = (orderData: Order) => {
    if (!orderData.picked_up_at) return

    const pickupTime = new Date(orderData.picked_up_at)
    const now = new Date()
    const timeDiff = now.getTime() - pickupTime.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    // Estimate 1-2 hours for delivery
    const estimatedHours = Math.max(1, Math.min(2, 2 - hoursDiff))
    const estimatedTime = new Date(now.getTime() + (estimatedHours * 60 * 60 * 1000))
    
    setEstimatedTime(estimatedTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }))
  }

  const getStatusIcon = (status: string, index: number) => {
    const step = STATUS_STEPS.find(s => s.key === status)
    if (!step) return null

    const Icon = step.icon
    const isCompleted = index <= currentStep
    const isCurrent = index === currentStep

    if (isCompleted) {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />
    } else if (isCurrent) {
      return <TruckIcon className="w-6 h-6 text-blue-500" />
    } else {
      return <div className="w-6 h-6 border-2 border-ink-400 rounded-full" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500'
      case 'cancelled':
        return 'text-red-500'
      case 'picked_up':
      case 'in_transit':
        return 'text-blue-500'
      case 'assigned_to_driver':
        return 'text-purple-500'
      default:
        return 'text-ink-400'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank')
  }

  const callDriver = () => {
    if (order?.driver_phone) {
      window.open(`tel:${order.driver_phone}`, '_self')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <span className="ml-3 text-ink-300">Loading order status...</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Order Not Found</h3>
        <p className="text-ink-400">Unable to load order information.</p>
      </div>
    )
  }

  return (
    <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
      {/* Order Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Order #{order.id.slice(0, 8)}</h2>
          <p className="text-ink-400">Placed on {formatTimestamp(order.created_at)}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          <div className="text-ink-400 text-sm">Current Status</div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(step.key, index)}
              </div>
              <div className="text-center">
                <div className={`text-xs font-medium ${
                  index <= currentStep ? 'text-white' : 'text-ink-400'
                }`}>
                  {step.label}
                </div>
              </div>
              {index < STATUS_STEPS.length - 1 && (
                <div className={`w-full h-0.5 mt-2 ${
                  index < currentStep ? 'bg-green-500' : 'bg-ink-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Driver Information */}
      {order.driver_id && (
        <div className="bg-ink-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{order.driver_name || 'Driver'}</h4>
                <div className="flex items-center space-x-2">
                  {order.driver_rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-ink-300 text-sm">{order.driver_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="text-ink-400 text-sm">•</span>
                  <span className="text-ink-400 text-sm">Assigned</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={callDriver}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <PhoneIcon className="w-4 h-4 inline mr-2" />
                Call Driver
              </button>
              <button className="bg-ink-700 hover:bg-ink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-2" />
                Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estimated Delivery */}
      {estimatedTime && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-white">Estimated Delivery</h4>
              <p className="text-green-400">Around {estimatedTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pickup Address */}
        <div className="bg-ink-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPinIcon className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-white">Pickup Location</h4>
          </div>
          <p className="text-ink-300 mb-2">{order.pickup_address}</p>
          <button
            onClick={() => openMaps(order.pickup_address)}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            View on Map
          </button>
        </div>

        {/* Delivery Address */}
        <div className="bg-ink-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPinIcon className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-white">Delivery Location</h4>
          </div>
          <p className="text-ink-300 mb-2">{order.delivery_address}</p>
          <button
            onClick={() => openMaps(order.delivery_address)}
            className="text-green-400 hover:text-green-300 text-sm transition-colors"
          >
            View on Map
          </button>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-ink-800 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-white mb-3">Order Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink-400">Order Total:</span>
            <span className="text-white ml-2">${order.total_amount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-ink-400">Delivery Fee:</span>
            <span className="text-white ml-2">${order.delivery_fee.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-ink-400">Order Date:</span>
            <span className="text-white ml-2">{formatTimestamp(order.created_at)}</span>
          </div>
          {order.assigned_at && (
            <div>
              <span className="text-ink-400">Driver Assigned:</span>
              <span className="text-white ml-2">{formatTimestamp(order.assigned_at)}</span>
            </div>
          )}
          {order.picked_up_at && (
            <div>
              <span className="text-ink-400">Picked Up:</span>
              <span className="text-white ml-2">{formatTimestamp(order.picked_up_at)}</span>
            </div>
          )}
          {order.delivered_at && (
            <div>
              <span className="text-ink-400">Delivered:</span>
              <span className="text-white ml-2">{formatTimestamp(order.delivered_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      {statusHistory.length > 0 && (
        <div className="bg-ink-800 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Status Updates</h4>
          <div className="space-y-3">
            {statusHistory.map((status, index) => (
              <div key={status.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {status.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-ink-400 text-sm">
                      {formatTimestamp(status.timestamp)}
                    </span>
                  </div>
                  {status.notes && (
                    <p className="text-ink-300 text-sm mt-1">{status.notes}</p>
                  )}
                  {status.location && (
                    <p className="text-ink-400 text-xs mt-1">📍 {status.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={() => openMaps(`${order.pickup_address} to ${order.delivery_address}`)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          View Route
        </button>
        {order.driver_phone && (
          <button
            onClick={callDriver}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contact Driver
          </button>
        )}
        <button className="bg-ink-700 hover:bg-ink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Get Support
        </button>
      </div>
    </div>
  )
}

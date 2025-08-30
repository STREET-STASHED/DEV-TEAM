'use client'

import {
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    TruckIcon
} from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

interface AvailableOrder {
  id: string
  status: string
  totalAmount: number
  distanceMiles: number
  pickupAddress: string
  deliveryAddress: string
  createdAt: string
  customerName: string
  customerPhone: string
  estimatedEarnings: number
}

interface AvailableOrdersProps {
  onOrderAccepted?: (_orderId: string) => void
}

export default function AvailableOrders({ onOrderAccepted }: AvailableOrdersProps) {
  const [orders, setOrders] = useState<AvailableOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAvailableOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/driver/available-orders')
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        setError(data.error || 'Failed to load orders')
      }
    } catch (err) {
      setError('Failed to load available orders')
      console.error('Error loading orders:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const acceptOrder = useCallback(async (_orderId: string) => {
    try {
      const response = await fetch('/api/orders/assign-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: _orderId,
          driverId: 'current-user-id' // This should come from auth context
        })
      })

      if (response.ok) {
        // Remove order from available list
        setOrders(prev => prev.filter(order => order.id !== _orderId))

        // Notify parent component
        onOrderAccepted?.(_orderId)

        // Show success message
        alert('Order accepted successfully! 🚚')
      } else {
        const errorData = await response.json()
        alert(`Failed to accept order: ${errorData.error}`)
      }
    } catch (err) {
      alert('Failed to accept order. Please try again.')
      console.error('Error accepting order:', err)
    }
  }, [onOrderAccepted])

  useEffect(() => {
    loadAvailableOrders()

    // Refresh every 30 seconds
    const interval = setInterval(loadAvailableOrders, 30000)
    return () => clearInterval(interval)
  }, [loadAvailableOrders])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-ink-800/50 rounded-xl p-6 mb-4">
              <div className="h-6 bg-ink-700 rounded mb-3"></div>
              <div className="h-4 bg-ink-700 rounded mb-2"></div>
              <div className="h-4 bg-ink-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">⚠️ {error}</div>
        <button
          onClick={loadAvailableOrders}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <TruckIcon className="w-16 h-16 text-ink-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-ink-300 mb-2">No Orders Available</h3>
        <p className="text-ink-400">Check back soon for new delivery opportunities!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Available Orders</h2>
        <button
          onClick={loadAvailableOrders}
          className="text-brand-400 hover:text-brand-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {orders.map((order) => (
        <div key={order.id} className="bg-ink-800/50 rounded-xl p-6 border border-ink-700 hover:border-ink-600 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm text-ink-400">#{order.id.slice(0, 8)}</span>
                <span className="text-sm text-brand-400 font-medium">
                  ${order.estimatedEarnings.toFixed(2)} estimated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-ink-400">Pickup</p>
                    <p className="text-white text-sm">{order.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPinIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-ink-400">Delivery</p>
                    <p className="text-white text-sm">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-ink-400">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TruckIcon className="w-4 h-4" />
                  <span>{order.distanceMiles} miles</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>${order.totalAmount.toFixed(2)} order</span>
                </div>
              </div>
            </div>

            <div className="text-right ml-4">
              <div className="text-sm text-ink-400 mb-2">Customer</div>
              <div className="text-white font-medium">{order.customerName}</div>
              <div className="text-sm text-ink-400">{order.customerPhone}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-ink-700">
            <div className="text-sm text-ink-400">
              Order placed {new Date(order.createdAt).toLocaleString()}
            </div>

            <button
              onClick={() => acceptOrder(order.id)}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Accept Order</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}


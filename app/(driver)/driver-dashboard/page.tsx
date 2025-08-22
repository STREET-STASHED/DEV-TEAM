'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  LocationMarkerIcon
} from '@heroicons/react/24/outline'

interface Order {
  id: string
  status: string
  buyer_id: string
  seller_id: string
  pickup_address: string
  delivery_address: string
  total_amount: number
  delivery_fee: number
  distance_miles: number
  created_at: string
  assigned_at?: string
  picked_up_at?: string
  delivered_at?: string
  buyer_name?: string
  buyer_phone?: string
  seller_name?: string
  seller_phone?: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
}

interface DriverStats {
  totalOrders: number
  totalEarnings: number
  totalDistance: number
  averageRating: number
  completionRate: number
  activeOrders: number
  weeklyEarnings: number
  monthlyEarnings: number
}

interface EarningsBreakdown {
  baseDeliveryFee: number
  distanceBonus: number
  timeBonus: number
  tipAmount: number
  total: number
}

export default function DriverDashboardPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DriverStats>({
    totalOrders: 0,
    totalEarnings: 0,
    totalDistance: 0,
    averageRating: 0,
    completionRate: 0,
    activeOrders: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0
  })
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'distance' | 'earnings'>('created_at')
  const [isOnline, setIsOnline] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const loadDriverData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get driver profile and stats
      const { data: profile } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setIsOnline(profile.is_online || false)
        
        // Load driver stats
        const { data: earnings } = await supabase
          .from('driver_earnings')
          .select('*')
          .eq('driver_id', user.id)

        if (earnings) {
          const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.total_earnings), 0)
          const totalDistance = earnings.reduce((sum, e) => sum + (e.distance_bonus || 0), 0)
          
          setStats(prev => ({
            ...prev,
            totalEarnings,
            totalDistance,
            totalOrders: earnings.length,
            completionRate: profile.completion_rate || 100,
            averageRating: profile.rating || 5.0
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load driver data:', error)
    }
  }, [supabase])

  const loadOrders = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all orders assigned to this driver
      const { data: driverOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(full_name, phone),
          seller:profiles!orders_seller_id_fkey(full_name, phone)
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load orders:', error)
        return
      }

      if (driverOrders) {
        const formattedOrders = driverOrders.map(order => ({
          ...order,
          buyer_name: order.buyer?.full_name || 'Unknown',
          buyer_phone: order.buyer?.phone || 'N/A',
          seller_name: order.seller?.full_name || 'Unknown',
          seller_phone: order.seller?.phone || 'N/A'
        }))
        setOrders(formattedOrders)
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const startLocationTracking = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          
          // Update driver location in database
          updateDriverLocation(latitude, longitude)
        },
        (error) => {
          console.error('Location tracking failed:', error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      )
    }
  }, [])

  const updateDriverLocation = async (lat: number, lng: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('driver_profiles')
        .update({
          last_location: { lat, lng },
          last_activity: new Date().toISOString()
        })
        .eq('user_id', user.id)
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

  const toggleOnlineStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newStatus = !isOnline
      await supabase
        .from('driver_profiles')
        .update({
          is_online: newStatus,
          is_available: newStatus,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', user.id)

      setIsOnline(newStatus)
    } catch (error) {
      console.error('Failed to update online status:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const updateData: any = { status: newStatus }
      
      if (newStatus === 'picked_up') {
        updateData.picked_up_at = new Date().toISOString()
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
        updateData.status = 'delivered'
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) {
        console.error('Failed to update order status:', error)
        return
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...updateData } : order
      ))

      // Send notification to buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: orders.find(o => o.id === orderId)?.buyer_id,
          type: 'order_status_update',
          title: `Order ${newStatus.replace('_', ' ')}`,
          message: `Your order has been ${newStatus.replace('_', ' ')}`,
          data: { order_id: orderId, status: newStatus }
        })

      alert(`Order status updated to ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  const calculateEarnings = (order: Order): EarningsBreakdown => {
    const baseDeliveryFee = order.delivery_fee || 0
    const distanceBonus = (order.distance_miles || 0) * 0.50 // $0.50 per mile
    const timeBonus = 0 // Could be calculated based on delivery time
    const tipAmount = 0 // Would come from buyer
    const total = baseDeliveryFee + distanceBonus + timeBonus + tipAmount

    return {
      baseDeliveryFee,
      distanceBonus,
      timeBonus,
      tipAmount,
      total
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ready_for_pickup':
        return 'bg-yellow-500 text-black'
      case 'assigned_to_driver':
        return 'bg-blue-500 text-white'
      case 'picked_up':
        return 'bg-purple-500 text-white'
      case 'in_transit':
        return 'bg-indigo-500 text-white'
      case 'delivered':
        return 'bg-green-500 text-white'
      case 'cancelled':
        return 'bg-red-500 text-white'
      default:
        return 'bg-ink-600 text-white'
    }
  }

  const getStatusText = (status: Order['status']) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'active':
        return ['assigned_to_driver', 'picked_up', 'in_transit'].includes(order.status)
      case 'completed':
        return order.status === 'delivered'
      case 'pending':
        return order.status === 'ready_for_pickup'
      default:
        return true
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return b.distance_miles - a.distance_miles
      case 'earnings':
        return calculateEarnings(b).total - calculateEarnings(a).total
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  // Load driver data
  useEffect(() => {
    loadDriverData()
    loadOrders()
    startLocationTracking()
  }, [loadDriverData, loadOrders, startLocationTracking])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-ink-300">Loading driver dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🚚 Driver Dashboard</h1>
              <p className="text-ink-300">Manage your deliveries and track your earnings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <button
                onClick={toggleOnlineStatus}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isOnline 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-ink-800 border-b border-ink-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Orders */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-blue-400">{stats.totalOrders}</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Total Orders</h3>
              <p className="text-ink-400 text-sm">All time</p>
            </div>

            {/* Total Earnings */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-green-400">${stats.totalEarnings.toFixed(2)}</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Total Earnings</h3>
              <p className="text-ink-400 text-sm">All time</p>
            </div>

            {/* Average Rating */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-2xl font-bold text-yellow-400">{stats.averageRating.toFixed(1)}</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Average Rating</h3>
              <p className="text-ink-400 text-sm">From customers</p>
            </div>

            {/* Completion Rate */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-purple-400">{stats.completionRate}%</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Completion Rate</h3>
              <p className="text-ink-400 text-sm">Orders completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex space-x-1">
              {[
                { id: 'all', name: 'All Orders' },
                { id: 'active', name: 'Active' },
                { id: 'pending', name: 'Pending' },
                { id: 'completed', name: 'Completed' }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
                  }`}
                >
                  {filterOption.name}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-ink-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="created_at">Date</option>
                <option value="distance">Distance</option>
                <option value="earnings">Earnings</option>
              </select>
            </div>

            {/* Location Status */}
            {currentLocation && (
              <div className="flex items-center space-x-2 text-sm text-ink-300">
                <LocationMarkerIcon className="w-4 h-4" />
                <span>Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Your Orders</h2>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <TruckIcon className="w-12 h-12 text-ink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No orders found</h3>
            <p className="text-ink-300 mb-6">
              {filter === 'all' ? 'You haven\'t been assigned any orders yet.' : `No ${filter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-ink-900 rounded-xl p-6 border border-ink-800 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <span className="text-ink-400 text-sm">Order #{order.id.slice(0, 8)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      ${calculateEarnings(order).total.toFixed(2)}
                    </div>
                    <div className="text-ink-400 text-sm">Earnings</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Pickup Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-blue-400" />
                      <span>Pickup Location</span>
                    </h4>
                    <p className="text-ink-300">{order.seller_name}</p>
                    <p className="text-ink-400 text-sm">{order.pickup_address}</p>
                    <p className="text-ink-400 text-sm">{order.seller_phone}</p>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-green-400" />
                      <span>Delivery Location</span>
                    </h4>
                    <p className="text-ink-300">{order.buyer_name}</p>
                    <p className="text-ink-400 text-sm">{order.delivery_address}</p>
                    <p className="text-ink-400 text-sm">{order.buyer_phone}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{order.distance_miles.toFixed(1)}</div>
                    <div className="text-ink-400 text-sm">Miles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{order.items.length}</div>
                    <div className="text-ink-400 text-sm">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">${order.total_amount.toFixed(2)}</div>
                    <div className="text-ink-400 text-sm">Order Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-400">${order.delivery_fee.toFixed(2)}</div>
                    <div className="text-ink-400 text-sm">Delivery Fee</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status === 'assigned_to_driver' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'picked_up')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Mark as Picked Up
                    </button>
                  </div>
                )}

                {order.status === 'picked_up' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  </div>
                )}

                {/* Order Items */}
                <div className="mt-4 p-4 bg-ink-800 rounded-lg">
                  <h5 className="font-semibold text-white mb-3">Order Items</h5>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-ink-300">{item.name} x{item.quantity}</span>
                        <span className="text-ink-400">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

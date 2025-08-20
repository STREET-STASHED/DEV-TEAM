'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  status: 'pending_payment' | 'ready_for_pickup' | 'assigned_to_driver' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
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
  items: any[]
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
  baseDelivery: number
  distanceBonus: number
  timeBonus: number
  tipAmount: number
  total: number
}

export default function DriverDashboardPage() {
  const router = useRouter()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
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

  // Load driver data
  useEffect(() => {
    loadDriverData()
    loadOrders()
    startLocationTracking()
  }, [])

  const loadDriverData = async () => {
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
      }
    } catch (error) {
      console.error('Failed to load driver data:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get orders assigned to this driver
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(full_name, phone),
          seller:profiles!orders_seller_id_fkey(full_name, phone),
          order_items(*)
        `)
        .or(`driver_id.eq.${user.id},status.eq.ready_for_pickup`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const processedOrders = ordersData?.map(order => ({
        ...order,
        buyer_name: order.buyer?.full_name,
        buyer_phone: order.buyer?.phone,
        seller_name: order.seller?.full_name,
        seller_phone: order.seller?.phone,
        items: order.order_items || []
      })) || []

      setOrders(processedOrders)
      calculateStats(processedOrders)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load orders:', error)
      setIsLoading(false)
    }
  }

  const calculateStats = (ordersData: Order[]) => {
    const totalOrders = ordersData.length
    const completedOrders = ordersData.filter(o => o.status === 'delivered').length
    const activeOrders = ordersData.filter(o => ['assigned_to_driver', 'picked_up', 'in_transit'].includes(o.status)).length
    
    const totalEarnings = ordersData
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.delivery_fee * 0.70), 0)
    
    const totalDistance = ordersData.reduce((sum, o) => sum + o.distance_miles, 0)
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

    // Calculate weekly and monthly earnings
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const weeklyEarnings = ordersData
      .filter(o => o.status === 'delivered' && new Date(o.delivered_at!) >= weekAgo)
      .reduce((sum, o) => sum + (o.delivery_fee * 0.70), 0)

    const monthlyEarnings = ordersData
      .filter(o => o.status === 'delivered' && new Date(o.delivered_at!) >= monthAgo)
      .reduce((sum, o) => sum + (o.delivery_fee * 0.70), 0)

    setStats({
      totalOrders,
      totalEarnings,
      totalDistance,
      averageRating: 4.8, // Would come from reviews table
      completionRate,
      activeOrders,
      weeklyEarnings,
      monthlyEarnings
    })
  }

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Location error:', error)
        }
      )
    }
  }

  const toggleOnlineStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newStatus = !isOnline
      setIsOnline(newStatus)

      // Update driver profile
      await supabase
        .from('driver_profiles')
        .upsert({
          user_id: user.id,
          is_online: newStatus,
          last_location: currentLocation ? JSON.stringify(currentLocation) : null,
          updated_at: new Date().toISOString()
        })

      // If going online, check for available orders
      if (newStatus) {
        loadOrders()
      }
    } catch (error) {
      console.error('Failed to update online status:', error)
    }
  }

  const acceptOrder = async (order: Order) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: user.id,
          status: 'assigned_to_driver',
          assigned_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (error) throw error

      // Refresh orders
      loadOrders()
      
      // Send notification to buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: order.buyer_id,
          type: 'order_assigned',
          title: 'Driver Assigned!',
          message: `Your order has been assigned to a driver and is being prepared for pickup.`,
          data: { order_id: order.id }
        })

    } catch (error) {
      console.error('Failed to accept order:', error)
      alert('Failed to accept order')
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updateData: any = { status: newStatus }
      
      switch (newStatus) {
        case 'picked_up':
          updateData.picked_up_at = new Date().toISOString()
          break
        case 'delivered':
          updateData.delivered_at = new Date().toISOString()
          break
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      // Refresh orders
      loadOrders()

      // Send notification to buyer
      const order = orders.find(o => o.id === orderId)
      if (order) {
        await supabase
          .from('notifications')
          .insert({
            user_id: order.buyer_id,
            type: 'order_status_update',
            title: 'Order Update',
            message: `Your order status has been updated to: ${newStatus.replace('_', ' ')}`,
            data: { order_id: orderId, status: newStatus }
          })
      }

    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  const calculateEarnings = (order: Order): EarningsBreakdown => {
    const baseDelivery = order.delivery_fee * 0.70
    const distanceBonus = order.distance_miles > 10 ? 2 : 0
    const timeBonus = new Date().getHours() >= 22 ? 1.5 : 0
    const tipAmount = 0 // Would come from order data
    const total = baseDelivery + distanceBonus + timeBonus + tipAmount

    return {
      baseDelivery,
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
    <div className="min-h-screen bg-ink-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Online Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Driver Dashboard</h1>
              <p className="text-ink-300">
                Manage your deliveries, track earnings, and stay connected with buyers and sellers.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-ink-300 text-sm">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <button
                onClick={toggleOnlineStatus}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isOnline 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-ink-800 rounded-lg p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-2">Today's Orders</h3>
            <p className="text-3xl font-bold text-brand-500">{stats.activeOrders}</p>
            <p className="text-ink-400 text-sm">Active deliveries</p>
          </div>

          <div className="bg-ink-800 rounded-lg p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-2">Weekly Earnings</h3>
            <p className="text-3xl font-bold text-brand-500">${stats.weeklyEarnings.toFixed(2)}</p>
            <p className="text-ink-400 text-sm">This week</p>
          </div>

          <div className="bg-ink-800 rounded-lg p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-2">Total Distance</h3>
            <p className="text-3xl font-bold text-brand-500">
              {stats.totalDistance.toFixed(1)} mi
            </p>
            <p className="text-ink-400 text-sm">Lifetime</p>
          </div>

          <div className="bg-ink-800 rounded-lg p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-brand-500">{stats.completionRate.toFixed(0)}%</p>
            <p className="text-ink-400 text-sm">Orders completed</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex space-x-2">
            {(['all', 'active', 'completed', 'pending'] as const).map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-brand-600 text-ink-black'
                    : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-ink-400 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-ink-800 border border-ink-700 rounded-md text-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="created_at">Date</option>
              <option value="distance">Distance</option>
              <option value="earnings">Earnings</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-ink-200 mb-2">No orders found</h3>
              <p className="text-ink-400">Check back later for new delivery opportunities</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const earnings = calculateEarnings(order)
              return (
                <div key={order.id} className="bg-ink-800 rounded-lg p-6 border border-ink-700 hover:border-ink-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                      <p className="text-ink-400 text-sm">
                        Created: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {order.buyer_name && (
                        <p className="text-ink-300 text-sm">
                          Buyer: {order.buyer_name} • {order.buyer_phone}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-ink-300 mb-2">Pickup Address</h4>
                      <p className="text-white text-sm">{order.pickup_address}</p>
                      {order.seller_name && (
                        <p className="text-ink-400 text-xs mt-1">
                          Seller: {order.seller_name} • {order.seller_phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-ink-300 mb-2">Delivery Address</h4>
                      <p className="text-white text-sm">{order.delivery_address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-ink-700 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-ink-400 mb-1">Order Value</h5>
                      <p className="text-white font-semibold">${order.total_amount}</p>
                    </div>
                    <div className="bg-ink-700 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-ink-400 mb-1">Distance</h5>
                      <p className="text-white font-semibold">{order.distance_miles} mi</p>
                    </div>
                    <div className="bg-ink-700 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-ink-400 mb-1">Your Earnings</h5>
                      <p className="text-brand-500 font-semibold">${earnings.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  <div className="mb-4 p-3 bg-ink-700 rounded-lg">
                    <h5 className="text-xs font-medium text-ink-400 mb-2">Earnings Breakdown</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-ink-400">Base:</span>
                        <span className="text-white ml-1">${earnings.baseDelivery.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">Distance:</span>
                        <span className="text-white ml-1">${earnings.distanceBonus.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">Time:</span>
                        <span className="text-white ml-1">${earnings.timeBonus.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">Tip:</span>
                        <span className="text-white ml-1">${earnings.tipAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-ink-700">
                    <div className="flex space-x-2">
                      {order.status === 'ready_for_pickup' && (
                        <button
                          onClick={() => acceptOrder(order)}
                          className="px-4 py-2 bg-brand-600 text-ink-black rounded-lg hover:bg-brand-500 transition-colors text-sm font-medium"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.status === 'assigned_to_driver' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'picked_up')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                        >
                          Mark Picked Up
                        </button>
                      )}
                      {order.status === 'picked_up' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'in_transit')}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium"
                        >
                          Start Delivery
                        </button>
                      )}
                      {order.status === 'in_transit' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-2 border border-ink-600 text-ink-300 rounded-lg hover:bg-ink-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => window.open(`https://maps.google.com/?saddr=${order.pickup_address}&daddr=${order.delivery_address}`, '_blank')}
                        className="px-3 py-2 bg-ink-700 text-white rounded-lg hover:bg-ink-600 transition-colors text-sm"
                      >
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Location Status */}
        {currentLocation && (
          <div className="mt-8 p-4 bg-ink-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Location Services</h3>
            <p className="text-ink-300 text-sm">
              Your location is being tracked to help with order assignments and route optimization.
            </p>
            <p className="text-ink-400 text-xs mt-2">
              Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

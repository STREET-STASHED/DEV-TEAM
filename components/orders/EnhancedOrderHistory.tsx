'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Download, Eye, RefreshCw, Star, ShoppingCart, Package, Truck, CheckCircle, X, Clock } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  size?: string
  color?: string
  brand?: string
  category?: string
}

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'returned'
  items: OrderItem[]
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
  }
  tracking: {
    carrier: string
    trackingNumber: string
    estimatedDelivery: string
    actualDelivery?: string
  }
  createdAt: string
  updatedAt: string
  deliveredAt?: string
  canReturn: boolean
  canReorder: boolean
  rating?: number
  review?: string
}

interface EnhancedOrderHistoryProps {
  onOrderSelect?: (_order: Order) => void
  onReorder?: (_order: Order) => void
  onReturn?: (_order: Order) => void
  onReview?: (_order: Order) => void
}

export default function EnhancedOrderHistory({
  onOrderSelect,
  onReorder,
  onReturn,
  onReview
}: EnhancedOrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data
  const mockOrders: Order[] = useMemo(() => [
    {
      id: '1',
      orderNumber: 'SS-2024-001234',
      status: 'delivered',
      items: [
        {
          id: '1',
          name: 'Nike Air Jordan 1 Retro High',
          image: '/mock/sneakers-1.jpg',
          price: 299.99,
          quantity: 1,
          size: '10',
          color: 'Red/White/Black',
          brand: 'Nike',
          category: 'Sneakers'
        },
        {
          id: '2',
          name: 'Supreme Box Logo Hoodie',
          image: '/mock/hoodie-1.jpg',
          price: 450.00,
          quantity: 1,
          size: 'L',
          color: 'Red',
          brand: 'Supreme',
          category: 'Streetwear'
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
        zip: '10001'
      },
      tracking: {
        carrier: 'StreetStashed Delivery',
        trackingNumber: 'SS123456789',
        estimatedDelivery: '2024-02-15T18:00:00Z',
        actualDelivery: '2024-02-15T16:30:00Z'
      },
      createdAt: '2024-02-10T10:00:00Z',
      updatedAt: '2024-02-15T16:30:00Z',
      deliveredAt: '2024-02-15T16:30:00Z',
      canReturn: true,
      canReorder: true,
      rating: 5,
      review: 'Great products, fast delivery!'
    },
    {
      id: '2',
      orderNumber: 'SS-2024-001235',
      status: 'in_transit',
      items: [
        {
          id: '3',
          name: 'Vintage Denim Jacket',
          image: '/mock/jacket-1.jpg',
          price: 180.00,
          quantity: 1,
          size: 'M',
          color: 'Blue',
          brand: 'Levi\'s',
          category: 'Vintage'
        }
      ],
      total: 180.00,
      subtotal: 180.00,
      shipping: 0,
      tax: 0,
      discount: 0,
      paymentMethod: 'PayPal',
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      },
      tracking: {
        carrier: 'StreetStashed Delivery',
        trackingNumber: 'SS123456790',
        estimatedDelivery: '2024-02-20T18:00:00Z'
      },
      createdAt: '2024-02-18T14:30:00Z',
      updatedAt: '2024-02-19T09:15:00Z',
      canReturn: true,
      canReorder: true
    },
    {
      id: '3',
      orderNumber: 'SS-2024-001236',
      status: 'cancelled',
      items: [
        {
          id: '4',
          name: 'Off-White T-Shirt',
          image: '/mock/tshirt-1.jpg',
          price: 120.00,
          quantity: 2,
          size: 'L',
          color: 'White',
          brand: 'Off-White',
          category: 'Streetwear'
        }
      ],
      total: 240.00,
      subtotal: 240.00,
      shipping: 0,
      tax: 0,
      discount: 0,
      paymentMethod: 'Mastercard ending in 5678',
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      },
      tracking: {
        carrier: 'StreetStashed Delivery',
        trackingNumber: 'SS123456791',
        estimatedDelivery: '2024-02-25T18:00:00Z'
      },
      createdAt: '2024-02-20T11:45:00Z',
      updatedAt: '2024-02-20T15:20:00Z',
      canReturn: false,
      canReorder: true
    }
  ], [])

  useEffect(() => {
    // Load orders
    setIsLoading(true)
    setTimeout(() => {
      setOrders(mockOrders)
      setFilteredOrders(mockOrders)
      setIsLoading(false)
    }, 1000)
  }, [mockOrders])

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
        )
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    const now = new Date()
    if (dateFilter !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        switch (dateFilter) {
          case 'last_7_days':
            return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          case 'last_30_days':
            return orderDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          case 'last_3_months':
            return orderDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          case 'last_year':
            return orderDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'price_high':
          return b.total - a.total
        case 'price_low':
          return a.total - b.total
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter, dateFilter, sortBy])

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'preparing':
        return <Package className="w-4 h-4 text-orange-400" />
      case 'picked_up':
        return <Truck className="w-4 h-4 text-purple-400" />
      case 'in_transit':
        return <Truck className="w-4 h-4 text-green-400" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <X className="w-4 h-4 text-red-400" />
      case 'returned':
        return <RefreshCw className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get order summary stats
  const getOrderStats = () => {
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

    return {
      totalOrders,
      totalSpent,
      deliveredOrders,
      averageOrderValue
    }
  }

  const stats = getOrderStats()

  if (isLoading) {
    return (
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-ink-800 rounded mb-4"></div>
          <div className="h-4 bg-ink-800 rounded mb-2"></div>
          <div className="h-4 bg-ink-800 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Order History</h2>
            <p className="text-ink-400">View and manage your past orders</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
            <div className="text-ink-400 text-sm">Total Orders</div>
          </div>
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</div>
            <div className="text-ink-400 text-sm">Total Spent</div>
          </div>
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.deliveredOrders}</div>
            <div className="text-ink-400 text-sm">Delivered</div>
          </div>
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">${stats.averageOrderValue.toFixed(2)}</div>
            <div className="text-ink-400 text-sm">Avg Order Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 border-b border-ink-700 bg-ink-800/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">All Time</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-ink-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-ink-300 mb-2">No orders found</h3>
            <p className="text-ink-400">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You haven\'t placed any orders yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-ink-800 rounded-xl p-6 border border-ink-700 hover:border-purple-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="font-semibold capitalize">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-ink-400 text-sm">
                      Order #{order.orderNumber}
                    </div>
                    <div className="text-ink-400 text-sm">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      ${order.total.toFixed(2)}
                    </div>
                    <div className="text-ink-400 text-sm">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-ink-700 rounded-lg p-3">
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
                          ${item.price} • Qty: {item.quantity}
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

                {/* Order Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-ink-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onOrderSelect?.(order)}
                      className="flex items-center space-x-2 text-ink-400 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    
                    {order.canReorder && (
                      <button
                        onClick={() => onReorder?.(order)}
                        className="flex items-center space-x-2 text-ink-400 hover:text-white transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Reorder</span>
                      </button>
                    )}
                    
                    {order.canReturn && order.status === 'delivered' && (
                      <button
                        onClick={() => onReturn?.(order)}
                        className="flex items-center space-x-2 text-ink-400 hover:text-white transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Return</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {order.status === 'delivered' && !order.rating && (
                      <button
                        onClick={() => onReview?.(order)}
                        className="flex items-center space-x-2 text-ink-400 hover:text-white transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    )}
                    
                    {order.rating && (
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < order.rating! 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-ink-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-ink-400 text-sm ml-2">Reviewed</span>
                      </div>
                    )}
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

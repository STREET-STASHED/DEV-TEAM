'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export interface SellerAnalytics {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    conversionRate: number
    averageOrderValue: number
    totalViews: number
    totalFavorites: number
    rating: number
    reviewCount: number
  }
  sales: {
    daily: Array<{ date: string; revenue: number; orders: number }>
    weekly: Array<{ week: string; revenue: number; orders: number }>
    monthly: Array<{ month: string; revenue: number; orders: number }>
  }
  products: {
    topSelling: Array<{
      id: string
      name: string
      image: string
      sales: number
      revenue: number
      views: number
      conversionRate: number
    }>
    lowStock: Array<{
      id: string
      name: string
      image: string
      currentStock: number
      reorderPoint: number
      urgency: 'low' | 'medium' | 'high' | 'critical'
    }>
    performance: Array<{
      id: string
      name: string
      views: number
      favorites: number
      sales: number
      revenue: number
      rating: number
      conversionRate: number
    }>
  }
  inventory: {
    totalValue: number
    turnoverRate: number
    lowStockCount: number
    outOfStockCount: number
    reorderSuggestions: number
  }
  alerts: Array<{
    id: string
    type: 'low_stock' | 'out_of_stock' | 'price_alert' | 'performance_alert'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: Date
    resolved: boolean
  }>
  trends: {
    revenueGrowth: number
    orderGrowth: number
    productGrowth: number
    conversionGrowth: number
  }
}

interface AdvancedSellerDashboardProps {
  sellerId: string
  onProductClick?: (_productId: string) => void
  onAlertClick?: (_alertId: string) => void
}

export default function AdvancedSellerDashboard({ 
  sellerId, 
  onProductClick, 
  onAlertClick: _onAlertClick 
}: AdvancedSellerDashboardProps) {
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'analytics'>('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/seller/analytics?sellerId=${sellerId}&timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [sellerId, timeRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-2">Error loading analytics</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-600">No analytics data available</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  const formatNumber = (num: number) => num.toLocaleString()
  const formatPercentage = (num: number) => `${(num * 100).toFixed(1)}%`

  const getTrendIcon = (value: number) => {
    if (value > 0) return <span className="text-green-500">↗</span>
    if (value < 0) return <span className="text-red-500">↘</span>
    return <span className="text-gray-400">→</span>
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your performance and optimize your business</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'products', label: 'Products' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.trends.revenueGrowth)}
                  <span className="text-sm text-gray-600">{formatPercentage(analytics.trends.revenueGrowth)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalOrders)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.trends.orderGrowth)}
                  <span className="text-sm text-gray-600">{formatPercentage(analytics.trends.orderGrowth)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics.overview.conversionRate)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.trends.conversionGrowth)}
                  <span className="text-sm text-gray-600">{formatPercentage(analytics.trends.conversionGrowth)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.averageOrderValue)}</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Alerts */}
          {analytics.alerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {analytics.alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.resolved ? 'opacity-50' : ''
                    }`}
                    style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f97316' : alert.severity === 'medium' ? '#eab308' : '#3b82f6' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-500">{alert.timestamp.toLocaleString()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertColor(alert.severity)}`}>
                        {alert.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <EyeIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(analytics.overview.totalViews)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <HeartIcon className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorites</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(analytics.overview.totalFavorites)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <StarIcon className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-xl font-bold text-gray-900">
                    {analytics.overview.rating.toFixed(1)} ({formatNumber(analytics.overview.reviewCount)} reviews)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <div className="space-y-4">
              {analytics.products.topSelling.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onProductClick?.(product.id)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatNumber(product.sales)} sales</span>
                      <span>{formatCurrency(product.revenue)} revenue</span>
                      <span>{formatPercentage(product.conversionRate)} conversion</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-gray-500">{formatNumber(product.views)} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
            <div className="space-y-3">
              {analytics.products.lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {product.currentStock} units remaining (reorder at {product.reorderPoint})
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                    product.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                    product.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {product.urgency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.inventory.totalValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.inventory.turnoverRate.toFixed(1)}x</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.inventory.lowStockCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.inventory.outOfStockCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reorder Suggestions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Reorder Suggestions</h3>
            <p className="text-gray-600">You have {analytics.inventory.reorderSuggestions} products that need reordering</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Reorder List
            </button>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Sales charts will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

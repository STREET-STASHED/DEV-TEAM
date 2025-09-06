'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart3, PieChart, TrendingUp, Users, Star, Eye, Download, RefreshCw, Filter } from 'lucide-react'

interface KPI {
  id: string
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  target?: number
  unit: string
  category: 'revenue' | 'users' | 'orders' | 'satisfaction'
}

interface ChartData {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  period: string
}

interface TopPerformer {
  id: string
  name: string
  value: number
  change: number
  category: string
  rank: number
}

interface BusinessIntelligenceDashboardProps {
  onExport?: (_type: string) => void
  onRefresh?: () => void
}

export default function BusinessIntelligenceDashboard({
  onExport: _onExport,
  onRefresh
}: BusinessIntelligenceDashboardProps) {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [charts, setCharts] = useState<ChartData[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data
  const mockKPIs: KPI[] = useMemo(() => [
    {
      id: 'revenue',
      name: 'Total Revenue',
      value: 1247500,
      change: 12.5,
      trend: 'up',
      target: 1000000,
      unit: '$',
      category: 'revenue'
    },
    {
      id: 'orders',
      name: 'Total Orders',
      value: 8947,
      change: 8.3,
      trend: 'up',
      target: 10000,
      unit: '',
      category: 'orders'
    },
    {
      id: 'users',
      name: 'Active Users',
      value: 15623,
      change: 15.7,
      trend: 'up',
      target: 20000,
      unit: '',
      category: 'users'
    },
    {
      id: 'avg_order',
      name: 'Average Order Value',
      value: 139.50,
      change: 3.2,
      trend: 'up',
      target: 150,
      unit: '$',
      category: 'revenue'
    },
    {
      id: 'conversion',
      name: 'Conversion Rate',
      value: 3.8,
      change: -0.5,
      trend: 'down',
      target: 5.0,
      unit: '%',
      category: 'users'
    },
    {
      id: 'satisfaction',
      name: 'Customer Satisfaction',
      value: 4.6,
      change: 0.2,
      trend: 'up',
      target: 4.5,
      unit: '/5',
      category: 'satisfaction'
    },
    {
      id: 'retention',
      name: 'Customer Retention',
      value: 78.5,
      change: 2.1,
      trend: 'up',
      target: 80,
      unit: '%',
      category: 'users'
    },
    {
      id: 'refund_rate',
      name: 'Refund Rate',
      value: 2.3,
      change: -0.8,
      trend: 'down',
      target: 3.0,
      unit: '%',
      category: 'orders'
    }
  ], [])

  const mockCharts: ChartData[] = useMemo(() => [
    {
      id: 'revenue_trend',
      type: 'line',
      title: 'Revenue Trend',
      period: '30d',
      data: [
        { label: 'Week 1', value: 285000 },
        { label: 'Week 2', value: 312000 },
        { label: 'Week 3', value: 298000 },
        { label: 'Week 4', value: 352500 }
      ]
    },
    {
      id: 'category_sales',
      type: 'pie',
      title: 'Sales by Category',
      period: '30d',
      data: [
        { label: 'Sneakers', value: 45, color: '#8B5CF6' },
        { label: 'Streetwear', value: 30, color: '#06B6D4' },
        { label: 'Vintage', value: 15, color: '#10B981' },
        { label: 'Accessories', value: 10, color: '#F59E0B' }
      ]
    },
    {
      id: 'user_growth',
      type: 'area',
      title: 'User Growth',
      period: '30d',
      data: [
        { label: 'Week 1', value: 1200 },
        { label: 'Week 2', value: 1350 },
        { label: 'Week 3', value: 1420 },
        { label: 'Week 4', value: 1580 }
      ]
    },
    {
      id: 'top_products',
      type: 'bar',
      title: 'Top Products',
      period: '30d',
      data: [
        { label: 'Jordan 1', value: 89 },
        { label: 'Supreme Hoodie', value: 67 },
        { label: 'Vintage Jacket', value: 45 },
        { label: 'Yeezy 350', value: 38 },
        { label: 'Off-White Tee', value: 32 }
      ]
    }
  ], [])

  const mockTopPerformers: TopPerformer[] = useMemo(() => [
    {
      id: '1',
      name: 'Nike Air Jordan 1 Retro High',
      value: 89,
      change: 15.2,
      category: 'Sneakers',
      rank: 1
    },
    {
      id: '2',
      name: 'Supreme Box Logo Hoodie',
      value: 67,
      change: 8.7,
      category: 'Streetwear',
      rank: 2
    },
    {
      id: '3',
      name: 'Vintage Denim Jacket',
      value: 45,
      change: 22.1,
      category: 'Vintage',
      rank: 3
    },
    {
      id: '4',
      name: 'Adidas Yeezy 350 V2',
      value: 38,
      change: -5.3,
      category: 'Sneakers',
      rank: 4
    },
    {
      id: '5',
      name: 'Off-White T-Shirt',
      value: 32,
      change: 12.8,
      category: 'Streetwear',
      rank: 5
    }
  ], [])

  useEffect(() => {
    setKpis(mockKPIs)
    setCharts(mockCharts)
    setTopPerformers(mockTopPerformers)
  }, [mockKPIs, mockCharts, mockTopPerformers])

  // Handle data refresh
  const handleRefresh = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update data with slight variations
      setKpis(prev => prev.map(kpi => ({
        ...kpi,
        value: kpi.value * (0.98 + Math.random() * 0.04),
        change: kpi.change + (Math.random() - 0.5) * 2
      })))
      
      onRefresh?.()
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle export
  const handleExport = (_type: string) => {
    _onExport?.(_type)
    // Simulate export
    console.log(`Exporting data as ${_type}`)
  }

  // Get trend icon and color
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 transform rotate-180" />
      case 'stable':
        return <BarChart3 className="w-4 h-4 text-gray-400" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-400'
      case 'down':
        return 'text-red-400'
      case 'stable':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  // Format value based on unit
  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`
    }
    if (unit === '/5') {
      return `${value.toFixed(1)}/5`
    }
    return value.toLocaleString()
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Business Intelligence Dashboard</h2>
              <p className="text-ink-400">Comprehensive analytics and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button
              onClick={() => handleExport('pdf')}
              className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="bg-ink-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink-400 text-sm">{kpi.name}</span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(kpi.trend)}
                  <span className={`text-sm font-semibold ${getTrendColor(kpi.trend)}`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-white mb-1">
                {formatValue(kpi.value, kpi.unit)}
              </div>
              
              {kpi.target && (
                <div className="flex items-center justify-between text-xs text-ink-400">
                  <span>Target: {formatValue(kpi.target, kpi.unit)}</span>
                  <span>
                    {((kpi.value / kpi.target) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Trend Chart */}
          <div className="bg-ink-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-ink-400 text-sm">Revenue</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {charts.find(c => c.id === 'revenue_trend')?.data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-ink-300 text-sm">{item.label}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-ink-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / 400000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-ink-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
              <PieChart className="w-5 h-5 text-ink-400" />
            </div>
            
            <div className="space-y-3">
              {charts.find(c => c.id === 'category_sales')?.data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-ink-300 text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-ink-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth */}
          <div className="bg-ink-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">User Growth</h3>
              <Users className="w-5 h-5 text-ink-400" />
            </div>
            
            <div className="space-y-3">
              {charts.find(c => c.id === 'user_growth')?.data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-ink-300 text-sm">{item.label}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-ink-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / 2000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-ink-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Products</h3>
              <Star className="w-5 h-5 text-ink-400" />
            </div>
            
            <div className="space-y-3">
              {charts.find(c => c.id === 'top_products')?.data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-ink-400 text-sm">#{index + 1}</span>
                    <span className="text-ink-300 text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-ink-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="bg-ink-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Performing Products</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-ink-400" />
              <span className="text-ink-400 text-sm">Last 30 days</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="text-left text-ink-400 text-sm font-medium py-3">Rank</th>
                  <th className="text-left text-ink-400 text-sm font-medium py-3">Product</th>
                  <th className="text-left text-ink-400 text-sm font-medium py-3">Category</th>
                  <th className="text-left text-ink-400 text-sm font-medium py-3">Sales</th>
                  <th className="text-left text-ink-400 text-sm font-medium py-3">Change</th>
                  <th className="text-left text-ink-400 text-sm font-medium py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((performer) => (
                  <tr key={performer.id} className="border-b border-ink-700/50">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-ink-400 text-sm">#{performer.rank}</span>
                        {performer.rank <= 3 && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-white font-medium text-sm">
                        {performer.name}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-ink-400 text-sm">{performer.category}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-white font-semibold text-sm">
                        {performer.value}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(performer.change > 0 ? 'up' : 'down')}
                        <span className={`text-sm font-semibold ${
                          performer.change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {performer.change > 0 ? '+' : ''}{performer.change.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <button className="text-ink-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-ink-800 hover:bg-ink-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-ink-800 hover:bg-ink-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-ink-800 hover:bg-ink-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  )
}

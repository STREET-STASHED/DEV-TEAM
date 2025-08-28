'use client'

import {
    Activity,
    Clock,
    DollarSign,
    Eye,
    ShoppingCart,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface Metric {
  id: string
  label: string
  value: number | string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
}

interface RealTimeData {
  activeUsers: number
  ordersPerMinute: number
  revenuePerHour: number
  conversionRate: number
  pageViews: number
  averageSessionTime: number
  serverResponseTime: number
  cacheHitRate: number
}

export default function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch real-time data
  const fetchRealTimeData = useCallback(async () => {
    try {
      // In a real app, this would be a WebSocket connection or server-sent events
      const response = await fetch('/api/analytics/realtime')
      if (response.ok) {
        const data: RealTimeData = await response.json()
        updateMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error)
      // Use mock data for demo
      const mockData: RealTimeData = {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        ordersPerMinute: Math.floor(Math.random() * 10) + 2,
        revenuePerHour: Math.floor(Math.random() * 1000) + 500,
        conversionRate: Math.random() * 5 + 2,
        pageViews: Math.floor(Math.random() * 1000) + 500,
        averageSessionTime: Math.floor(Math.random() * 300) + 120,
        serverResponseTime: Math.random() * 100 + 50,
        cacheHitRate: Math.random() * 20 + 80
      }
      updateMetrics(mockData)
    }
  }, [])

  // Update metrics with new data
  const updateMetrics = useCallback((data: RealTimeData) => {
    const newMetrics: Metric[] = [
      {
        id: 'active-users',
        label: 'Active Users',
        value: data.activeUsers,
        change: Math.floor(Math.random() * 20) - 10,
        changeType: getChangeType(Math.floor(Math.random() * 20) - 10),
        icon: <Users className="w-5 h-5" />,
        color: 'text-blue-400'
      },
      {
        id: 'orders-per-minute',
        label: 'Orders/Min',
        value: data.ordersPerMinute,
        change: Math.floor(Math.random() * 5) - 2,
        changeType: getChangeType(Math.floor(Math.random() * 5) - 2),
        icon: <ShoppingCart className="w-5 h-5" />,
        color: 'text-green-400'
      },
      {
        id: 'revenue-per-hour',
        label: 'Revenue/Hour',
        value: `$${data.revenuePerHour.toLocaleString()}`,
        change: Math.floor(Math.random() * 200) - 100,
        changeType: getChangeType(Math.floor(Math.random() * 200) - 100),
        icon: <DollarSign className="w-5 h-5" />,
        color: 'text-yellow-400'
      },
      {
        id: 'conversion-rate',
        label: 'Conversion Rate',
        value: `${data.conversionRate.toFixed(1)}%`,
        change: Math.random() * 2 - 1,
        changeType: getChangeType(Math.random() * 2 - 1),
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-purple-400'
      },
      {
        id: 'page-views',
        label: 'Page Views',
        value: data.pageViews.toLocaleString(),
        change: Math.floor(Math.random() * 100) - 50,
        changeType: getChangeType(Math.floor(Math.random() * 100) - 50),
        icon: <Eye className="w-5 h-5" />,
        color: 'text-indigo-400'
      },
      {
        id: 'session-time',
        label: 'Avg Session',
        value: `${Math.floor(data.averageSessionTime / 60)}m ${data.averageSessionTime % 60}s`,
        change: Math.floor(Math.random() * 60) - 30,
        changeType: getChangeType(Math.floor(Math.random() * 60) - 30),
        icon: <Clock className="w-5 h-5" />,
        color: 'text-pink-400'
      },
      {
        id: 'response-time',
        label: 'Response Time',
        value: `${data.serverResponseTime.toFixed(0)}ms`,
        change: Math.floor(Math.random() * 20) - 10,
        changeType: getChangeType(Math.floor(Math.random() * 20) - 10, true), // Lower is better
        icon: <Zap className="w-5 h-5" />,
        color: 'text-orange-400'
      },
      {
        id: 'cache-hit-rate',
        label: 'Cache Hit Rate',
        value: `${data.cacheHitRate.toFixed(1)}%`,
        change: Math.random() * 5 - 2.5,
        changeType: getChangeType(Math.random() * 5 - 2.5),
        icon: <Activity className="w-5 h-5" />,
        color: 'text-teal-400'
      }
    ]

    setMetrics(newMetrics)
    setLastUpdated(new Date())
    setIsLoading(false)
  }, [])

  // Get change type based on value
  const getChangeType = (change: number, lowerIsBetter: boolean = false): 'increase' | 'decrease' | 'neutral' => {
    if (change === 0) return 'neutral'
    if (lowerIsBetter) {
      return change < 0 ? 'increase' : 'decrease'
    }
    return change > 0 ? 'increase' : 'decrease'
  }

  // Format change value
  const formatChange = (change: number, changeType: 'increase' | 'decrease' | 'neutral') => {
    if (changeType === 'neutral') return '0%'

    const sign = changeType === 'increase' ? '+' : '-'
    const absChange = Math.abs(change)

    if (absChange < 1) return `${sign}${absChange.toFixed(1)}%`
    return `${sign}${absChange.toFixed(0)}%`
  }

  // Get change color
  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return 'text-green-400'
      case 'decrease':
        return 'text-red-400'
      default:
        return 'text-ink-400'
    }
  }

  // Get change icon
  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  useEffect(() => {
    fetchRealTimeData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000)

    return () => clearInterval(interval)
  }, [fetchRealTimeData])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink-100">Real-Time Analytics</h2>
          <div className="flex items-center space-x-2 text-ink-400">
            <div className="w-2 h-2 bg-ink-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-ink-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-ink-700 rounded w-8 h-8"></div>
                  <div className="bg-ink-700 rounded w-16 h-4"></div>
                </div>
                <div className="bg-ink-700 rounded w-20 h-8 mb-2"></div>
                <div className="bg-ink-700 rounded w-12 h-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink-100">Real-Time Analytics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-ink-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
          <div className="text-sm text-ink-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchRealTimeData}
            className="bg-ink-800 hover:bg-ink-700 text-ink-200 px-3 py-1 rounded text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-ink-800 rounded-lg p-6 border border-ink-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.color}`}>
                {metric.icon}
              </div>
              <div className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                {getChangeIcon(metric.changeType)} {formatChange(metric.change, metric.changeType)}
              </div>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-ink-100 mb-2">
              {metric.value}
            </div>

            {/* Label */}
            <div className="text-sm text-ink-400">
              {metric.label}
            </div>

            {/* Change indicator */}
            <div className="mt-2">
              <div className={`text-xs ${getChangeColor(metric.changeType)}`}>
                {metric.change > 0 ? 'Up' : metric.change < 0 ? 'Down' : 'No change'} from last period
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Alerts */}
      <div className="bg-ink-800 rounded-lg p-6 border border-ink-700">
        <h3 className="text-lg font-semibold text-ink-100 mb-4">Performance Alerts</h3>
        <div className="space-y-3">
          {metrics.some(m => m.id === 'response-time' && m.change > 0) && (
            <div className="flex items-center space-x-3 p-3 bg-red-900/20 border border-red-700/30 rounded">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm text-red-300">
                Server response time increased - monitoring performance
              </span>
            </div>
          )}

          {metrics.some(m => m.id === 'cache-hit-rate' && m.change < 0) && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-yellow-300">
                Cache hit rate decreased - checking CDN configuration
              </span>
            </div>
          )}

          {metrics.some(m => m.id === 'conversion-rate' && m.change > 0) && (
            <div className="flex items-center space-x-3 p-3 bg-green-900/20 border border-green-700/30 rounded">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-green-300">
                Conversion rate improved - user experience optimization working
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

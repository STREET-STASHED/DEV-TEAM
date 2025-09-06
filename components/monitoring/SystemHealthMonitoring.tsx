'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, Server, Clock, RefreshCw, Settings, Bell } from 'lucide-react'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  threshold: {
    warning: number
    critical: number
  }
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
}

interface ServiceStatus {
  id: string
  name: string
  status: 'online' | 'degraded' | 'offline'
  uptime: number
  responseTime: number
  lastCheck: string
  description: string
}

interface Alert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  service: string
}

interface SystemHealthMonitoringProps {
  onAlert?: (_alert: Alert) => void
  onRefresh?: () => void
}

export default function SystemHealthMonitoring({
  onAlert: _onAlert,
  onRefresh
}: SystemHealthMonitoringProps) {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Mock data
  const mockMetrics: SystemMetric[] = [
    {
      id: 'cpu_usage',
      name: 'CPU Usage',
      value: 45.2,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 70, critical: 90 },
      trend: 'stable',
      lastUpdated: '2 minutes ago'
    },
    {
      id: 'memory_usage',
      name: 'Memory Usage',
      value: 68.5,
      unit: '%',
      status: 'warning',
      threshold: { warning: 65, critical: 85 },
      trend: 'up',
      lastUpdated: '1 minute ago'
    },
    {
      id: 'disk_usage',
      name: 'Disk Usage',
      value: 42.1,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 80, critical: 95 },
      trend: 'stable',
      lastUpdated: '3 minutes ago'
    },
    {
      id: 'network_latency',
      name: 'Network Latency',
      value: 23.4,
      unit: 'ms',
      status: 'healthy',
      threshold: { warning: 100, critical: 200 },
      trend: 'down',
      lastUpdated: '30 seconds ago'
    },
    {
      id: 'database_connections',
      name: 'Database Connections',
      value: 156,
      unit: '',
      status: 'healthy',
      threshold: { warning: 200, critical: 300 },
      trend: 'stable',
      lastUpdated: '1 minute ago'
    },
    {
      id: 'api_response_time',
      name: 'API Response Time',
      value: 89.2,
      unit: 'ms',
      status: 'healthy',
      threshold: { warning: 500, critical: 1000 },
      trend: 'down',
      lastUpdated: '45 seconds ago'
    }
  ]

  const mockServices: ServiceStatus[] = [
    {
      id: 'api_gateway',
      name: 'API Gateway',
      status: 'online',
      uptime: 99.9,
      responseTime: 45,
      lastCheck: '30 seconds ago',
      description: 'Main API gateway service'
    },
    {
      id: 'database',
      name: 'Database',
      status: 'online',
      uptime: 99.8,
      responseTime: 12,
      lastCheck: '15 seconds ago',
      description: 'Primary database cluster'
    },
    {
      id: 'auth_service',
      name: 'Authentication Service',
      status: 'online',
      uptime: 99.7,
      responseTime: 78,
      lastCheck: '1 minute ago',
      description: 'User authentication and authorization'
    },
    {
      id: 'payment_service',
      name: 'Payment Service',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 234,
      lastCheck: '2 minutes ago',
      description: 'Payment processing service'
    },
    {
      id: 'notification_service',
      name: 'Notification Service',
      status: 'online',
      uptime: 99.6,
      responseTime: 67,
      lastCheck: '45 seconds ago',
      description: 'Push notifications and emails'
    },
    {
      id: 'search_service',
      name: 'Search Service',
      status: 'online',
      uptime: 99.4,
      responseTime: 123,
      lastCheck: '1 minute ago',
      description: 'Product search and filtering'
    }
  ]

  const mockAlerts: Alert[] = [
    {
      id: '1',
      severity: 'medium',
      title: 'High Memory Usage',
      description: 'Memory usage has exceeded 65% threshold',
      timestamp: '5 minutes ago',
      resolved: false,
      service: 'System'
    },
    {
      id: '2',
      severity: 'low',
      title: 'Payment Service Degraded',
      description: 'Payment service response time increased',
      timestamp: '10 minutes ago',
      resolved: false,
      service: 'Payment Service'
    },
    {
      id: '3',
      severity: 'high',
      title: 'Database Connection Pool Full',
      description: 'Database connection pool reached 90% capacity',
      timestamp: '15 minutes ago',
      resolved: true,
      service: 'Database'
    }
  ]

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update metrics with slight variations
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        lastUpdated: 'Just now'
      })))
      
      onRefresh?.()
    } catch (error) {
      console.error('Failed to refresh system health:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMetrics(mockMetrics)
    setServices(mockServices)
    setAlerts(mockAlerts)
  }, [mockMetrics, mockServices, mockAlerts])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, handleRefresh])

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'critical':
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-400'
      case 'warning':
      case 'degraded':
        return 'text-yellow-400'
      case 'critical':
      case 'offline':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-orange-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-500/20'
      case 'medium':
        return 'bg-yellow-500/20'
      case 'high':
        return 'bg-orange-500/20'
      case 'critical':
        return 'bg-red-500/20'
      default:
        return 'bg-gray-500/20'
    }
  }

  // Format value
  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`
    }
    if (unit === 'ms') {
      return `${value.toFixed(1)}ms`
    }
    return value.toLocaleString()
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">System Health Monitoring</h2>
              <p className="text-ink-400">Real-time system metrics and service status</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-purple-500 bg-ink-800 border-ink-700 rounded focus:ring-purple-500"
              />
              <label htmlFor="auto-refresh" className="text-ink-400 text-sm">
                Auto-refresh
              </label>
            </div>
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

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Overall Status</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">Healthy</div>
            <div className="text-ink-400 text-sm">All systems operational</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Active Alerts</span>
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {alerts.filter(a => !a.resolved).length}
            </div>
            <div className="text-ink-400 text-sm">Requires attention</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Uptime</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">99.7%</div>
            <div className="text-ink-400 text-sm">Last 30 days</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* System Metrics */}
          <div className="bg-ink-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">System Metrics</h3>
              <Settings className="w-5 h-5 text-ink-400" />
            </div>
            
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="bg-ink-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(metric.status)}
                      <span className="text-white font-medium text-sm">{metric.name}</span>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(metric.status)}`}>
                      {formatValue(metric.value, metric.unit)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-ink-600 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metric.status === 'critical' ? 'bg-red-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (metric.value / metric.threshold.critical) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-ink-400">
                    <span>Threshold: {metric.threshold.warning}{metric.unit} / {metric.threshold.critical}{metric.unit}</span>
                    <span>{metric.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-ink-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Service Status</h3>
              <Server className="w-5 h-5 text-ink-400" />
            </div>
            
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="bg-ink-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      <span className="text-white font-medium text-sm">{service.name}</span>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(service.status)}`}>
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-ink-400 text-xs mb-2">{service.description}</div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-ink-400">Uptime: </span>
                      <span className="text-white">{service.uptime}%</span>
                    </div>
                    <div>
                      <span className="text-ink-400">Response: </span>
                      <span className="text-white">{service.responseTime}ms</span>
                    </div>
                  </div>
                  
                  <div className="text-ink-400 text-xs mt-2">
                    Last check: {service.lastCheck}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-ink-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-ink-400" />
              <span className="text-ink-400 text-sm">
                {alerts.filter(a => !a.resolved).length} active
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {alerts.filter(a => !a.resolved).map((alert) => (
              <div key={alert.id} className={`rounded-lg p-4 ${getSeverityBg(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'critical' ? 'bg-red-400' :
                      alert.severity === 'high' ? 'bg-orange-400' :
                      alert.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-semibold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-ink-400 text-sm">{alert.service}</span>
                      </div>
                      <h4 className="text-white font-medium text-sm mb-1">{alert.title}</h4>
                      <p className="text-ink-300 text-sm">{alert.description}</p>
                    </div>
                  </div>
                  <div className="text-ink-400 text-xs">
                    {alert.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {alerts.filter(a => !a.resolved).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-ink-400">No active alerts</p>
                <p className="text-ink-500 text-sm">All systems are running smoothly</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  trend: 'up' | 'down' | 'stable'
  threshold: {
    warning: number
    critical: number
  }
  lastUpdated: string
  history: Array<{
    timestamp: string
    value: number
  }>
}

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  uptime: number
  responseTime: number
  lastIncident?: {
    title: string
    timestamp: string
    duration: string
  }
  dependencies: string[]
}

interface Alert {
  id: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  service: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
}

interface RealTimeMonitoringProps {
  onAlertClick?: (_alert: Alert) => void
  onServiceClick?: (_service: ServiceStatus) => void
}

export default function RealTimeMonitoring({
  onAlertClick,
  onServiceClick
}: RealTimeMonitoringProps) {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Mock data
  const mockMetrics: SystemMetric[] = useMemo(() => [
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      threshold: { warning: 70, critical: 90 },
      lastUpdated: new Date().toISOString(),
      history: []
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 62,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      threshold: { warning: 80, critical: 95 },
      lastUpdated: new Date().toISOString(),
      history: []
    },
    {
      id: 'disk',
      name: 'Disk Usage',
      value: 78,
      unit: '%',
      status: 'warning',
      trend: 'up',
      threshold: { warning: 75, critical: 90 },
      lastUpdated: new Date().toISOString(),
      history: []
    },
    {
      id: 'network',
      name: 'Network I/O',
      value: 23,
      unit: 'Mbps',
      status: 'healthy',
      trend: 'stable',
      threshold: { warning: 80, critical: 95 },
      lastUpdated: new Date().toISOString(),
      history: []
    },
    {
      id: 'active_users',
      name: 'Active Users',
      value: 1247,
      unit: 'users',
      status: 'healthy',
      trend: 'up',
      threshold: { warning: 2000, critical: 3000 },
      lastUpdated: new Date().toISOString(),
      history: []
    },
    {
      id: 'requests_per_second',
      name: 'Requests/sec',
      value: 156,
      unit: 'req/s',
      status: 'healthy',
      trend: 'stable',
      threshold: { warning: 500, critical: 800 },
      lastUpdated: new Date().toISOString(),
      history: []
    },
    {
      id: 'response_time',
      name: 'Avg Response Time',
      value: 245,
      unit: 'ms',
      status: 'healthy',
      trend: 'down',
      threshold: { warning: 1000, critical: 2000 },
      lastUpdated: new Date().toISOString(),
      history: []
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      value: 0.8,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      threshold: { warning: 5, critical: 10 },
      lastUpdated: new Date().toISOString(),
      history: []
    }
  ], [])

  const mockServices: ServiceStatus[] = useMemo(() => [
    {
      id: 'api',
      name: 'API Gateway',
      status: 'operational',
      uptime: 99.9,
      responseTime: 45,
      dependencies: ['database', 'redis']
    },
    {
      id: 'database',
      name: 'Database',
      status: 'operational',
      uptime: 99.8,
      responseTime: 12,
      dependencies: []
    },
    {
      id: 'redis',
      name: 'Redis Cache',
      status: 'operational',
      uptime: 99.7,
      responseTime: 2,
      dependencies: []
    },
    {
      id: 'auth',
      name: 'Authentication',
      status: 'operational',
      uptime: 99.9,
      responseTime: 23,
      dependencies: ['database']
    },
    {
      id: 'payments',
      name: 'Payment Processing',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 1200,
      lastIncident: {
        title: 'High response times detected',
        timestamp: '2024-02-15T14:30:00Z',
        duration: '45 minutes'
      },
      dependencies: ['api', 'database']
    },
    {
      id: 'notifications',
      name: 'Notification Service',
      status: 'operational',
      uptime: 99.6,
      responseTime: 67,
      dependencies: ['api']
    },
    {
      id: 'search',
      name: 'Search Engine',
      status: 'operational',
      uptime: 99.4,
      responseTime: 89,
      dependencies: ['database']
    },
    {
      id: 'storage',
      name: 'File Storage',
      status: 'operational',
      uptime: 99.8,
      responseTime: 34,
      dependencies: []
    }
  ], [])

  const mockAlerts: Alert[] = useMemo(() => [
    {
      id: '1',
      severity: 'warning',
      title: 'High CPU Usage',
      description: 'CPU usage has exceeded 70% for the past 10 minutes',
      service: 'API Gateway',
      timestamp: '2024-02-15T15:30:00Z',
      acknowledged: false,
      resolved: false
    },
    {
      id: '2',
      severity: 'error',
      title: 'Database Connection Pool Exhausted',
      description: 'All database connections are in use, new requests are queued',
      service: 'Database',
      timestamp: '2024-02-15T15:25:00Z',
      acknowledged: true,
      resolved: false
    },
    {
      id: '3',
      severity: 'critical',
      title: 'Payment Service Timeout',
      description: 'Payment processing service is not responding to requests',
      service: 'Payment Processing',
      timestamp: '2024-02-15T15:20:00Z',
      acknowledged: true,
      resolved: true
    },
    {
      id: '4',
      severity: 'info',
      title: 'Scheduled Maintenance',
      description: 'Database maintenance scheduled for tonight at 2 AM',
      service: 'Database',
      timestamp: '2024-02-15T14:00:00Z',
      acknowledged: false,
      resolved: false
    }
  ], [])

  useEffect(() => {
    setMetrics(mockMetrics)
    setServices(mockServices)
    setAlerts(mockAlerts)
  }, [mockMetrics, mockServices, mockAlerts])

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Simulate metric updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        lastUpdated: new Date().toISOString(),
        status: (() => {
          if (metric.value >= metric.threshold.critical) return 'critical'
          if (metric.value >= metric.threshold.warning) return 'warning'
          return 'healthy'
        })()
      })))

      setLastUpdate(new Date())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isLive])

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'critical':
      case 'outage':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'offline':
      case 'maintenance':
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-400'
      case 'warning':
      case 'degraded':
        return 'text-yellow-400'
      case 'critical':
      case 'outage':
        return 'text-red-400'
      case 'offline':
      case 'maintenance':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'text-blue-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-orange-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 transform rotate-180" />
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Real-Time Monitoring</h2>
              <p className="text-ink-400">Live system performance and health metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isLive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isLive ? 'Live' : 'Paused'}</span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLive ? 'animate-spin' : ''}`} />
              <span>{isLive ? 'Pause' : 'Resume'}</span>
            </button>
            <span className="text-ink-400 text-sm">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">System Status</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">Operational</div>
            <div className="text-ink-400 text-xs">All systems running</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Active Alerts</span>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {alerts.filter(a => !a.resolved).length}
            </div>
            <div className="text-ink-400 text-xs">Require attention</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Uptime</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">99.8%</div>
            <div className="text-ink-400 text-xs">Last 30 days</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Response Time</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">245ms</div>
            <div className="text-ink-400 text-xs">Average</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* System Metrics */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">System Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-ink-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{metric.name}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metric.status)}
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                
                <div className="flex items-end justify-between mb-3">
                  <div className="text-3xl font-bold text-white">
                    {metric.value}{metric.unit}
                  </div>
                  <div className={`text-sm ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </div>
                </div>
                
                <div className="w-full bg-ink-700 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metric.status === 'critical' ? 'bg-red-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, metric.value)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-ink-400">
                  <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                  <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Status */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Services Status</h3>
          <div className="space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => onServiceClick?.(service)}
                className="w-full text-left bg-ink-800 rounded-lg p-4 hover:bg-ink-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{service.name}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span className={`text-sm ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-ink-400 mb-2">
                  <span>Uptime: {service.uptime}%</span>
                  <span>{service.responseTime}ms</span>
                </div>
                
                {service.lastIncident && (
                  <div className="text-xs text-yellow-400 bg-yellow-500/10 rounded px-2 py-1">
                    {service.lastIncident.title}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="p-6 border-t border-ink-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onAlertClick?.(alert)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                alert.resolved ? 'bg-ink-800' : 'bg-red-900/20 border border-red-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-400' :
                    alert.severity === 'error' ? 'bg-orange-400' :
                    alert.severity === 'warning' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}></div>
                  <span className="text-white font-medium">{alert.title}</span>
                  {!alert.acknowledged && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-ink-400 text-sm">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <p className="text-ink-300 text-sm mb-2">{alert.description}</p>
              
              <div className="flex items-center justify-between text-xs text-ink-400">
                <span>Service: {alert.service}</span>
                <span>
                  {alert.resolved ? 'Resolved' : alert.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

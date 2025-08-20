'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface MonitoringData {
  isMonitoring: boolean
  totalMetrics: number
  recentMetrics: any[]
  alerts: any[]
  insights: any[]
  performance: {
    avgResponseTime: number
    errorRate: number
    uptime: number
  }
}

export default function AdminMonitoringPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin')
    }
  }, [isAuthenticated, user, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchMonitoringData()
      // Refresh data every 30 seconds
      const interval = setInterval(fetchMonitoringData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/admin/monitoring')
      if (response.ok) {
        const data = await response.json()
        setMonitoringData(data)
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    }
  }

  const startMonitoring = async () => {
    setIsStarting(true)
    try {
      const response = await fetch('/api/admin/monitoring/start', { method: 'POST' })
      if (response.ok) {
        await fetchMonitoringData()
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const stopMonitoring = async () => {
    setIsStopping(true)
    try {
      const response = await fetch('/api/admin/monitoring/stop', { method: 'POST' })
      if (response.ok) {
        await fetchMonitoringData()
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error)
    } finally {
      setIsStopping(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-black text-white p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-400 mx-auto"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-ink-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🤖 AI Production Monitor</h1>
          <p className="text-ink-300 text-lg">
            Real-time monitoring and AI-powered insights for production sustainability
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-ink-900 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Monitoring Control</h2>
              <p className="text-ink-400">
                Status: {monitoringData?.isMonitoring ? '🟢 Active' : '🔴 Inactive'}
              </p>
            </div>
            <div className="space-x-4">
              <button
                onClick={startMonitoring}
                disabled={isStarting || monitoringData?.isMonitoring}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isStarting ? 'Starting...' : 'Start Monitoring'}
              </button>
              <button
                onClick={stopMonitoring}
                disabled={isStopping || !monitoringData?.isMonitoring}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isStopping ? 'Stopping...' : 'Stop Monitoring'}
              </button>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        {monitoringData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-ink-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Response Time</h3>
              <p className="text-3xl font-bold text-brand-400">
                {monitoringData.performance.avgResponseTime.toFixed(0)}ms
              </p>
              <p className="text-ink-400 text-sm">Average</p>
            </div>
            
            <div className="bg-ink-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Error Rate</h3>
              <p className="text-3xl font-bold text-red-400">
                {(monitoringData.performance.errorRate * 100).toFixed(2)}%
              </p>
              <p className="text-ink-400 text-sm">Last 24h</p>
            </div>
            
            <div className="bg-ink-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Uptime</h3>
              <p className="text-3xl font-bold text-green-400">
                {monitoringData.performance.uptime.toFixed(2)}%
              </p>
              <p className="text-ink-400 text-sm">System Health</p>
            </div>
            
            <div className="bg-ink-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Total Metrics</h3>
              <p className="text-3xl font-bold text-blue-400">
                {monitoringData.totalMetrics.toLocaleString()}
              </p>
              <p className="text-ink-400 text-sm">Collected</p>
            </div>
          </div>
        )}

        {/* Alerts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Alerts */}
          <div className="bg-ink-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">🚨 Recent Alerts</h2>
            {monitoringData?.alerts && monitoringData.alerts.length > 0 ? (
              <div className="space-y-4">
                {monitoringData.alerts.slice(0, 5).map((alert: any) => (
                  <div key={alert.id} className={`border-l-4 p-4 rounded ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-900/20' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-900/20' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-900/20' :
                    'border-blue-500 bg-blue-900/20'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white">{alert.message}</p>
                        <p className="text-ink-300 text-sm mt-1">{alert.recommendation}</p>
                        <p className="text-ink-400 text-xs mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-600 text-white' :
                        alert.severity === 'high' ? 'bg-orange-600 text-white' :
                        alert.severity === 'medium' ? 'bg-yellow-600 text-black' :
                        'bg-blue-600 text-white'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-400">No alerts in the last 24 hours</p>
            )}
          </div>

          {/* AI Insights */}
          <div className="bg-ink-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">💡 AI Insights</h2>
            {monitoringData?.insights && monitoringData.insights.length > 0 ? (
              <div className="space-y-4">
                {monitoringData.insights.slice(0, 5).map((insight: any) => (
                  <div key={insight.id} className="border border-ink-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.severity === 'critical' ? 'bg-red-600 text-white' :
                        insight.severity === 'high' ? 'bg-orange-600 text-white' :
                        insight.severity === 'medium' ? 'bg-yellow-600 text-black' :
                        'bg-blue-600 text-white'
                      }`}>
                        {insight.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-ink-400 text-xs">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-white mb-2">{insight.message}</p>
                    <p className="text-ink-300 text-sm">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-400">No insights generated yet</p>
            )}
          </div>
        </div>

        {/* Recent Metrics */}
        {monitoringData?.recentMetrics && (
          <div className="bg-ink-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">📊 Recent Metrics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-700">
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">Endpoint</th>
                    <th className="text-left p-2">Response</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Users</th>
                    <th className="text-left p-2">Memory</th>
                    <th className="text-left p-2">CPU</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoringData.recentMetrics.slice(-10).reverse().map((metric: any, index: number) => (
                    <tr key={index} className="border-b border-ink-800">
                      <td className="p-2 text-ink-400">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2 font-mono text-sm">{metric.endpoint}</td>
                      <td className="p-2">
                        <span className={metric.responseTime > 1000 ? 'text-red-400' : 'text-green-400'}>
                          {metric.responseTime}ms
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          metric.statusCode >= 400 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                        }`}>
                          {metric.statusCode}
                        </span>
                      </td>
                      <td className="p-2 text-ink-300">{metric.userCount}</td>
                      <td className="p-2 text-ink-300">{metric.memoryUsage.toFixed(0)}MB</td>
                      <td className="p-2 text-ink-300">{metric.cpuUsage.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface MonitoringData {
  isMonitoring: boolean
  totalMetrics: number
  performance: {
    avgResponseTime: number
    errorRate: number
    uptime: number
  }
}

export default function AIMonitoringDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  useEffect(() => {
    fetchMonitoringData()
    const interval = setInterval(fetchMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [])

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

  return (
    <div className="bg-ink-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">🤖 AI Production Monitor</h2>
          <p className="text-ink-400">
            Status: {monitoringData?.isMonitoring ? '🟢 Active' : '🔴 Inactive'}
          </p>
        </div>
        <div className="space-x-4">
          <button
            onClick={startMonitoring}
            disabled={isStarting || monitoringData?.isMonitoring}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isStarting ? 'Starting...' : 'Start'}
          </button>
          <button
            onClick={stopMonitoring}
            disabled={isStopping || !monitoringData?.isMonitoring}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isStopping ? 'Stopping...' : 'Stop'}
          </button>
        </div>
      </div>

      {monitoringData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ink-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Response Time</h3>
            <p className="text-2xl font-bold text-brand-400">
              {monitoringData.performance.avgResponseTime.toFixed(0)}ms
            </p>
            <p className="text-ink-400 text-sm">Average</p>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Error Rate</h3>
            <p className="text-2xl font-bold text-red-400">
              {(monitoringData.performance.errorRate * 100).toFixed(2)}%
            </p>
            <p className="text-ink-400 text-sm">Last 24h</p>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Uptime</h3>
            <p className="text-2xl font-bold text-green-400">
              {monitoringData.performance.uptime.toFixed(2)}%
            </p>
            <p className="text-ink-400 text-sm">System Health</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-ink-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🎯 AI Monitoring Features</h3>
        <ul className="space-y-2 text-ink-300">
          <li>• Real-time endpoint health monitoring</li>
          <li>• AI-powered pattern detection</li>
          <li>• Automated alerting system</li>
          <li>• Performance trend analysis</li>
          <li>• User behavior tracking</li>
          <li>• Scalability insights</li>
        </ul>
      </div>
    </div>
  )
}

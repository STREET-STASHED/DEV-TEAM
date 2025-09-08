'use client'

import { useState, useEffect, useMemo } from 'react'
import { Shield, AlertTriangle, CheckCircle, X, Eye, Ban, Activity, Zap } from 'lucide-react'

interface FraudAlert {
  id: string
  type: 'payment' | 'account' | 'transaction' | 'behavior' | 'device' | 'location'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'investigating' | 'resolved' | 'false_positive'
  title: string
  description: string
  riskScore: number
  confidence: number
  userId?: string
  orderId?: string
  transactionId?: string
  indicators: Array<{
    type: string
    description: string
    weight: number
    value: string
  }>
  actions: Array<{
    type: 'block' | 'flag' | 'verify' | 'monitor' | 'approve'
    description: string
    timestamp: string
    automated: boolean
  }>
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolvedBy?: string
}

interface FraudMetrics {
  totalAlerts: number
  activeAlerts: number
  resolvedAlerts: number
  falsePositives: number
  blockedTransactions: number
  preventedLoss: number
  averageResponseTime: number
  detectionAccuracy: number
}

interface FraudDetectionSystemProps {
  onAlertAction?: (_alertId: string, _action: string) => void
  onUserAction?: (_userId: string, _action: string) => void
}

export default function FraudDetectionSystem({
  onAlertAction,
  onUserAction: _onUserAction
}: FraudDetectionSystemProps) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null)
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'false_positive'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock data
  const mockAlerts: FraudAlert[] = useMemo(() => [
    {
      id: '1',
      type: 'payment',
      severity: 'high',
      status: 'active',
      title: 'Suspicious Payment Pattern Detected',
      description: 'Multiple failed payment attempts from different cards within short time frame',
      riskScore: 85,
      confidence: 92,
      userId: 'user123',
      orderId: 'SS-2024-001234',
      transactionId: 'txn_abc123',
      indicators: [
        {
          type: 'payment_velocity',
          description: '5 failed payments in 10 minutes',
          weight: 0.3,
          value: '5 attempts'
        },
        {
          type: 'card_diversity',
          description: '3 different card numbers used',
          weight: 0.25,
          value: '3 cards'
        },
        {
          type: 'ip_location',
          description: 'Payment from high-risk country',
          weight: 0.2,
          value: 'Nigeria'
        },
        {
          type: 'device_fingerprint',
          description: 'New device with no history',
          weight: 0.15,
          value: 'Unknown device'
        },
        {
          type: 'time_pattern',
          description: 'Unusual time for user activity',
          weight: 0.1,
          value: '3:00 AM'
        }
      ],
      actions: [
        {
          type: 'block',
          description: 'Blocked transaction automatically',
          timestamp: '2024-02-15T10:30:00Z',
          automated: true
        },
        {
          type: 'flag',
          description: 'Flagged user account for review',
          timestamp: '2024-02-15T10:30:00Z',
          automated: true
        }
      ],
      createdAt: '2024-02-15T10:30:00Z',
      updatedAt: '2024-02-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'account',
      severity: 'critical',
      status: 'investigating',
      title: 'Account Takeover Attempt',
      description: 'Multiple login attempts from different locations with stolen credentials',
      riskScore: 95,
      confidence: 88,
      userId: 'user456',
      indicators: [
        {
          type: 'login_velocity',
          description: '10 login attempts in 5 minutes',
          weight: 0.4,
          value: '10 attempts'
        },
        {
          type: 'location_diversity',
          description: 'Logins from 4 different countries',
          weight: 0.3,
          value: '4 countries'
        },
        {
          type: 'password_breach',
          description: 'Password found in data breach',
          weight: 0.2,
          value: 'Compromised'
        },
        {
          type: 'device_anomaly',
          description: 'Login from new device type',
          weight: 0.1,
          value: 'Mobile to Desktop'
        }
      ],
      actions: [
        {
          type: 'block',
          description: 'Blocked all login attempts',
          timestamp: '2024-02-15T11:15:00Z',
          automated: true
        },
        {
          type: 'verify',
          description: 'Require 2FA verification',
          timestamp: '2024-02-15T11:15:00Z',
          automated: true
        }
      ],
      createdAt: '2024-02-15T11:15:00Z',
      updatedAt: '2024-02-15T11:15:00Z'
    },
    {
      id: '3',
      type: 'transaction',
      severity: 'medium',
      status: 'resolved',
      title: 'Unusual Transaction Amount',
      description: 'Transaction amount significantly higher than user\'s typical spending',
      riskScore: 65,
      confidence: 75,
      userId: 'user789',
      orderId: 'SS-2024-001235',
      transactionId: 'txn_def456',
      indicators: [
        {
          type: 'amount_anomaly',
          description: 'Amount 500% higher than average',
          weight: 0.5,
          value: '$2,500 vs $500 avg'
        },
        {
          type: 'time_anomaly',
          description: 'Transaction at unusual time',
          weight: 0.3,
          value: '2:30 AM'
        },
        {
          type: 'merchant_risk',
          description: 'High-risk merchant category',
          weight: 0.2,
          value: 'Electronics'
        }
      ],
      actions: [
        {
          type: 'flag',
          description: 'Flagged for manual review',
          timestamp: '2024-02-14T14:20:00Z',
          automated: true
        },
        {
          type: 'approve',
          description: 'Approved after verification',
          timestamp: '2024-02-14T15:45:00Z',
          automated: false
        }
      ],
      createdAt: '2024-02-14T14:20:00Z',
      updatedAt: '2024-02-14T15:45:00Z',
      resolvedAt: '2024-02-14T15:45:00Z',
      resolvedBy: 'fraud_analyst_1'
    }
  ], [])

  const mockMetrics: FraudMetrics = useMemo(() => ({
    totalAlerts: 1247,
    activeAlerts: 23,
    resolvedAlerts: 1180,
    falsePositives: 44,
    blockedTransactions: 156,
    preventedLoss: 234500,
    averageResponseTime: 4.2,
    detectionAccuracy: 94.5
  }), [])

  useEffect(() => {
    setAlerts(mockAlerts)
    setMetrics(mockMetrics)
  }, [mockAlerts, mockMetrics])

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.status !== filter) return false
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false
    return true
  })

  // Handle alert action
  const handleAlertAction = async (alertId: string, action: string) => {
    setIsProcessing(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedAlert = alerts.find(a => a.id === alertId)
      if (updatedAlert) {
        const newAction = {
          type: action as any,
          description: `Action: ${action}`,
          timestamp: new Date().toISOString(),
          automated: false
        }
        
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                actions: [...alert.actions, newAction],
                status: action === 'approve' ? 'resolved' : alert.status,
                updatedAt: new Date().toISOString()
              }
            : alert
        ))
        
        onAlertAction?.(alertId, action)
      }
    } catch (error) {
      console.error('Failed to perform action:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Get severity icon and color
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'critical':
        return <X className="w-4 h-4 text-red-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-400'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-400'
      case 'investigating':
        return 'text-yellow-400'
      case 'resolved':
        return 'text-green-400'
      case 'false_positive':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Fraud Detection System</h2>
              <p className="text-ink-400">AI-powered fraud prevention and detection</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Live Monitor</span>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Run Analysis</span>
            </button>
          </div>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{metrics.totalAlerts}</div>
              <div className="text-ink-400 text-sm">Total Alerts</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{metrics.activeAlerts}</div>
              <div className="text-ink-400 text-sm">Active</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{metrics.resolvedAlerts}</div>
              <div className="text-ink-400 text-sm">Resolved</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{metrics.falsePositives}</div>
              <div className="text-ink-400 text-sm">False Positives</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{metrics.blockedTransactions}</div>
              <div className="text-ink-400 text-sm">Blocked</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">${metrics.preventedLoss.toLocaleString()}</div>
              <div className="text-ink-400 text-sm">Prevented Loss</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{metrics.averageResponseTime}m</div>
              <div className="text-ink-400 text-sm">Avg Response</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{metrics.detectionAccuracy}%</div>
              <div className="text-ink-400 text-sm">Accuracy</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[70vh]">
        {/* Alerts List */}
        <div className="w-1/3 border-r border-ink-700 overflow-y-auto">
          <div className="p-4">
            {/* Filters */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">Fraud Alerts</h3>
            <div className="space-y-2">
              {filteredAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedAlert?.id === alert.id 
                      ? 'bg-purple-500/20 border border-purple-500/50' 
                      : 'bg-ink-800 hover:bg-ink-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      <span className="text-white font-medium text-sm line-clamp-1">
                        {alert.title}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                        {alert.riskScore}%
                      </div>
                      <div className={`text-xs ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </div>
                    </div>
                  </div>
                  <p className="text-ink-400 text-xs mb-2 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>{alert.type}</span>
                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedAlert ? (
            <div className="p-6">
              {/* Alert Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedAlert.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-ink-400">
                    <span>#{selectedAlert.id}</span>
                    <span>•</span>
                    <span className={`font-semibold ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span className={`font-semibold ${getStatusColor(selectedAlert.status)}`}>
                      {selectedAlert.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {selectedAlert.riskScore}%
                  </div>
                  <div className="text-ink-400 text-sm">Risk Score</div>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="bg-ink-800 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-4">Risk Indicators</h4>
                <div className="space-y-3">
                  {selectedAlert.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-ink-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium text-sm">{indicator.description}</p>
                        <p className="text-ink-400 text-xs">{indicator.value}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {Math.round(indicator.weight * 100)}%
                        </div>
                        <div className="text-ink-400 text-xs">Weight</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-ink-800 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-3">Description</h4>
                <p className="text-ink-300">{selectedAlert.description}</p>
              </div>

              {/* Actions Taken */}
              <div className="bg-ink-800 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-4">Actions Taken</h4>
                <div className="space-y-3">
                  {selectedAlert.actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-ink-700 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        action.type === 'block' ? 'bg-red-500' :
                        action.type === 'flag' ? 'bg-yellow-500' :
                        action.type === 'verify' ? 'bg-blue-500' :
                        action.type === 'approve' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{action.description}</p>
                        <p className="text-ink-400 text-xs">
                          {new Date(action.timestamp).toLocaleString()} • 
                          {action.automated ? ' Automated' : ' Manual'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedAlert.status === 'active' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAlertAction(selectedAlert.id, 'approve')}
                    disabled={isProcessing}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => handleAlertAction(selectedAlert.id, 'block')}
                    disabled={isProcessing}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Block</span>
                  </button>
                  
                  <button
                    onClick={() => handleAlertAction(selectedAlert.id, 'flag')}
                    disabled={isProcessing}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flag</span>
                  </button>
                  
                  <button
                    onClick={() => handleAlertAction(selectedAlert.id, 'verify')}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Verify</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Shield className="w-16 h-16 text-ink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ink-300 mb-2">No alert selected</h3>
                <p className="text-ink-400">Select an alert from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

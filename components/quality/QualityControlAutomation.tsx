'use client'

import { useState, useEffect, useMemo } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Eye, RefreshCw, Zap, Shield, FileText, Clock } from 'lucide-react'

interface QualityCheck {
  id: string
  type: 'image' | 'description' | 'pricing' | 'authenticity' | 'compliance' | 'inventory'
  status: 'pending' | 'passed' | 'failed' | 'warning' | 'manual_review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  itemId: string
  itemName: string
  itemImage: string
  sellerId: string
  sellerName: string
  checks: Array<{
    name: string
    status: 'passed' | 'failed' | 'warning'
    score: number
    details: string
    automated: boolean
  }>
  overallScore: number
  issues: Array<{
    type: string
    description: string
    severity: 'low' | 'medium' | 'high'
    suggestion: string
  }>
  actions: Array<{
    type: 'approve' | 'reject' | 'flag' | 'request_changes' | 'escalate'
    description: string
    timestamp: string
    automated: boolean
  }>
  createdAt: string
  updatedAt: string
  completedAt?: string
  reviewedBy?: string
}

interface QualityMetrics {
  totalChecks: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  manualReviews: number
  averageScore: number
  automationRate: number
  falsePositiveRate: number
  averageProcessingTime: number
  qualityTrend: 'up' | 'down' | 'stable'
}

interface QualityControlAutomationProps {
  onQualityAction?: (_checkId: string, _action: string) => void
  onBulkAction?: (_checkIds: string[], _action: string) => void
}

export default function QualityControlAutomation({
  onQualityAction,
  onBulkAction
}: QualityControlAutomationProps) {
  const [checks, setChecks] = useState<QualityCheck[]>([])
  const [selectedCheck, setSelectedCheck] = useState<QualityCheck | null>(null)
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'passed' | 'failed' | 'warning' | 'manual_review'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'description' | 'pricing' | 'authenticity' | 'compliance' | 'inventory'>('all')
  const [selectedChecks, setSelectedChecks] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock data
  const mockChecks: QualityCheck[] = useMemo(() => [
    {
      id: '1',
      type: 'image',
      status: 'passed',
      priority: 'medium',
      itemId: 'item123',
      itemName: 'Nike Air Jordan 1 Retro High',
      itemImage: '/mock/sneakers-1.jpg',
      sellerId: 'seller1',
      sellerName: 'SneakerStore NYC',
      checks: [
        {
          name: 'Image Quality',
          status: 'passed',
          score: 95,
          details: 'High resolution, clear lighting',
          automated: true
        },
        {
          name: 'Image Authenticity',
          status: 'passed',
          score: 88,
          details: 'No signs of manipulation detected',
          automated: true
        },
        {
          name: 'Product Visibility',
          status: 'passed',
          score: 92,
          details: 'Product clearly visible and well-framed',
          automated: true
        },
        {
          name: 'Background Check',
          status: 'passed',
          score: 90,
          details: 'Clean, professional background',
          automated: true
        }
      ],
      overallScore: 91,
      issues: [],
      actions: [
        {
          type: 'approve',
          description: 'Automatically approved - all checks passed',
          timestamp: '2024-02-15T10:30:00Z',
          automated: true
        }
      ],
      createdAt: '2024-02-15T10:25:00Z',
      updatedAt: '2024-02-15T10:30:00Z',
      completedAt: '2024-02-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'authenticity',
      status: 'failed',
      priority: 'high',
      itemId: 'item456',
      itemName: 'Supreme Box Logo Hoodie',
      itemImage: '/mock/hoodie-1.jpg',
      sellerId: 'seller2',
      sellerName: 'Streetwear Central',
      checks: [
        {
          name: 'Logo Analysis',
          status: 'failed',
          score: 25,
          details: 'Logo appears to be digitally altered',
          automated: true
        },
        {
          name: 'Stitching Pattern',
          status: 'failed',
          score: 30,
          details: 'Stitching pattern inconsistent with authentic items',
          automated: true
        },
        {
          name: 'Tag Verification',
          status: 'failed',
          score: 15,
          details: 'Tag font and spacing do not match authentic tags',
          automated: true
        },
        {
          name: 'Material Analysis',
          status: 'warning',
          score: 60,
          details: 'Material quality below expected standards',
          automated: true
        }
      ],
      overallScore: 32,
      issues: [
        {
          type: 'authenticity',
          description: 'Multiple indicators suggest this item is not authentic',
          severity: 'high',
          suggestion: 'Remove listing and investigate seller'
        },
        {
          type: 'quality',
          description: 'Material quality below brand standards',
          severity: 'medium',
          suggestion: 'Request higher quality photos or remove listing'
        }
      ],
      actions: [
        {
          type: 'reject',
          description: 'Automatically rejected - authenticity concerns',
          timestamp: '2024-02-15T11:15:00Z',
          automated: true
        },
        {
          type: 'escalate',
          description: 'Escalated to fraud team for investigation',
          timestamp: '2024-02-15T11:15:00Z',
          automated: true
        }
      ],
      createdAt: '2024-02-15T11:10:00Z',
      updatedAt: '2024-02-15T11:15:00Z',
      completedAt: '2024-02-15T11:15:00Z'
    },
    {
      id: '3',
      type: 'pricing',
      status: 'warning',
      priority: 'medium',
      itemId: 'item789',
      itemName: 'Vintage Denim Jacket',
      itemImage: '/mock/jacket-1.jpg',
      sellerId: 'seller3',
      sellerName: 'Vintage Finds',
      checks: [
        {
          name: 'Price Comparison',
          status: 'warning',
          score: 65,
          details: 'Price 40% higher than similar items',
          automated: true
        },
        {
          name: 'Market Analysis',
          status: 'passed',
          score: 80,
          details: 'Within acceptable range for vintage items',
          automated: true
        },
        {
          name: 'Condition vs Price',
          status: 'warning',
          score: 55,
          details: 'Price may be high for item condition',
          automated: true
        }
      ],
      overallScore: 67,
      issues: [
        {
          type: 'pricing',
          description: 'Price significantly higher than market average',
          severity: 'medium',
          suggestion: 'Suggest price adjustment or provide justification'
        }
      ],
      actions: [
        {
          type: 'flag',
          description: 'Flagged for manual review - pricing concerns',
          timestamp: '2024-02-15T12:00:00Z',
          automated: true
        }
      ],
      createdAt: '2024-02-15T11:55:00Z',
      updatedAt: '2024-02-15T12:00:00Z'
    },
    {
      id: '4',
      type: 'description',
      status: 'manual_review',
      priority: 'low',
      itemId: 'item101',
      itemName: 'Off-White T-Shirt',
      itemImage: '/mock/tshirt-1.jpg',
      sellerId: 'seller4',
      sellerName: 'Designer Collection',
      checks: [
        {
          name: 'Description Completeness',
          status: 'passed',
          score: 85,
          details: 'All required fields filled',
          automated: true
        },
        {
          name: 'Language Quality',
          status: 'warning',
          score: 70,
          details: 'Some grammatical errors detected',
          automated: true
        },
        {
          name: 'Keyword Analysis',
          status: 'passed',
          score: 90,
          details: 'Good use of relevant keywords',
          automated: true
        },
        {
          name: 'Brand Compliance',
          status: 'failed',
          score: 45,
          details: 'Potential trademark violations in description',
          automated: true
        }
      ],
      overallScore: 72,
      issues: [
        {
          type: 'compliance',
          description: 'Potential trademark violations in product description',
          severity: 'high',
          suggestion: 'Review and edit description to remove trademark violations'
        },
        {
          type: 'quality',
          description: 'Grammar and spelling errors in description',
          severity: 'low',
          suggestion: 'Proofread and correct grammatical errors'
        }
      ],
      actions: [
        {
          type: 'request_changes',
          description: 'Requested changes to description - compliance issues',
          timestamp: '2024-02-15T13:30:00Z',
          automated: true
        }
      ],
      createdAt: '2024-02-15T13:25:00Z',
      updatedAt: '2024-02-15T13:30:00Z'
    }
  ], [])

  const mockMetrics: QualityMetrics = useMemo(() => ({
    totalChecks: 2847,
    passedChecks: 2156,
    failedChecks: 234,
    warningChecks: 387,
    manualReviews: 70,
    averageScore: 78.5,
    automationRate: 94.2,
    falsePositiveRate: 3.8,
    averageProcessingTime: 2.3,
    qualityTrend: 'up'
  }), [])

  useEffect(() => {
    setChecks(mockChecks)
    setMetrics(mockMetrics)
  }, [mockChecks, mockMetrics])

  // Filter checks
  const filteredChecks = checks.filter(check => {
    if (filter !== 'all' && check.status !== filter) return false
    if (typeFilter !== 'all' && check.type !== typeFilter) return false
    return true
  })

  // Handle quality action
  const handleQualityAction = async (checkId: string, action: string) => {
    setIsProcessing(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setChecks(prev => prev.map(check => 
        check.id === checkId 
          ? { 
              ...check, 
              status: action === 'approve' ? 'passed' : 
                     action === 'reject' ? 'failed' : check.status,
              actions: [...check.actions, {
                type: action as any,
                description: `Action: ${action}`,
                timestamp: new Date().toISOString(),
                automated: false
              }],
              updatedAt: new Date().toISOString(),
              completedAt: action === 'approve' || action === 'reject' ? new Date().toISOString() : check.completedAt
            }
          : check
      ))
      
      onQualityAction?.(checkId, action)
    } catch (error) {
      console.error('Failed to perform action:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle bulk action
  const handleBulkAction = async (action: string) => {
    if (selectedChecks.length === 0) return
    
    setIsProcessing(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setChecks(prev => prev.map(check => 
        selectedChecks.includes(check.id)
          ? { 
              ...check, 
              status: action === 'approve' ? 'passed' : 
                     action === 'reject' ? 'failed' : check.status,
              actions: [...check.actions, {
                type: action as any,
                description: `Bulk action: ${action}`,
                timestamp: new Date().toISOString(),
                automated: false
              }],
              updatedAt: new Date().toISOString(),
              completedAt: action === 'approve' || action === 'reject' ? new Date().toISOString() : check.completedAt
            }
          : check
      ))
      
      setSelectedChecks([])
      onBulkAction?.(selectedChecks, action)
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle check selection
  const toggleCheckSelection = (checkId: string) => {
    setSelectedChecks(prev => 
      prev.includes(checkId) 
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId]
    )
  }

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'manual_review':
        return <Eye className="w-4 h-4 text-blue-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'manual_review':
        return 'text-blue-400'
      case 'pending':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Quality Control Automation</h2>
              <p className="text-ink-400">AI-powered quality assurance system</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-ink-800 hover:bg-ink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Run Checks</span>
            </button>
          </div>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{metrics.totalChecks}</div>
              <div className="text-ink-400 text-sm">Total Checks</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{metrics.passedChecks}</div>
              <div className="text-ink-400 text-sm">Passed</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{metrics.failedChecks}</div>
              <div className="text-ink-400 text-sm">Failed</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{metrics.warningChecks}</div>
              <div className="text-ink-400 text-sm">Warnings</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{metrics.manualReviews}</div>
              <div className="text-ink-400 text-sm">Manual Review</div>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{metrics.averageScore}%</div>
              <div className="text-ink-400 text-sm">Avg Score</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{metrics.automationRate}%</div>
              <div className="text-ink-400 text-sm">Automation Rate</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{metrics.falsePositiveRate}%</div>
              <div className="text-ink-400 text-sm">False Positive Rate</div>
            </div>
            <div className="bg-ink-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{metrics.averageProcessingTime}s</div>
              <div className="text-ink-400 text-sm">Avg Processing Time</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[70vh]">
        {/* Checks List */}
        <div className="w-1/2 border-r border-ink-700 overflow-y-auto">
          <div className="p-4">
            {/* Filters */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="warning">Warning</option>
                  <option value="manual_review">Manual Review</option>
                </select>
              </div>
              
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="image">Image</option>
                  <option value="description">Description</option>
                  <option value="pricing">Pricing</option>
                  <option value="authenticity">Authenticity</option>
                  <option value="compliance">Compliance</option>
                  <option value="inventory">Inventory</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedChecks.length > 0 && (
              <div className="mb-4 p-3 bg-ink-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    {selectedChecks.length} items selected
                  </span>
                  <button
                    onClick={() => setSelectedChecks([])}
                    className="text-ink-400 hover:text-white text-sm"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('approve')}
                    disabled={isProcessing}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    disabled={isProcessing}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => handleBulkAction('flag')}
                    disabled={isProcessing}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Flag All
                  </button>
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-white mb-4">Quality Checks</h3>
            <div className="space-y-2">
              {filteredChecks.map((check) => (
                <button
                  key={check.id}
                  onClick={() => setSelectedCheck(check)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedCheck?.id === check.id 
                      ? 'bg-purple-500/20 border border-purple-500/50' 
                      : 'bg-ink-800 hover:bg-ink-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedChecks.includes(check.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleCheckSelection(check.id)
                      }}
                      className="mt-1 w-4 h-4 text-purple-500 bg-ink-800 border-ink-600 rounded focus:ring-purple-500"
                    />
                    
                    <img
                      src={check.itemImage}
                      alt={check.itemName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm line-clamp-1">
                          {check.itemName}
                        </span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(check.status)}
                          <span className={`text-xs font-semibold ${getStatusColor(check.status)}`}>
                            {check.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-ink-400 text-xs mb-1">
                        {check.sellerName} • {check.type}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold text-sm">
                            {check.overallScore}%
                          </span>
                          <span className={`text-xs ${getPriorityColor(check.priority)}`}>
                            {check.priority}
                          </span>
                        </div>
                        <span className="text-ink-500 text-xs">
                          {new Date(check.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Check Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedCheck ? (
            <div className="p-6">
              {/* Check Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCheck.itemImage}
                    alt={selectedCheck.itemName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {selectedCheck.itemName}
                    </h3>
                    <p className="text-ink-400 text-sm">{selectedCheck.sellerName}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-sm font-semibold ${getStatusColor(selectedCheck.status)}`}>
                        {selectedCheck.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`text-sm ${getPriorityColor(selectedCheck.priority)}`}>
                        {selectedCheck.priority.toUpperCase()}
                      </span>
                      <span className="text-ink-400 text-sm">
                        {selectedCheck.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {selectedCheck.overallScore}%
                  </div>
                  <div className="text-ink-400 text-sm">Overall Score</div>
                </div>
              </div>

              {/* Individual Checks */}
              <div className="bg-ink-800 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-4">Quality Checks</h4>
                <div className="space-y-3">
                  {selectedCheck.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-ink-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-medium text-sm">{check.name}</span>
                          {check.automated && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              Automated
                            </span>
                          )}
                        </div>
                        <p className="text-ink-400 text-xs">{check.details}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          check.status === 'passed' ? 'text-green-400' :
                          check.status === 'failed' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {check.score}%
                        </div>
                        <div className={`text-xs ${
                          check.status === 'passed' ? 'text-green-400' :
                          check.status === 'failed' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {check.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues */}
              {selectedCheck.issues.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                  <h4 className="text-red-400 font-semibold mb-3">Issues Found</h4>
                  <div className="space-y-3">
                    {selectedCheck.issues.map((issue, index) => (
                      <div key={index} className="p-3 bg-red-900/10 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium text-sm">{issue.type}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-ink-300 text-sm mb-2">{issue.description}</p>
                        <p className="text-ink-400 text-xs">Suggestion: {issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Taken */}
              <div className="bg-ink-800 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-4">Actions Taken</h4>
                <div className="space-y-3">
                  {selectedCheck.actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-ink-700 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        action.type === 'approve' ? 'bg-green-500' :
                        action.type === 'reject' ? 'bg-red-500' :
                        action.type === 'flag' ? 'bg-yellow-500' :
                        action.type === 'request_changes' ? 'bg-blue-500' :
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
              {selectedCheck.status === 'pending' || selectedCheck.status === 'manual_review' ? (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleQualityAction(selectedCheck.id, 'approve')}
                    disabled={isProcessing}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => handleQualityAction(selectedCheck.id, 'reject')}
                    disabled={isProcessing}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  
                  <button
                    onClick={() => handleQualityAction(selectedCheck.id, 'flag')}
                    disabled={isProcessing}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flag</span>
                  </button>
                  
                  <button
                    onClick={() => handleQualityAction(selectedCheck.id, 'request_changes')}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-ink-400">
                    This check has been {selectedCheck.status}
                    {selectedCheck.completedAt && ` on ${new Date(selectedCheck.completedAt).toLocaleDateString()}`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Shield className="w-16 h-16 text-ink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ink-300 mb-2">No check selected</h3>
                <p className="text-ink-400">Select a quality check from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

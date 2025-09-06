'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Clock, X, FileText, Scale, Bot, User } from 'lucide-react'

interface Dispute {
  id: string
  type: 'payment' | 'delivery' | 'quality' | 'return' | 'refund' | 'seller' | 'buyer'
  status: 'pending' | 'investigating' | 'resolved' | 'escalated' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  amount: number
  currency: string
  parties: {
    initiator: {
      id: string
      name: string
      type: 'buyer' | 'seller'
      avatar: string
    }
    respondent: {
      id: string
      name: string
      type: 'buyer' | 'seller'
      avatar: string
    }
  }
  orderId: string
  evidence: Array<{
    id: string
    type: 'image' | 'document' | 'message' | 'video'
    url: string
    description: string
    submittedBy: string
    timestamp: string
  }>
  resolution: {
    decision: 'favor_initiator' | 'favor_respondent' | 'partial' | 'no_fault'
    reasoning: string
    amount: number
    actions: string[]
    timestamp: string
    resolvedBy: 'ai' | 'human'
  }
  timeline: Array<{
    id: string
    action: string
    description: string
    timestamp: string
    actor: 'system' | 'ai' | 'human' | 'user'
    status: 'completed' | 'pending' | 'failed'
  }>
  createdAt: string
  updatedAt: string
  escalatedAt?: string
  resolvedAt?: string
}

interface AutomatedDisputeResolutionProps {
  disputeId?: string
  onDisputeResolved?: (_dispute: Dispute) => void
  onDisputeEscalated?: (_dispute: Dispute) => void
}

export default function AutomatedDisputeResolution({
  disputeId,
  onDisputeResolved,
  onDisputeEscalated
}: AutomatedDisputeResolutionProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDispute, setNewDispute] = useState({
    type: 'payment' as const,
    title: '',
    description: '',
    amount: 0,
    orderId: ''
  })

  // Mock data
  const mockDisputes: Dispute[] = [
    {
      id: '1',
      type: 'payment',
      status: 'resolved',
      priority: 'high',
      title: 'Payment not received for order #SS-2024-001234',
      description: 'Buyer claims payment was processed but seller never received funds',
      amount: 299.99,
      currency: 'USD',
      parties: {
        initiator: {
          id: 'buyer1',
          name: 'John Doe',
          type: 'buyer',
          avatar: '/mock/buyer-1.jpg'
        },
        respondent: {
          id: 'seller1',
          name: 'SneakerStore NYC',
          type: 'seller',
          avatar: '/mock/seller-1.jpg'
        }
      },
      orderId: 'SS-2024-001234',
      evidence: [
        {
          id: '1',
          type: 'document',
          url: '/mock/payment-receipt.pdf',
          description: 'Payment confirmation from bank',
          submittedBy: 'buyer1',
          timestamp: '2024-02-10T10:00:00Z'
        },
        {
          id: '2',
          type: 'message',
          url: '/mock/message-screenshot.jpg',
          description: 'Screenshot of seller claiming no payment received',
          submittedBy: 'seller1',
          timestamp: '2024-02-10T11:30:00Z'
        }
      ],
      resolution: {
        decision: 'favor_initiator',
        reasoning: 'Payment records confirm funds were transferred. Issue appears to be on seller\'s payment processing side.',
        amount: 299.99,
        actions: ['Refund buyer in full', 'Investigate seller payment system', 'Provide seller with payment troubleshooting guide'],
        timestamp: '2024-02-11T14:30:00Z',
        resolvedBy: 'ai'
      },
      timeline: [
        {
          id: '1',
          action: 'dispute_created',
          description: 'Dispute created by buyer',
          timestamp: '2024-02-10T10:00:00Z',
          actor: 'user',
          status: 'completed'
        },
        {
          id: '2',
          action: 'evidence_collected',
          description: 'AI collected payment records and communication logs',
          timestamp: '2024-02-10T10:15:00Z',
          actor: 'ai',
          status: 'completed'
        },
        {
          id: '3',
          action: 'analysis_started',
          description: 'AI began analysis of evidence',
          timestamp: '2024-02-10T10:30:00Z',
          actor: 'ai',
          status: 'completed'
        },
        {
          id: '4',
          action: 'resolution_proposed',
          description: 'AI proposed resolution in favor of buyer',
          timestamp: '2024-02-11T14:30:00Z',
          actor: 'ai',
          status: 'completed'
        }
      ],
      createdAt: '2024-02-10T10:00:00Z',
      updatedAt: '2024-02-11T14:30:00Z',
      resolvedAt: '2024-02-11T14:30:00Z'
    },
    {
      id: '2',
      type: 'quality',
      status: 'investigating',
      priority: 'medium',
      title: 'Item not as described - damaged goods',
      description: 'Buyer claims item arrived damaged and different from description',
      amount: 450.00,
      currency: 'USD',
      parties: {
        initiator: {
          id: 'buyer2',
          name: 'Sarah Johnson',
          type: 'buyer',
          avatar: '/mock/buyer-2.jpg'
        },
        respondent: {
          id: 'seller2',
          name: 'Vintage Finds',
          type: 'seller',
          avatar: '/mock/seller-2.jpg'
        }
      },
      orderId: 'SS-2024-001235',
      evidence: [
        {
          id: '3',
          type: 'image',
          url: '/mock/damaged-item-1.jpg',
          description: 'Photo of damaged item upon arrival',
          submittedBy: 'buyer2',
          timestamp: '2024-02-12T09:00:00Z'
        },
        {
          id: '4',
          type: 'image',
          url: '/mock/listing-screenshot.jpg',
          description: 'Screenshot of original listing showing different condition',
          submittedBy: 'buyer2',
          timestamp: '2024-02-12T09:15:00Z'
        }
      ],
      resolution: {
        decision: 'partial',
        reasoning: 'Evidence shows item condition differs from listing. Partial refund recommended.',
        amount: 225.00,
        actions: ['Process partial refund', 'Issue return label', 'Update seller guidelines'],
        timestamp: '2024-02-12T15:00:00Z',
        resolvedBy: 'ai'
      },
      timeline: [
        {
          id: '5',
          action: 'dispute_created',
          description: 'Dispute created by buyer',
          timestamp: '2024-02-12T09:00:00Z',
          actor: 'user',
          status: 'completed'
        },
        {
          id: '6',
          action: 'evidence_collected',
          description: 'AI collected photos and listing details',
          timestamp: '2024-02-12T09:30:00Z',
          actor: 'ai',
          status: 'completed'
        },
        {
          id: '7',
          action: 'analysis_started',
          description: 'AI analyzing evidence and comparing with listing',
          timestamp: '2024-02-12T10:00:00Z',
          actor: 'ai',
          status: 'in_progress'
        }
      ],
      createdAt: '2024-02-12T09:00:00Z',
      updatedAt: '2024-02-12T15:00:00Z'
    }
  ]

  useEffect(() => {
    setDisputes(mockDisputes)
    if (disputeId) {
      const dispute = mockDisputes.find(d => d.id === disputeId)
      setSelectedDispute(dispute || null)
    }
  }, [disputeId, mockDisputes])

  // Process dispute with AI
  const processDispute = async (dispute: Dispute) => {
    setIsProcessing(true)
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI analysis
      const analysis = await analyzeDispute(dispute)
      
      // Update dispute with AI resolution
      const updatedDispute: Dispute = {
        ...dispute,
        status: 'resolved',
        resolution: analysis.resolution,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          ...dispute.timeline,
          {
            id: `ai-${Date.now()}`,
            action: 'ai_resolution',
            description: `AI resolved dispute: ${analysis.resolution.decision}`,
            timestamp: new Date().toISOString(),
            actor: 'ai',
            status: 'completed'
          }
        ]
      }
      
      setDisputes(prev => prev.map(d => d.id === dispute.id ? updatedDispute : d))
      setSelectedDispute(updatedDispute)
      
      onDisputeResolved?.(updatedDispute)
    } catch (error) {
      console.error('Failed to process dispute:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Mock AI analysis
  const analyzeDispute = async (dispute: Dispute) => {
    // Simulate AI analysis based on dispute type and evidence
    const analysis = {
      resolution: {
        decision: 'favor_initiator' as const,
        reasoning: 'Based on evidence analysis, the AI determined that the buyer\'s claim is valid. Payment records confirm the transaction was completed successfully.',
        amount: dispute.amount,
        actions: [
          'Process full refund to buyer',
          'Investigate seller payment system',
          'Update seller guidelines for payment processing'
        ],
        timestamp: new Date().toISOString(),
        resolvedBy: 'ai' as const
      }
    }
    
    return analysis
  }

  // Escalate dispute to human
  const escalateDispute = async (dispute: Dispute) => {
    const updatedDispute: Dispute = {
      ...dispute,
      status: 'escalated',
      escalatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        ...dispute.timeline,
        {
          id: `escalate-${Date.now()}`,
          action: 'escalated_to_human',
          description: 'Dispute escalated to human agent for manual review',
          timestamp: new Date().toISOString(),
          actor: 'system',
          status: 'completed'
        }
      ]
    }
    
    setDisputes(prev => prev.map(d => d.id === dispute.id ? updatedDispute : d))
    setSelectedDispute(updatedDispute)
    
    onDisputeEscalated?.(updatedDispute)
  }

  // Create new dispute
  const createDispute = async () => {
    if (!newDispute.title || !newDispute.description) return
    
    const dispute: Dispute = {
      id: `dispute-${Date.now()}`,
      type: newDispute.type,
      status: 'pending',
      priority: 'medium',
      title: newDispute.title,
      description: newDispute.description,
      amount: newDispute.amount,
      currency: 'USD',
      parties: {
        initiator: {
          id: 'current-user',
          name: 'Current User',
          type: 'buyer',
          avatar: '/mock/user-avatar.jpg'
        },
        respondent: {
          id: 'seller-unknown',
          name: 'Unknown Seller',
          type: 'seller',
          avatar: '/mock/seller-unknown.jpg'
        }
      },
      orderId: newDispute.orderId,
      evidence: [],
      resolution: {
        decision: 'no_fault',
        reasoning: '',
        amount: 0,
        actions: [],
        timestamp: '',
        resolvedBy: 'ai'
      },
      timeline: [
        {
          id: '1',
          action: 'dispute_created',
          description: 'Dispute created by user',
          timestamp: new Date().toISOString(),
          actor: 'user',
          status: 'completed'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setDisputes(prev => [dispute, ...prev])
    setSelectedDispute(dispute)
    setShowCreateForm(false)
    setNewDispute({ type: 'payment', title: '', description: '', amount: 0, orderId: '' })
  }

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'investigating':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'escalated':
        return <User className="w-4 h-4 text-blue-400" />
      case 'closed':
        return <X className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400'
      case 'investigating':
        return 'text-orange-400'
      case 'resolved':
        return 'text-green-400'
      case 'escalated':
        return 'text-blue-400'
      case 'closed':
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
            <Scale className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Automated Dispute Resolution</h2>
              <p className="text-ink-400">AI-powered dispute resolution system</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>New Dispute</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{disputes.length}</div>
            <div className="text-ink-400 text-sm">Total Disputes</div>
          </div>
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {disputes.filter(d => d.status === 'resolved').length}
            </div>
            <div className="text-ink-400 text-sm">Resolved by AI</div>
          </div>
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {disputes.filter(d => d.status === 'escalated').length}
            </div>
            <div className="text-ink-400 text-sm">Escalated</div>
          </div>
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {disputes.filter(d => d.status === 'pending' || d.status === 'investigating').length}
            </div>
            <div className="text-ink-400 text-sm">In Progress</div>
          </div>
        </div>
      </div>

      <div className="flex h-[70vh]">
        {/* Disputes List */}
        <div className="w-1/3 border-r border-ink-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Disputes</h3>
            <div className="space-y-2">
              {disputes.map((dispute) => (
                <button
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedDispute?.id === dispute.id 
                      ? 'bg-purple-500/20 border border-purple-500/50' 
                      : 'bg-ink-800 hover:bg-ink-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm line-clamp-1">
                      {dispute.title}
                    </span>
                    <div className={`flex items-center space-x-1 ${getStatusColor(dispute.status)}`}>
                      {getStatusIcon(dispute.status)}
                    </div>
                  </div>
                  <p className="text-ink-400 text-xs mb-2">
                    {dispute.type} • ${dispute.amount} • {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 text-xs">
                      {dispute.parties.initiator.name} vs {dispute.parties.respondent.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dispute.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      dispute.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      dispute.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {dispute.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dispute Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedDispute ? (
            <div className="p-6">
              {/* Dispute Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedDispute.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-ink-400">
                    <span>#{selectedDispute.id}</span>
                    <span>•</span>
                    <span>Order: {selectedDispute.orderId}</span>
                    <span>•</span>
                    <span>${selectedDispute.amount}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedDispute.status)}`}>
                    {getStatusIcon(selectedDispute.status)}
                    <span className="font-medium capitalize">
                      {selectedDispute.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-ink-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Initiator</h4>
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedDispute.parties.initiator.avatar}
                      alt={selectedDispute.parties.initiator.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-white font-medium">{selectedDispute.parties.initiator.name}</p>
                      <p className="text-ink-400 text-sm capitalize">{selectedDispute.parties.initiator.type}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-ink-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Respondent</h4>
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedDispute.parties.respondent.avatar}
                      alt={selectedDispute.parties.respondent.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-white font-medium">{selectedDispute.parties.respondent.name}</p>
                      <p className="text-ink-400 text-sm capitalize">{selectedDispute.parties.respondent.type}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-ink-800 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-3">Description</h4>
                <p className="text-ink-300">{selectedDispute.description}</p>
              </div>

              {/* Evidence */}
              {selectedDispute.evidence.length > 0 && (
                <div className="bg-ink-800 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-semibold mb-3">Evidence</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDispute.evidence.map((evidence) => (
                      <div key={evidence.id} className="border border-ink-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-ink-400" />
                          <span className="text-white text-sm font-medium">{evidence.description}</span>
                        </div>
                        <p className="text-ink-400 text-xs">
                          Submitted by {evidence.submittedBy} • {new Date(evidence.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution */}
              {selectedDispute.status === 'resolved' && selectedDispute.resolution && (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-6">
                  <h4 className="text-green-400 font-semibold mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Resolution</span>
                  </h4>
                  <p className="text-ink-300 mb-3">{selectedDispute.resolution.reasoning}</p>
                  <div className="space-y-2">
                    <p className="text-white font-medium">Actions Taken:</p>
                    <ul className="list-disc list-inside space-y-1 text-ink-300 text-sm">
                      {selectedDispute.resolution.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-ink-800 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-3">Timeline</h4>
                <div className="space-y-3">
                  {selectedDispute.timeline.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{event.description}</p>
                        <p className="text-ink-400 text-xs">
                          {new Date(event.timestamp).toLocaleString()} • {event.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                {selectedDispute.status === 'pending' && (
                  <button
                    onClick={() => processDispute(selectedDispute)}
                    disabled={isProcessing}
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : 'Process with AI'}</span>
                  </button>
                )}
                
                {selectedDispute.status === 'investigating' && (
                  <button
                    onClick={() => escalateDispute(selectedDispute)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Escalate to Human</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Scale className="w-16 h-16 text-ink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ink-300 mb-2">No dispute selected</h3>
                <p className="text-ink-400">Select a dispute from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Dispute Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-ink-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-ink-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New Dispute</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-ink-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Type</label>
                <select
                  value={newDispute.type}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                >
                  <option value="payment">Payment Issue</option>
                  <option value="delivery">Delivery Issue</option>
                  <option value="quality">Quality Issue</option>
                  <option value="return">Return Issue</option>
                  <option value="refund">Refund Issue</option>
                  <option value="seller">Seller Issue</option>
                  <option value="buyer">Buyer Issue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newDispute.title}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the dispute"
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white placeholder-ink-400 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newDispute.description}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white placeholder-ink-400 focus:border-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-300 text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    value={newDispute.amount}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white placeholder-ink-400 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-ink-300 text-sm font-medium mb-2">Order ID</label>
                  <input
                    type="text"
                    value={newDispute.orderId}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, orderId: e.target.value }))}
                    placeholder="SS-2024-XXXXXX"
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white placeholder-ink-400 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-ink-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createDispute}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Create Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

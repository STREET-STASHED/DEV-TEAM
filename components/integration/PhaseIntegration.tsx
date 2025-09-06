'use client'

import { useState } from 'react'
import { ShoppingCart, Bot, ArrowRight, CheckCircle, Star, Zap } from 'lucide-react'

// Phase 3 Components
import EnhancedSearchFilters from '../search/EnhancedSearchFilters'
import EnhancedWishlist from '../wishlist/EnhancedWishlist'
import ProductComparison from '../comparison/ProductComparison'
import EnhancedReviewSystem from '../reviews/EnhancedReviewSystem'
import EnhancedOrderTracking from '../orders/EnhancedOrderTracking'
import ReturnExchangeSystem from '../returns/ReturnExchangeSystem'
import CustomerSupportSystem from '../support/CustomerSupportSystem'
import EnhancedOrderHistory from '../orders/EnhancedOrderHistory'

// Phase 4 Components
import AIChatbot from '../ai/AIChatbot'
import AutomatedDisputeResolution from '../disputes/AutomatedDisputeResolution'
import FraudDetectionSystem from '../fraud/FraudDetectionSystem'
import QualityControlAutomation from '../quality/QualityControlAutomation'
import RealTimeMonitoring from '../monitoring/RealTimeMonitoring'
import PredictiveAnalytics from '../analytics/PredictiveAnalytics'
import SystemHealthMonitoring from '../monitoring/SystemHealthMonitoring'
import BusinessIntelligenceDashboard from '../analytics/BusinessIntelligenceDashboard'

interface PhaseIntegrationProps {
  activePhase?: 'phase3' | 'phase4' | 'all'
  onPhaseChange?: (_phase: string) => void
}

export default function PhaseIntegration({
  activePhase = 'all',
  onPhaseChange
}: PhaseIntegrationProps) {
  const [currentPhase, setCurrentPhase] = useState<'phase3' | 'phase4' | 'all'>(activePhase)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [_isLoading, _setIsLoading] = useState(false)

  const phases = [
    {
      id: 'phase3',
      name: 'Phase 3: Customer Experience',
      description: 'Enhanced shopping and order management',
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      weeks: 'Weeks 9-12',
      features: [
        {
          id: 'enhanced-search',
          name: 'Enhanced Search',
          component: EnhancedSearchFilters,
          description: 'Advanced search with filters and visual search',
          status: 'completed'
        },
        {
          id: 'wishlist',
          name: 'Wishlist & Favorites',
          component: EnhancedWishlist,
          description: 'Smart wishlist with categories and sharing',
          status: 'completed'
        },
        {
          id: 'product-comparison',
          name: 'Product Comparison',
          component: ProductComparison,
          description: 'Side-by-side product comparison tools',
          status: 'completed'
        },
        {
          id: 'reviews',
          name: 'Reviews & Ratings',
          component: EnhancedReviewSystem,
          description: 'Comprehensive customer review system',
          status: 'completed'
        },
        {
          id: 'order-tracking',
          name: 'Order Tracking',
          component: EnhancedOrderTracking,
          description: 'Real-time order tracking with updates',
          status: 'completed'
        },
        {
          id: 'returns',
          name: 'Returns & Exchanges',
          component: ReturnExchangeSystem,
          description: 'Automated return and exchange system',
          status: 'completed'
        },
        {
          id: 'customer-support',
          name: 'Customer Support',
          component: CustomerSupportSystem,
          description: 'Multi-channel customer support',
          status: 'completed'
        },
        {
          id: 'order-history',
          name: 'Order History',
          component: EnhancedOrderHistory,
          description: 'Complete order history with reordering',
          status: 'completed'
        }
      ]
    },
    {
      id: 'phase4',
      name: 'Phase 4: Operational Excellence',
      description: 'Automation and monitoring systems',
      icon: Bot,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      weeks: 'Weeks 13-16',
      features: [
        {
          id: 'ai-chatbot',
          name: 'AI Chatbot',
          component: AIChatbot,
          description: 'Intelligent customer support chatbot',
          status: 'completed'
        },
        {
          id: 'dispute-resolution',
          name: 'Dispute Resolution',
          component: AutomatedDisputeResolution,
          description: 'Automated dispute resolution system',
          status: 'completed'
        },
        {
          id: 'fraud-detection',
          name: 'Fraud Detection',
          component: FraudDetectionSystem,
          description: 'Real-time fraud detection system',
          status: 'completed'
        },
        {
          id: 'quality-control',
          name: 'Quality Control',
          component: QualityControlAutomation,
          description: 'Automated quality control system',
          status: 'completed'
        },
        {
          id: 'real-time-monitoring',
          name: 'Real-time Monitoring',
          component: RealTimeMonitoring,
          description: 'Live performance monitoring',
          status: 'completed'
        },
        {
          id: 'predictive-analytics',
          name: 'Predictive Analytics',
          component: PredictiveAnalytics,
          description: 'Demand forecasting and analytics',
          status: 'completed'
        },
        {
          id: 'system-health',
          name: 'System Health',
          component: SystemHealthMonitoring,
          description: 'Comprehensive system health monitoring',
          status: 'completed'
        },
        {
          id: 'bi-dashboard',
          name: 'BI Dashboard',
          component: BusinessIntelligenceDashboard,
          description: 'Business intelligence dashboard',
          status: 'completed'
        }
      ]
    }
  ]

  const handlePhaseChange = (phase: 'phase3' | 'phase4' | 'all') => {
    setCurrentPhase(phase)
    onPhaseChange?.(phase)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const getActiveFeatures = () => {
    if (currentPhase === 'all') {
      return phases.flatMap(phase => phase.features)
    }
    return phases.find(phase => phase.id === currentPhase)?.features || []
  }

  const getActivePhase = () => {
    if (currentPhase === 'all') {
      return phases
    }
    return phases.filter(phase => phase.id === currentPhase)
  }

  const renderComponent = (feature: any) => {
    const Component = feature.component
    return <Component />
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">StreetStashed MVP Integration</h1>
            <p className="text-ink-400 mt-2">Complete Phase 3 & 4 Implementation</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              All Phases Complete
            </div>
          </div>
        </div>

        {/* Phase Selector */}
        <div className="flex space-x-4">
          <button
            onClick={() => handlePhaseChange('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentPhase === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-ink-800 text-ink-400 hover:bg-ink-700'
            }`}
          >
            All Phases
          </button>
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => handlePhaseChange(phase.id as 'phase3' | 'phase4')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentPhase === phase.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-ink-800 text-ink-400 hover:bg-ink-700'
              }`}
            >
              {phase.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Phase Overview */}
            {getActivePhase().map((phase) => (
              <div key={phase.id} className="bg-ink-800 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-3 rounded-lg ${phase.bgColor}`}>
                    <phase.icon className={`w-8 h-8 ${phase.color}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{phase.name}</h2>
                    <p className="text-ink-400">{phase.description} • {phase.weeks}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {phase.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="bg-ink-700 rounded-lg p-4 cursor-pointer hover:bg-ink-600 transition-colors"
                      onClick={() => handleTabChange(feature.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white font-medium text-sm">{feature.name}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink-400" />
                      </div>
                      <p className="text-ink-400 text-xs">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-ink-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                  <span className="text-ink-400 text-sm">Phase 3 Features</span>
                </div>
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-ink-400 text-sm">Customer Experience</div>
              </div>

              <div className="bg-ink-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Bot className="w-6 h-6 text-purple-400" />
                  <span className="text-ink-400 text-sm">Phase 4 Features</span>
                </div>
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-ink-400 text-sm">Operational Excellence</div>
              </div>

              <div className="bg-ink-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-ink-400 text-sm">Completion Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-ink-400 text-sm">All Features Complete</div>
              </div>

              <div className="bg-ink-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className="w-6 h-6 text-green-400" />
                  <span className="text-ink-400 text-sm">Total Components</span>
                </div>
                <div className="text-2xl font-bold text-white">16</div>
                <div className="text-ink-400 text-sm">Ready for Integration</div>
              </div>
            </div>
          </div>
        )}

        {/* Individual Feature Tabs */}
        {activeTab !== 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleTabChange('overview')}
                  className="text-ink-400 hover:text-white transition-colors"
                >
                  ← Back to Overview
                </button>
                <div className="w-px h-6 bg-ink-700"></div>
                <h2 className="text-2xl font-bold text-white">
                  {getActiveFeatures().find(f => f.id === activeTab)?.name}
                </h2>
              </div>
            </div>

            <div className="bg-ink-800 rounded-lg p-6">
              {renderComponent(getActiveFeatures().find(f => f.id === activeTab))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

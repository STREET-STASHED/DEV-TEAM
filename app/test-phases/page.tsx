'use client'

import { useState } from 'react'
import { ShoppingCart, Bot, BarChart3, ArrowRight, CheckCircle, Star, Zap, Shield, Activity, Package, Users, DollarSign } from 'lucide-react'

// Phase 3 Components
import EnhancedSearchFilters from '@/components/search/EnhancedSearchFilters'
import EnhancedWishlist from '@/components/wishlist/EnhancedWishlist'
import ProductComparison from '@/components/comparison/ProductComparison'
import EnhancedReviewSystem from '@/components/reviews/EnhancedReviewSystem'
import EnhancedOrderTracking from '@/components/orders/EnhancedOrderTracking'
import ReturnExchangeSystem from '@/components/returns/ReturnExchangeSystem'
import CustomerSupportSystem from '@/components/support/CustomerSupportSystem'
import EnhancedOrderHistory from '@/components/orders/EnhancedOrderHistory'

// Phase 4 Components
import AIChatbot from '@/components/ai/AIChatbot'
import AutomatedDisputeResolution from '@/components/disputes/AutomatedDisputeResolution'
import FraudDetectionSystem from '@/components/fraud/FraudDetectionSystem'
import QualityControlAutomation from '@/components/quality/QualityControlAutomation'
import RealTimeMonitoring from '@/components/monitoring/RealTimeMonitoring'
import PredictiveAnalytics from '@/components/analytics/PredictiveAnalytics'
import SystemHealthMonitoring from '@/components/monitoring/SystemHealthMonitoring'
import BusinessIntelligenceDashboard from '@/components/analytics/BusinessIntelligenceDashboard'

export default function TestPhasesPage() {
  const [activePhase, setActivePhase] = useState<'phase3' | 'phase4' | 'all'>('all')
  const [activeFeature, setActiveFeature] = useState<string>('overview')

  const phases = [
    {
      id: 'phase3',
      name: 'Phase 3: Customer Experience',
      description: 'Enhanced shopping and order management features',
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
          icon: Package,
          status: 'completed'
        },
        {
          id: 'wishlist',
          name: 'Wishlist & Favorites',
          component: EnhancedWishlist,
          description: 'Smart wishlist with categories and sharing',
          icon: Star,
          status: 'completed'
        },
        {
          id: 'product-comparison',
          name: 'Product Comparison',
          component: ProductComparison,
          description: 'Side-by-side product comparison tools',
          icon: BarChart3,
          status: 'completed'
        },
        {
          id: 'reviews',
          name: 'Reviews & Ratings',
          component: EnhancedReviewSystem,
          description: 'Comprehensive customer review system',
          icon: Users,
          status: 'completed'
        },
        {
          id: 'order-tracking',
          name: 'Order Tracking',
          component: EnhancedOrderTracking,
          description: 'Real-time order tracking with updates',
          icon: Package,
          status: 'completed'
        },
        {
          id: 'returns',
          name: 'Returns & Exchanges',
          component: ReturnExchangeSystem,
          description: 'Automated return and exchange system',
          icon: ArrowRight,
          status: 'completed'
        },
        {
          id: 'customer-support',
          name: 'Customer Support',
          component: CustomerSupportSystem,
          description: 'Multi-channel customer support',
          icon: Users,
          status: 'completed'
        },
        {
          id: 'order-history',
          name: 'Order History',
          component: EnhancedOrderHistory,
          description: 'Complete order history with reordering',
          icon: Package,
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
          icon: Bot,
          status: 'completed'
        },
        {
          id: 'dispute-resolution',
          name: 'Dispute Resolution',
          component: AutomatedDisputeResolution,
          description: 'Automated dispute resolution system',
          icon: Shield,
          status: 'completed'
        },
        {
          id: 'fraud-detection',
          name: 'Fraud Detection',
          component: FraudDetectionSystem,
          description: 'Real-time fraud detection system',
          icon: Shield,
          status: 'completed'
        },
        {
          id: 'quality-control',
          name: 'Quality Control',
          component: QualityControlAutomation,
          description: 'Automated quality control system',
          icon: CheckCircle,
          status: 'completed'
        },
        {
          id: 'real-time-monitoring',
          name: 'Real-time Monitoring',
          component: RealTimeMonitoring,
          description: 'Live performance monitoring',
          icon: Activity,
          status: 'completed'
        },
        {
          id: 'predictive-analytics',
          name: 'Predictive Analytics',
          component: PredictiveAnalytics,
          description: 'Demand forecasting and analytics',
          icon: BarChart3,
          status: 'completed'
        },
        {
          id: 'system-health',
          name: 'System Health',
          component: SystemHealthMonitoring,
          description: 'Comprehensive system health monitoring',
          icon: Activity,
          status: 'completed'
        },
        {
          id: 'bi-dashboard',
          name: 'BI Dashboard',
          component: BusinessIntelligenceDashboard,
          description: 'Business intelligence dashboard',
          icon: DollarSign,
          status: 'completed'
        }
      ]
    }
  ]

  const getActiveFeatures = () => {
    if (activePhase === 'all') {
      return phases.flatMap(phase => phase.features)
    }
    return phases.find(phase => phase.id === activePhase)?.features || []
  }

  const getActivePhase = () => {
    if (activePhase === 'all') {
      return phases
    }
    return phases.filter(phase => phase.id === activePhase)
  }

  const renderComponent = (feature: any) => {
    const Component = feature.component
    return <Component />
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            StreetStashed MVP - Phase 3 & 4 Integration
          </h1>
          <p className="text-ink-400 text-lg">
            Complete implementation of Customer Experience and Operational Excellence features
          </p>
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              All Phases Complete
            </div>
            <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
              <Zap className="w-4 h-4 inline mr-2" />
              16 Components Ready
            </div>
          </div>
        </div>

        {/* Phase Selector */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActivePhase('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activePhase === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-ink-800 text-ink-400 hover:bg-ink-700'
            }`}
          >
            All Phases
          </button>
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id as 'phase3' | 'phase4')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activePhase === phase.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-ink-800 text-ink-400 hover:bg-ink-700'
              }`}
            >
              {phase.name}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeFeature === 'overview' && (
          <div className="space-y-8">
            {/* Phase Overview */}
            {getActivePhase().map((phase) => (
              <div key={phase.id} className="bg-ink-800 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className={`p-4 rounded-xl ${phase.bgColor}`}>
                    <phase.icon className={`w-10 h-10 ${phase.color}`} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{phase.name}</h2>
                    <p className="text-ink-400 text-lg">{phase.description} • {phase.weeks}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {phase.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="bg-ink-700 rounded-xl p-6 cursor-pointer hover:bg-ink-600 transition-colors group"
                      onClick={() => setActiveFeature(feature.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-ink-600 group-hover:bg-ink-500 transition-colors`}>
                          <feature.icon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{feature.name}</h3>
                      <p className="text-ink-400 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-ink-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-400" />
                  <span className="text-ink-400 text-sm">Phase 3 Features</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">8</div>
                <div className="text-ink-400 text-sm">Customer Experience</div>
              </div>

              <div className="bg-ink-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Bot className="w-8 h-8 text-purple-400" />
                  <span className="text-ink-400 text-sm">Phase 4 Features</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">8</div>
                <div className="text-ink-400 text-sm">Operational Excellence</div>
              </div>

              <div className="bg-ink-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-8 h-8 text-yellow-400" />
                  <span className="text-ink-400 text-sm">Completion Rate</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-ink-400 text-sm">All Features Complete</div>
              </div>

              <div className="bg-ink-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                  <span className="text-ink-400 text-sm">Total Components</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">16</div>
                <div className="text-ink-400 text-sm">Ready for Integration</div>
              </div>
            </div>
          </div>
        )}

        {/* Individual Feature Display */}
        {activeFeature !== 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveFeature('overview')}
                  className="text-ink-400 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <ArrowRight className="w-4 h-4 transform rotate-180" />
                  <span>Back to Overview</span>
                </button>
                <div className="w-px h-6 bg-ink-700"></div>
                <h2 className="text-2xl font-bold text-white">
                  {getActiveFeatures().find(f => f.id === activeFeature)?.name}
                </h2>
              </div>
            </div>

            <div className="bg-ink-800 rounded-2xl p-8">
              {renderComponent(getActiveFeatures().find(f => f.id === activeFeature))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

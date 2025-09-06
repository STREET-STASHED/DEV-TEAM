'use client'

import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Calendar, Target, Zap, Brain, DollarSign, AlertTriangle } from 'lucide-react'

interface DemandForecast {
  id: string
  category: string
  product: string
  currentDemand: number
  predictedDemand: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  factors: Array<{
    name: string
    impact: number
    description: string
  }>
  recommendations: string[]
  timeframe: '7d' | '30d' | '90d'
}

interface SalesPrediction {
  id: string
  period: string
  actual: number
  predicted: number
  accuracy: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
}

interface MarketInsight {
  id: string
  type: 'trend' | 'opportunity' | 'risk' | 'seasonal'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  recommendations: string[]
}

interface PredictiveAnalyticsProps {
  onInsightClick?: (_insight: MarketInsight) => void
  onForecastClick?: (_forecast: DemandForecast) => void
}

export default function PredictiveAnalytics({
  onInsightClick,
  onForecastClick
}: PredictiveAnalyticsProps) {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([])
  const [salesPredictions, setSalesPredictions] = useState<SalesPrediction[]>([])
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data
  const mockForecasts: DemandForecast[] = useMemo(() => [
    {
      id: '1',
      category: 'Sneakers',
      product: 'Nike Air Jordan 1',
      currentDemand: 156,
      predictedDemand: 189,
      confidence: 87,
      trend: 'up',
      factors: [
        {
          name: 'Social Media Mentions',
          impact: 0.35,
          description: 'Increased mentions on TikTok and Instagram'
        },
        {
          name: 'Celebrity Endorsements',
          impact: 0.25,
          description: 'Recent celebrity sightings wearing the product'
        },
        {
          name: 'Seasonal Trends',
          impact: 0.20,
          description: 'Spring fashion trends favoring classic sneakers'
        },
        {
          name: 'Price Stability',
          impact: 0.20,
          description: 'Stable pricing maintaining demand'
        }
      ],
      recommendations: [
        'Increase inventory by 20%',
        'Launch targeted social media campaign',
        'Consider limited edition colorways',
        'Partner with influencers for promotion'
      ],
      timeframe: '30d'
    },
    {
      id: '2',
      category: 'Streetwear',
      product: 'Supreme Box Logo Hoodie',
      currentDemand: 89,
      predictedDemand: 67,
      confidence: 92,
      trend: 'down',
      factors: [
        {
          name: 'Market Saturation',
          impact: 0.40,
          description: 'High availability reducing exclusivity'
        },
        {
          name: 'Price Increase',
          impact: 0.30,
          description: 'Recent price hikes affecting demand'
        },
        {
          name: 'Competitor Products',
          impact: 0.20,
          description: 'New competing brands gaining traction'
        },
        {
          name: 'Seasonal Decline',
          impact: 0.10,
          description: 'Typical winter to spring transition'
        }
      ],
      recommendations: [
        'Reduce inventory levels',
        'Consider promotional pricing',
        'Focus on limited releases',
        'Explore new design collaborations'
      ],
      timeframe: '30d'
    },
    {
      id: '3',
      category: 'Vintage',
      product: 'Vintage Denim Jackets',
      currentDemand: 234,
      predictedDemand: 298,
      confidence: 78,
      trend: 'up',
      factors: [
        {
          name: 'Sustainability Trend',
          impact: 0.45,
          description: 'Growing interest in sustainable fashion'
        },
        {
          name: 'Vintage Revival',
          impact: 0.30,
          description: '90s fashion making a comeback'
        },
        {
          name: 'Quality Perception',
          impact: 0.15,
          description: 'Perceived higher quality of vintage items'
        },
        {
          name: 'Unique Appeal',
          impact: 0.10,
          description: 'One-of-a-kind nature attracting buyers'
        }
      ],
      recommendations: [
        'Expand vintage collection',
        'Highlight sustainability benefits',
        'Create vintage styling guides',
        'Partner with vintage fashion influencers'
      ],
      timeframe: '30d'
    }
  ], [])

  const mockSalesPredictions: SalesPrediction[] = useMemo(() => [
    { id: '1', period: 'Jan 2024', actual: 125000, predicted: 118000, accuracy: 94, trend: 'up', confidence: 89 },
    { id: '2', period: 'Feb 2024', actual: 142000, predicted: 135000, accuracy: 95, trend: 'up', confidence: 91 },
    { id: '3', period: 'Mar 2024', actual: 138000, predicted: 145000, accuracy: 95, trend: 'down', confidence: 87 },
    { id: '4', period: 'Apr 2024', actual: 0, predicted: 152000, accuracy: 0, trend: 'up', confidence: 85 },
    { id: '5', period: 'May 2024', actual: 0, predicted: 168000, accuracy: 0, trend: 'up', confidence: 82 },
    { id: '6', period: 'Jun 2024', actual: 0, predicted: 175000, accuracy: 0, trend: 'up', confidence: 79 }
  ], [])

  const mockInsights: MarketInsight[] = useMemo(() => [
    {
      id: '1',
      type: 'trend',
      title: 'Sneaker Resale Market Growth',
      description: 'The sneaker resale market is experiencing 25% year-over-year growth, driven by increased interest from younger demographics.',
      impact: 'high',
      confidence: 92,
      actionable: true,
      recommendations: [
        'Increase sneaker inventory allocation',
        'Implement dynamic pricing for high-demand items',
        'Develop sneaker authentication services',
        'Create sneaker investment guides'
      ]
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Sustainable Fashion Demand Spike',
      description: 'Consumer interest in sustainable and vintage fashion has increased 40% in the past quarter, creating opportunities for curated collections.',
      impact: 'high',
      confidence: 88,
      actionable: true,
      recommendations: [
        'Launch dedicated sustainable fashion section',
        'Partner with eco-friendly brands',
        'Create sustainability impact metrics',
        'Develop vintage authentication process'
      ]
    },
    {
      id: '3',
      type: 'seasonal',
      title: 'Summer Fashion Transition',
      description: 'Historical data shows 30% increase in lightweight clothing and accessories demand during May-July period.',
      impact: 'medium',
      confidence: 85,
      actionable: true,
      recommendations: [
        'Stock up on summer essentials',
        'Promote lightweight materials',
        'Create summer styling collections',
        'Adjust pricing for seasonal items'
      ]
    },
    {
      id: '4',
      type: 'risk',
      title: 'Supply Chain Disruption Risk',
      description: 'Global supply chain issues may affect 15% of inventory availability in Q2, particularly for imported items.',
      impact: 'high',
      confidence: 75,
      actionable: true,
      recommendations: [
        'Diversify supplier base',
        'Increase local inventory',
        'Implement demand forecasting',
        'Create contingency plans'
      ]
    }
  ], [])

  useEffect(() => {
    setForecasts(mockForecasts)
    setSalesPredictions(mockSalesPredictions)
    setInsights(mockInsights)
  }, [mockForecasts, mockSalesPredictions, mockInsights])

  // Filter forecasts by category and timeframe
  const filteredForecasts = forecasts.filter(forecast => {
    if (selectedCategory !== 'all' && forecast.category !== selectedCategory) return false
    if (forecast.timeframe !== selectedTimeframe) return false
    return true
  })

  // Generate new predictions
  const generatePredictions = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate AI prediction generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock new predictions
      const newForecasts = forecasts.map(forecast => ({
        ...forecast,
        predictedDemand: Math.floor(forecast.predictedDemand * (0.9 + Math.random() * 0.2)),
        confidence: Math.floor(forecast.confidence * (0.95 + Math.random() * 0.1))
      }))
      
      setForecasts(newForecasts)
    } catch (error) {
      console.error('Failed to generate predictions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Get trend icon and color
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      case 'stable':
        return <BarChart3 className="w-4 h-4 text-gray-400" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-400'
      case 'down':
        return 'text-red-400'
      case 'stable':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const _getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-blue-400" />
      case 'opportunity':
        return <Target className="w-4 h-4 text-green-400" />
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'seasonal':
        return <Calendar className="w-4 h-4 text-purple-400" />
      default:
        return <Brain className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Predictive Analytics</h2>
              <p className="text-ink-400">AI-powered demand forecasting and market insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
            <button
              onClick={generatePredictions}
              disabled={isGenerating}
              className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Predictions'}</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Prediction Accuracy</span>
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">94.2%</div>
            <div className="text-ink-400 text-xs">Average accuracy</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Active Forecasts</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{forecasts.length}</div>
            <div className="text-ink-400 text-xs">Products tracked</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Market Insights</span>
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{insights.length}</div>
            <div className="text-ink-400 text-xs">Actionable insights</div>
          </div>
          
          <div className="bg-ink-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink-400 text-sm">Revenue Impact</span>
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">+23%</div>
            <div className="text-ink-400 text-xs">From predictions</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Demand Forecasts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Demand Forecasts</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Streetwear">Streetwear</option>
              <option value="Vintage">Vintage</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {filteredForecasts.map((forecast) => (
              <button
                key={forecast.id}
                onClick={() => onForecastClick?.(forecast)}
                className="w-full text-left bg-ink-800 rounded-lg p-4 hover:bg-ink-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{forecast.product}</h4>
                    <p className="text-ink-400 text-sm">{forecast.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(forecast.trend)}
                    <span className={`text-sm font-semibold ${getTrendColor(forecast.trend)}`}>
                      {forecast.trend}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-ink-400 text-xs mb-1">Current Demand</div>
                    <div className="text-white font-semibold">{forecast.currentDemand}</div>
                  </div>
                  <div>
                    <div className="text-ink-400 text-xs mb-1">Predicted Demand</div>
                    <div className="text-white font-semibold">{forecast.predictedDemand}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-ink-400 text-sm">
                      Confidence: {forecast.confidence}%
                    </span>
                  </div>
                  <div className="text-ink-400 text-sm">
                    {forecast.timeframe}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sales Predictions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Sales Predictions</h3>
          <div className="bg-ink-800 rounded-lg p-4 mb-6">
            <div className="space-y-4">
              {salesPredictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{prediction.period}</div>
                    <div className="text-ink-400 text-sm">
                      {prediction.actual > 0 ? `Actual: $${prediction.actual.toLocaleString()}` : 'Predicted'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${prediction.predicted.toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(prediction.trend)}
                      <span className="text-ink-400 text-sm">
                        {prediction.accuracy > 0 ? `${prediction.accuracy}%` : `${prediction.confidence}%`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <h3 className="text-lg font-semibold text-white mb-4">Market Insights</h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <button
                key={insight.id}
                onClick={() => onInsightClick?.(insight)}
                className="w-full text-left bg-ink-800 rounded-lg p-4 hover:bg-ink-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(insight.type)}
                    <span className="text-white font-medium text-sm">{insight.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                      insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {insight.impact}
                    </span>
                    <span className="text-ink-400 text-xs">
                      {insight.confidence}%
                    </span>
                  </div>
                </div>
                
                <p className="text-ink-300 text-sm mb-2 line-clamp-2">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-ink-400 text-xs">
                    {insight.actionable ? 'Actionable' : 'Informational'}
                  </span>
                  <span className="text-ink-500 text-xs">
                    {insight.recommendations.length} recommendations
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Forecast View */}
      {filteredForecasts.length > 0 && (
        <div className="p-6 border-t border-ink-700">
          <h3 className="text-lg font-semibold text-white mb-4">Forecast Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForecasts.map((forecast) => (
              <div key={forecast.id} className="bg-ink-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">{forecast.product}</h4>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-ink-400 text-sm mb-1">Key Factors</div>
                    {forecast.factors.slice(0, 3).map((factor, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-ink-300">{factor.name}</span>
                        <span className="text-white font-medium">
                          {Math.round(factor.impact * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-ink-400 text-sm mb-2">Recommendations</div>
                  <ul className="space-y-1">
                    {forecast.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="text-ink-300 text-sm">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

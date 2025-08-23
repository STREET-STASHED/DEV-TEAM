'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Package,
  Target,
  BarChart3,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

interface DashboardData {
  summary: {
    totalRevenue: number
    totalItems: number
    lowStockAlerts: number
    trendingCategories: number
  }
  alerts: any[]
  forecasts: any[]
  priceOptimizations: any[]
  trends: any[]
}

export default function AnalyticsDashboard() {
  const { session } = useSupabase()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all analytics data in parallel
      const [alertsRes, forecastsRes, pricingRes, trendsRes] = await Promise.all([
        fetch('/api/analytics/alerts?sellerId=me&resolved=false'),
        fetch('/api/analytics/forecasts?sellerId=me'),
        fetch('/api/analytics/pricing?sellerId=me'),
        fetch('/api/analytics/trends')
      ])

      const [alerts, forecasts, pricing, trends] = await Promise.all([
        alertsRes.json(),
        forecastsRes.json(),
        pricingRes.json(),
        trendsRes.json()
      ])

      // Calculate summary metrics
      const summary = {
        totalRevenue: forecasts.forecasts?.reduce((sum: number, f: Record<string, unknown>) =>
          sum + ((f.predicted_demand as number) * (f.sellingPrice as number) || 0), 0
        ) || 0,
        totalItems: forecasts.forecasts?.length || 0,
        lowStockAlerts: alerts.alerts?.filter((a: Record<string, unknown>) => a.alert_type === 'low_stock').length || 0,
        trendingCategories: trends.trends?.filter((t: Record<string, unknown>) => t.trend_type === 'emerging').length || 0
      }

      setData({
        summary,
        alerts: alerts.alerts || [],
        forecasts: forecasts.forecasts || [],
        priceOptimizations: pricing.optimizations || [],
        trends: trends.trends || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'emerging': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />
      case 'seasonal': return <Clock className="w-4 h-4 text-purple-500" />
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-gray-400 mb-4">
            Start selling items to see predictive analytics and insights.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Predicted Revenue</p>
                <p className="text-white text-2xl font-bold">
                  ${data.summary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Items</p>
                <p className="text-white text-2xl font-bold">{data.summary.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Alerts</p>
                <p className="text-white text-2xl font-bold">{data.alerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Trending Categories</p>
                <p className="text-white text-2xl font-bold">{data.summary.trendingCategories}</p>
              </div>
              <Target className="w-8 h-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {data.alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-red-500 text-white">
                {data.alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                    <div>
                      <p className="text-white font-medium">{alert.title}</p>
                      <p className="text-gray-400 text-sm">{alert.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
              {data.alerts.length === 0 && (
                <p className="text-gray-400 text-center py-4">No active alerts</p>
              )}
            </CardContent>
          </Card>

          {/* Top Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  High Demand Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.forecasts
                  .sort((a, b) => b.predicted_demand - a.predicted_demand)
                  .slice(0, 5)
                  .map((forecast) => (
                    <div key={forecast.itemId} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-white font-medium">{forecast.itemName}</p>
                        <p className="text-gray-400 text-sm">
                          {forecast.forecastDays} day forecast
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">
                          {forecast.predicted_demand.toFixed(0)} units
                        </p>
                        <p className="text-gray-400 text-sm">
                          {(forecast.trend_factor * 100).toFixed(0)}% trend
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                  Price Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.priceOptimizations
                  .sort((a, b) => Math.abs(b.profitImpact) - Math.abs(a.profitImpact))
                  .slice(0, 5)
                  .map((opt) => (
                    <div key={opt.itemId} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-white font-medium">{opt.itemName}</p>
                        <p className="text-gray-400 text-sm">
                          ${opt.currentPrice} → ${opt.recommendedPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${opt.profitImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {opt.profitImpact > 0 ? '+' : ''}${opt.profitImpact.toFixed(0)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {((opt.recommendedPrice - opt.currentPrice) / opt.currentPrice * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {data.alerts.map((alert) => (
            <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: getSeverityColor(alert.severity).replace('bg-', '') }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className={`${getSeverityColor(alert.severity)} text-white`}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="secondary">{alert.alert_type.replace('_', ' ')}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{alert.title}</h3>
                    <p className="text-gray-400 mb-3">{alert.description}</p>
                    <p className="text-sm text-blue-400">
                      <strong>Action Required:</strong> {alert.action_required}
                    </p>
                    {alert.estimated_impact && (
                      <p className="text-sm text-yellow-400 mt-1">
                        <strong>Estimated Impact:</strong> ${Math.abs(alert.estimated_impact).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Resolve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.forecasts.map((forecast) => (
              <Card key={forecast.itemId}>
                <CardHeader>
                  <CardTitle className="text-lg">{forecast.itemName}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{forecast.forecastDays} days</Badge>
                    <Badge variant={forecast.predicted_demand > 10 ? 'default' : 'destructive'}>
                      {forecast.predicted_demand.toFixed(0)} units
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Confidence Range</span>
                        <span className="text-white">
                          {forecast.confidence_lower.toFixed(0)} - {forecast.confidence_upper.toFixed(0)}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Trend Factor</p>
                        <p className="text-white font-medium">
                          {(forecast.trend_factor * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Seasonality</p>
                        <p className="text-white font-medium">
                          {(forecast.seasonality_factor * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.priceOptimizations.map((opt) => (
              <Card key={opt.itemId}>
                <CardHeader>
                  <CardTitle className="text-lg">{opt.itemName}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={opt.profitImpact > 0 ? 'default' : 'destructive'}>
                      {opt.profitImpact > 0 ? 'Profit Opportunity' : 'Loss Risk'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-gray-400 text-sm">Current Price</p>
                        <p className="text-white text-lg font-bold">${opt.currentPrice}</p>
                      </div>
                      <div className="text-center p-3 bg-green-800 rounded">
                        <p className="text-gray-400 text-sm">Recommended</p>
                        <p className="text-white text-lg font-bold">${opt.recommendedPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Profit Impact</span>
                      <span className={`font-bold ${opt.profitImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {opt.profitImpact > 0 ? '+' : ''}${opt.profitImpact.toFixed(0)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400">{opt.recommendationReason}</p>

                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                      Apply Recommendation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.trends.map((trend) => (
              <Card key={trend.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{trend.category}</CardTitle>
                    {getTrendIcon(trend.trend_type)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={trend.trend_type === 'emerging' ? 'default' : 'secondary'}>
                      {trend.trend_type}
                    </Badge>
                    <Badge variant="outline">
                      {(trend.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Predicted Growth</span>
                      <span className={`font-bold flex items-center ${
                        trend.predicted_growth > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trend.predicted_growth > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {(trend.predicted_growth * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Timeframe</span>
                      <Badge variant="outline" className="capitalize">
                        {trend.timeframe} term
                      </Badge>
                    </div>

                    {trend.keywords && trend.keywords.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Trending Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {trend.keywords.slice(0, 3).map((keyword: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

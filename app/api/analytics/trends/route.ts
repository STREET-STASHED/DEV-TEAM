import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(_request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const trendType = searchParams.get('trendType')
    const timeframe = searchParams.get('timeframe')

    const supabase = await createRouteHandlerClient()

    let query = supabase
      .from('trend_analyses')
      .select('*')
      .gte('expires_at', new Date().toISOString())

    if (category) {
      query = query.eq('category', category)
    }

    if (trendType) {
      query = query.eq('trend_type', trendType)
    }

    if (timeframe) {
      query = query.eq('timeframe', timeframe)
    }

    const { data: trends, error } = await query
      .order('confidence_score', { ascending: false })
      .limit(50)

    if (error) throw error

    // Enhance trends with real-time data
    const enhancedTrends = await Promise.all(trends.map(async (trend) => {
      // Get sales growth for the category
      const { data: salesData, error: salesError } = await supabase
        .from('sales_analytics')
        .select('quantity, created_at')
        .eq('item_id', 'any') // This would be filtered by category in real implementation
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())

      if (salesError) {
        console.error('Error fetching sales data:', salesError)
      }

      // Calculate recent growth
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const recentSales = (salesData || []).filter(sale => 
        new Date(sale.created_at) >= thirtyDaysAgo
      ).reduce((sum, sale) => sum + sale.quantity, 0)

      const previousSales = (salesData || []).filter(sale => 
        new Date(sale.created_at) >= sixtyDaysAgo && 
        new Date(sale.created_at) < thirtyDaysAgo
      ).reduce((sum, sale) => sum + sale.quantity, 0)

      const actualGrowth = previousSales > 0 ? (recentSales - previousSales) / previousSales : 0

      return {
        ...trend,
        actualGrowth,
        growthAccuracy: trend.predicted_growth > 0 ? 
          Math.max(0, 1 - Math.abs(actualGrowth - trend.predicted_growth) / trend.predicted_growth) : 0.5,
        marketOpportunity: calculateMarketOpportunity(trend, actualGrowth),
        recommendedActions: generateRecommendations(trend, actualGrowth)
      }
    }))

    return NextResponse.json({ trends: enhancedTrends })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}

export async function POST(_request:NextRequest) {
  try {
    const body = await request.json()
    const { category, trendData, dataSource } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Analyze the trend data
    const analysis = await analyzeTrendData(trendData, category)

    // Save market intelligence data
    const { error: intelligenceError } = await supabase
      .from('market_intelligence')
      .insert({
        category,
        data_type: 'trend_data',
        data_source: dataSource,
        raw_data: trendData,
        processed_data: analysis,
        confidence_score: analysis.confidenceScore,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (intelligenceError) throw intelligenceError

    // Update or create trend analysis
    const { error: trendError } = await supabase
      .from('trend_analyses')
      .upsert({
        category,
        subcategory: analysis.subcategory,
        trend_type: analysis.trendType,
        confidence_score: analysis.confidenceScore,
        predicted_growth: analysis.predictedGrowth,
        timeframe: analysis.timeframe,
        influencers: analysis.influencers || [],
        keywords: analysis.keywords || [],
        social_mentions: analysis.socialMentions || 0,
        search_volume: analysis.searchVolume || 0,
        competitor_activity: analysis.competitorActivity || {},
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (trendError) throw trendError

    return NextResponse.json({ 
      success: true, 
      analysis,
      message: 'Trend analysis updated successfully' 
    })
  } catch (error) {
    console.error('Error updating trend analysis:', error)
    return NextResponse.json({ error: 'Failed to update trend analysis' }, { status: 500 })
  }
}

// Helper functions
function calculateMarketOpportunity(_trend:any, _actualGrowth:number): string {
  const score = (trend.confidence_score * 0.4) + 
                (Math.min(trend.predicted_growth, 1) * 0.3) + 
                (Math.min(actualGrowth, 1) * 0.3)

  if (score > 0.8) return 'High'
  if (score > 0.6) return 'Medium'
  if (score > 0.4) return 'Low'
  return 'Minimal'
}

function generateRecommendations(_trend:any, _actualGrowth:number): string[] {
  const recommendations = []

  if (trend.trend_type === 'emerging' && trend.confidence_score > 0.7) {
    recommendations.push('Increase inventory for this category')
    recommendations.push('Launch targeted marketing campaigns')
    recommendations.push('Partner with relevant influencers')
  }

  if (trend.trend_type === 'declining' && trend.confidence_score > 0.6) {
    recommendations.push('Implement clearance sales')
    recommendations.push('Reduce future orders')
    recommendations.push('Focus on alternative categories')
  }

  if (actualGrowth > trend.predicted_growth * 1.5) {
    recommendations.push('Accelerate inventory replenishment')
    recommendations.push('Consider premium pricing strategy')
  }

  if (actualGrowth < trend.predicted_growth * 0.5) {
    recommendations.push('Review marketing strategy')
    recommendations.push('Analyze competitor actions')
    recommendations.push('Consider price adjustments')
  }

  return recommendations
}

async function analyzeTrendData(_trendData:any, _category:string): Promise<any> {
  // Simplified trend analysis
  // In a real implementation, this would use ML models and external APIs
  
  const keywords = extractKeywords(trendData)
  const socialMentions = countSocialMentions(trendData)
  const searchVolume = estimateSearchVolume(keywords)
  
  let trendType = 'stable'
  let confidenceScore = 0.5
  let predictedGrowth = 0
  let timeframe = 'medium'

  // Analyze growth patterns
  if (socialMentions > 1000 && searchVolume > 5000) {
    trendType = 'emerging'
    confidenceScore = 0.8
    predictedGrowth = 0.4
    timeframe = 'short'
  } else if (socialMentions < 100 && searchVolume < 1000) {
    trendType = 'declining'
    confidenceScore = 0.7
    predictedGrowth = -0.2
    timeframe = 'medium'
  } else if (isSeasonalCategory(category)) {
    trendType = 'seasonal'
    confidenceScore = 0.75
    predictedGrowth = 0.2
    timeframe = 'long'
  }

  return {
    trendType,
    confidenceScore,
    predictedGrowth,
    timeframe,
    keywords,
    socialMentions,
    searchVolume,
    influencers: extractInfluencers(trendData),
    competitorActivity: analyzeCompetitorActivity(trendData)
  }
}

function extractKeywords(_data: Record<string, unknown>): string[] {
  // Mock keyword extraction
  return ['trending', 'popular', 'viral', 'style', 'fashion']
}

function countSocialMentions(_data: Record<string, unknown>): number {
  // Mock social mentions count
  return Math.floor(Math.random() * 5000)
}

function estimateSearchVolume(_keywords:string[]): number {
  // Mock search volume estimation
  return keywords.length * 1000 + Math.floor(Math.random() * 10000)
}

function extractInfluencers(_data: Record<string, unknown>): string[] {
  // Mock influencer extraction
  return ['@fashion_guru', '@style_master', '@trend_setter']
}

function analyzeCompetitorActivity(_data: Record<string, unknown>): Record<string, unknown> {
  // Mock competitor analysis
  return {
    newLaunches: Math.floor(Math.random() * 10),
    priceChanges: Math.floor(Math.random() * 5),
    marketingCampaigns: Math.floor(Math.random() * 3)
  }
}

function isSeasonalCategory(_category:string): boolean {
  const seasonalCategories = ['outerwear', 'swimwear', 'boots', 'sandals', 'coats']
  return seasonalCategories.some(seasonal => 
    category.toLowerCase().includes(seasonal)
  )
}

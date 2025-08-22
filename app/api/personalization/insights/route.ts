import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const insightType = searchParams.get('insightType')

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user insights using database function
    const { data: insights, error } = await supabase.rpc('get_user_insights', {
      p_user_id: user.id,
      p_limit: limit
    })

    if (error) throw error

    // Filter by insight type if specified
    const filteredInsights = insightType 
      ? insights.filter((insight: { insight_type: string }) => insight.insight_type === insightType)
      : insights

    return NextResponse.json({ insights: filteredInsights })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}

export async function POST(request:NextRequest) {
  try {
    const body = await request.json()
    const { insightType, title, description, confidence, actionable, action, impact } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create new insight
    const { data: insight, error } = await supabase
      .from('personalization_insights')
      .insert({
        user_id: user.id,
        insight_type: insightType,
        title,
        description,
        confidence,
        actionable,
        action,
        impact
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ insight })
  } catch (error) {
    console.error('Error creating insight:', error)
    return NextResponse.json({ error: 'Failed to create insight' }, { status: 500 })
  }
}

export async function PUT(request:NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Analyze user behavior and generate new insights
    const { data: behaviorAnalysis, error: analysisError } = await supabase.rpc('analyze_user_behavior', {
      p_user_id: userId || user.id
    })

    if (analysisError) throw analysisError

    // Generate insights based on behavior analysis
    const insights = await generateInsightsFromBehavior(behaviorAnalysis, userId || user.id, supabase)

    return NextResponse.json({ 
      success: true, 
      insightsGenerated: insights.length,
      behaviorAnalysis 
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}

async function generateInsightsFromBehavior(_behaviorAnalysis: Record<string, unknown>, _userId: string, _supabase: Record<string, unknown>) {
  const insights = []

  // Price sensitivity insight
  if (behaviorAnalysis.price_behavior?.avg_price) {
    const avgPrice = behaviorAnalysis.price_behavior.avg_price
    const priceRange = behaviorAnalysis.price_behavior.price_range

    if (priceRange && priceRange.max - priceRange.min < avgPrice * 0.5) {
      insights.push({
        user_id: userId,
        insight_type: 'price_sensitivity',
        title: 'Price Sensitivity Detected',
        description: `You consistently shop in the $${Math.round(priceRange.min)}-$${Math.round(priceRange.max)} range`,
        confidence: 0.8,
        actionable: true,
        action: 'Set price alerts for your preferred range',
        impact: 'high'
      })
    }
  }

  // Category preference insight
  if (behaviorAnalysis.category_preferences) {
    const categories = Object.entries(behaviorAnalysis.category_preferences)
    if (categories.length > 0) {
      const [topCategory, count] = categories[0] as [string, number]
      const totalEvents = behaviorAnalysis.engagement?.total_events || 1
      const percentage = (count / totalEvents) * 100

      if (percentage > 40) {
        insights.push({
          user_id: userId,
          insight_type: 'brand_loyalty',
          title: 'Category Preference',
          description: `${topCategory} makes up ${Math.round(percentage)}% of your shopping activity`,
          confidence: 0.7,
          actionable: true,
          action: 'Explore new categories to diversify your style',
          impact: 'medium'
        })
      }
    }
  }

  // Engagement pattern insight
  if (behaviorAnalysis.engagement?.active_days && behaviorAnalysis.engagement.active_days > 7) {
    insights.push({
      user_id: userId,
      insight_type: 'social_influence',
      title: 'Active Shopper',
      description: `You've been active for ${behaviorAnalysis.engagement.active_days} days`,
      confidence: 0.6,
      actionable: false,
      impact: 'low'
    })
  }

  // Insert insights into database
  if (insights.length > 0) {
    const { error } = await supabase
      .from('personalization_insights')
      .insert(insights)

    if (error) console.error('Error inserting insights:', error)
  }

  return insights
}

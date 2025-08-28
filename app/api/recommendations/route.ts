import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import {
    getCategoryRecommendations,
    getPersonalizedRecommendations,
    trackUserBehavior,
    type RecommendationContext
} from '@/lib/ai/recommendations'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sessionId = searchParams.get('sessionId') || 'default'

    // Create recommendation context
    const context: RecommendationContext = {
      userId: user.id,
      sessionId,
      currentCategory: category || undefined,
      recentViews: [],
      cartItems: [],
      purchaseHistory: []
    }

    // Get recommendations based on category or personalized
    let recommendations
    if (category) {
      recommendations = await getCategoryRecommendations(category, context, limit)
    } else {
      recommendations = await getPersonalizedRecommendations(context, limit)
    }

    return NextResponse.json({
      recommendations,
      category: category || 'personalized',
      total: recommendations.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, productId, sessionId, category, price } = body

    // Validate required fields
    if (!action || !productId || !sessionId) {
      return NextResponse.json({
        error: 'Missing required fields: action, productId, sessionId'
      }, { status: 400 })
    }

    // Validate action type
    const validActions = ['view', 'add_to_cart', 'purchase', 'like', 'share']
    if (!validActions.includes(action)) {
      return NextResponse.json({
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`
      }, { status: 400 })
    }

    // Track user behavior
    await trackUserBehavior({
      userId: user.id,
      sessionId,
      productId,
      action: action as any,
      timestamp: new Date(),
      category,
      price
    })

    return NextResponse.json({
      success: true,
      message: 'Behavior tracked successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Behavior tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

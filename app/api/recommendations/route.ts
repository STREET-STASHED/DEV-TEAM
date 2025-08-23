import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'
import { getRecommendations, trackBehavior, UserBehavior } from '@/lib/ai/recommendations'

export async function GET(_request:NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(_request.url)
    const type = searchParams.get('type') as 'hybrid' | 'collaborative' | 'content' | 'realtime' | 'contextual' || 'hybrid'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get recommendations
    const recommendations = await getRecommendations(user.id, type, {
      limit
    })

    // Get product details for recommendations
    if (recommendations.length > 0) {
      const productIds = recommendations.map(rec => rec.productId)
      const { data: products, error: productsError } = await supabase
        .from('items')
        .select(`
          id,
          name,
          description,
          price,
          image,
          category,
          seller_id,
          profiles!inner(full_name)
        `)
        .in('id', productIds)
        .eq('active', true)

      if (productsError) {
        console.error('Error fetching products:', productsError)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
      }

      // Combine recommendations with product data
      const enrichedRecommendations = recommendations.map(rec => {
        const product = products?.find(p => p.id === rec.productId)
        return {
          ...rec,
          product: product ? {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category,
            seller: {
              id: product.seller_id,
              name: (product as any).profiles?.full_name
            }
          } : null
        }
      }).filter(rec => rec.product !== null)

      return NextResponse.json({
        recommendations: enrichedRecommendations,
        type,
        total: enrichedRecommendations.length,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      recommendations: [],
      type,
      total: 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(_request:NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await _request.json()
    const { action, productId, sessionId } = body

    // Validate required fields
    if (!action || !productId || !sessionId) {
      return NextResponse.json({ 
        error: 'Missing required fields: action, productId, sessionId' 
      }, { status: 400 })
    }

    // Validate action type
    const validActions = ['view', 'like', 'cart', 'purchase', 'share']
    if (!validActions.includes(action)) {
      return NextResponse.json({ 
        error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
      }, { status: 400 })
    }

    // Track user behavior
    const behavior: UserBehavior = {
      userId: user.id,
      productId,
      action: action as UserBehavior['action'],
      sessionId,
      timestamp: new Date(),
    }

    await trackBehavior(behavior)

    // For certain actions, trigger preference updates
    if (['purchase', 'like', 'cart'].includes(action)) {
      // Update user preferences in background (non-blocking)
      setTimeout(async () => {
        try {
          await supabase.rpc('update_user_preferences', { user_uuid: user.id })
        } catch (error) {
          console.error('Error updating user preferences:', error)
        }
      }, 0)
    }

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

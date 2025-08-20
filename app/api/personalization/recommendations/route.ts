import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(_request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const context = searchParams.get('context') ? JSON.parse(searchParams.get('context')!) : {}

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate personalized recommendations using database function
    const { data: recommendations, error } = await supabase.rpc('generate_personalized_recommendations', {
      p_user_id: user.id,
      p_limit: limit
    })

    if (error) throw error

    // Enhance recommendations with item details
    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec: { item_id: string; score: number; reason: string; category: string }) => {
        const { data: item } = await supabase
          .from('items')
          .select('name, price, category, images, seller_id')
          .eq('id', rec.item_id)
          .single()

        return {
          ...rec,
          item: item || {},
          personalizationFactors: {
            styleMatch: rec.score,
            priceMatch: 0.8,
            sizeMatch: 0.7,
            trendMatch: 0.6,
            socialProof: 0.5,
            contextMatch: 0.7
          },
          context: {
            occasion: context.occasion || 'casual',
            season: getCurrentSeason(),
            weather: context.weather || 'moderate',
            mood: context.mood || 'neutral'
          }
        }
      })
    )

    return NextResponse.json({ recommendations: enhancedRecommendations })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

export async function POST(_request:NextRequest) {
  try {
    const body = await request.json()
    const { itemId, action, feedback } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Track recommendation interaction
    const { error: eventError } = await supabase
      .from('personalization_events')
      .insert({
        user_id: user.id,
        event_type: action === 'like' ? 'like' : 'view',
        item_id: itemId,
        metadata: { feedback, source: 'recommendation' }
      })

    if (eventError) throw eventError

    // Update recommendation score based on feedback
    if (feedback) {
      const { error: updateError } = await supabase
        .from('personalized_recommendations')
        .update({ 
          score: feedback === 'positive' ? 0.9 : 0.3 
        })
        .eq('user_id', user.id)
        .eq('item_id', itemId)

      if (updateError) console.error('Error updating recommendation score:', updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing recommendation feedback:', error)
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 })
  }
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

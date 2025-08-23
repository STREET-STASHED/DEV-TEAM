import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const context = searchParams.get('context') ? JSON.parse(searchParams.get('context')!) : {}
    const userId = searchParams.get('userId')

    // Check for test authentication header
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader && authHeader.startsWith('Bearer test-token-')) {
      // Test user authentication
      const token = authHeader.replace('Bearer ', '')
      if (token.includes('buyer')) {
        user = { id: 'test-buyer-1', role: 'buyer' }
      } else if (token.includes('stylist')) {
        user = { id: 'test-stylist-1', role: 'stylist' }
      } else if (token.includes('driver')) {
        user = { id: 'test-driver-1', role: 'driver' }
      }
    } else if (userId) {
      // Fallback for direct testing
      user = { id: userId, role: 'buyer' }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate personalized recommendations for test users
    const mockRecommendations = [
      {
        id: 'rec-1',
        item: {
          id: '1',
          name: 'Vintage Nike Air Jordan 1',
          price: 299.99,
          category: 'Sneakers',
          images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center'],
          seller_id: 'seller-1'
        },
        score: 0.95,
        reason: 'Perfect match for your streetwear style',
        category: 'Sneakers',
        personalizationFactors: {
          styleMatch: 0.95,
          priceMatch: 0.8,
          sizeMatch: 0.9,
          trendMatch: 0.9,
          socialProof: 0.8,
          contextMatch: 0.85
        },
        context: {
          occasion: context.occasion || 'casual',
          season: getCurrentSeason(),
          weather: context.weather || 'moderate',
          mood: context.mood || 'neutral'
        }
      },
      {
        id: 'rec-2',
        item: {
          id: '2',
          name: 'Supreme Box Logo Hoodie',
          price: 450.00,
          category: 'Streetwear',
          images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center'],
          seller_id: 'seller-2'
        },
        score: 0.88,
        reason: 'Matches your luxury streetwear preference',
        category: 'Streetwear',
        personalizationFactors: {
          styleMatch: 0.88,
          priceMatch: 0.7,
          sizeMatch: 0.8,
          trendMatch: 0.9,
          socialProof: 0.9,
          contextMatch: 0.8
        },
        context: {
          occasion: context.occasion || 'casual',
          season: getCurrentSeason(),
          weather: context.weather || 'moderate',
          mood: context.mood || 'neutral'
        }
      },
      {
        id: 'rec-3',
        item: {
          id: '3',
          name: 'Off-White Industrial Belt',
          price: 199.99,
          category: 'Accessories',
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center'],
          seller_id: 'seller-3'
        },
        score: 0.82,
        reason: 'Great accessory to complete your look',
        category: 'Accessories',
        personalizationFactors: {
          styleMatch: 0.82,
          priceMatch: 0.9,
          sizeMatch: 1.0,
          trendMatch: 0.8,
          socialProof: 0.7,
          contextMatch: 0.75
        },
        context: {
          occasion: context.occasion || 'casual',
          season: getCurrentSeason(),
          weather: context.weather || 'moderate',
          mood: context.mood || 'neutral'
        }
      }
    ]

    const enhancedRecommendations = mockRecommendations.slice(0, limit)

    return NextResponse.json({ recommendations: enhancedRecommendations })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

export async function POST(request:NextRequest) {
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

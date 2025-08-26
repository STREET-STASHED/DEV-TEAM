import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers'
import { enhancedPersonalizationSystem } from '@/lib/personalization/enhancedUserProfile'
import { CacheManager, RealTimeManager } from '@/lib/redis/client'


async function createSupabaseClient() {
  return createRouteHandlerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, _options }) => cookieStore.set(name, value, _options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const context = searchParams.get('context') ? JSON.parse(searchParams.get('context')!) : {}
    const includeTrending = searchParams.get('trending') === 'true'
    const realTime = searchParams.get('realtime') === 'true'

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get enhanced recommendations with caching
    const recommendations = await enhancedPersonalizationSystem.getPersonalizedRecommendations(
      user.id,
      limit,
      context
    )

    // Get trending items if requested
    let trendingItems: Record<string, unknown>[] = []
    if (includeTrending) {
      trendingItems = await enhancedPersonalizationSystem.getTrendingItems(user.id, 5)
    }

    // Get user insights
    const insights = await enhancedPersonalizationSystem.getUserInsights(user.id)

    // Get user context
    const userContext = await enhancedPersonalizationSystem.analyzeUserContext(user.id)

    // Enhance recommendations with item details
    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const { data: item } = await supabase
          supabase.from('items')
          .select('name, price, category, images, seller_id, description, tags')
          .eq('id', rec.itemId)
          .single()

        // Get seller information
        let seller = null
        if (item?.seller_id) {
          const { data: sellerData } = await supabase
            supabase.from('profiles')
            .select('username, avatar_url, verified')
            .eq('id', item.seller_id)
            .single()
          seller = sellerData
        }

        return {
          ...rec,
          item: {
            ...item,
            seller
          },
          // Enhanced personalization factors
          personalizationFactors: {
            ...rec.personalizationFactors,
            // Add real-time context factors
            weatherMatch: context.weather === rec.context.weather ? 1.0 : 0.5,
            moodMatch: context.mood === rec.context.mood ? 1.0 : 0.5,
            occasionMatch: context.occasion === rec.context.occasion ? 1.0 : 0.5,
            timeMatch: calculateTimeMatch(context.timeOfDay),
            seasonMatch: calculateSeasonMatch(rec.context.season)
          },
          // Enhanced context
          context: {
            ...rec.context,
            currentWeather: userContext.weather,
            trendingTopics: userContext.trendingTopics,
            localEvents: userContext.localEvents
          },
          // Add real-time metadata
          metadata: {
            cached: false,
            lastUpdated: new Date().toISOString(),
            confidence: rec.score,
            personalizedFor: user.id
          }
        }
      })
    )

    // Calculate overall personalization score
    const overallScore = calculateOverallPersonalizationScore(enhancedRecommendations, userContext)

    // Prepare response
    const response = {
      recommendations: enhancedRecommendations,
      trending: trendingItems,
      insights: insights.slice(0, 5), // Top 5 insights
      context: userContext,
      personalization: {
        overallScore,
        confidence: calculateConfidence(enhancedRecommendations),
        lastUpdated: new Date().toISOString(),
        cacheStatus: 'enhanced'
      },
      realTime: {
        enabled: realTime,
        channels: realTime ? [`user:${user.id}:recommendations`] : []
      }
    }

    // If real-time is enabled, set up SSE headers
    if (realTime) {
      const headers = new Headers()
      headers.set('Content-Type', 'text/event-stream')
      headers.set('Cache-Control', 'no-cache')
      headers.set('Connection', 'keep-alive')
      headers.set('Access-Control-Allow-Origin', '*')

      // Create readable stream for real-time updates
      const stream = new ReadableStream({
        start(controller) {
          // Send initial data
          controller.enqueue(`data: ${JSON.stringify(response)}\n\n`)

          // Set up real-time listener
          RealTimeManager.subscribe(`user:${user.id}:recommendations`, (message) => {
            controller.enqueue(`data: ${JSON.stringify(message)}\n\n`)
          })

          // Keep connection alive
          const keepAlive = setInterval(() => {
            controller.enqueue(`: keepalive\n\n`)
          }, 30000)

          // Cleanup on close
          return () => {
            clearInterval(keepAlive)
          }
        }
      })

      return new Response(stream, { headers })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating enhanced recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json()
    const { itemId, action, feedback, mood, context } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Track mood if provided
    if (mood) {
      await enhancedPersonalizationSystem.trackUserMood(
        user.id,
        mood.mood,
        mood.intensity,
        mood.triggers
      )
    }

    // Track recommendation interaction
    const { error: eventError } = await supabase
      supabase.from('personalization_events')
      .insert({
        user_id: user.id,
        event_type: action === 'like' ? 'like' : 'view',
        item_id: itemId,
        context: context || {},
        metadata: { feedback, source: 'enhanced_recommendation' }
      })

    if (eventError) throw eventError

    // Update recommendation score based on feedback
    if (feedback) {
      const { error: updateError } = await supabase
        supabase.from('personalized_recommendations')
        .update({ 
          score: feedback === 'positive' ? 0.9 : 0.3 
        })
        .eq('user_id', user.id)
        .eq('item_id', itemId)

      if (updateError) console.error('Error updating recommendation score:', updateError)
    }

    // Invalidate relevant caches
    await CacheManager.invalidatePattern(`rec:${user.id}*`)
    await CacheManager.invalidatePattern(`profile:${user.id}*`)

    // Publish real-time update
    await RealTimeManager.publish(`user:${user.id}:events`, {
      type: 'interaction_tracked',
      action,
      itemId,
      feedback,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true,
      message: 'Interaction tracked successfully',
      realTime: {
        channel: `user:${user.id}:events`,
        event: 'interaction_tracked'
      }
    })
  } catch (error) {
    console.error('Error processing enhanced recommendation feedback:', error)
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 })
  }
}

// Utility methods
function calculateTimeMatch(timeOfDay?: string): number {
  if (!timeOfDay) return 0.5
  
  const hour = new Date().getHours()
  let currentTimeOfDay = ''
  
  if (hour >= 6 && hour < 12) currentTimeOfDay = 'morning'
  else if (hour >= 12 && hour < 17) currentTimeOfDay = 'afternoon'
  else if (hour >= 17 && hour < 21) currentTimeOfDay = 'evening'
  else currentTimeOfDay = 'night'
  
  return timeOfDay === currentTimeOfDay ? 1.0 : 0.5
}

function calculateSeasonMatch(season: string): number {
  const currentSeason = getCurrentSeason()
  return season === currentSeason ? 1.0 : 0.5
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

function calculateOverallPersonalizationScore(recommendations: any[], userContext: Record<string, unknown>): number {
  if (recommendations.length === 0) return 0
  
  const scores = recommendations.map((rec: any) => rec.score)
  const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
  
  // Boost score based on context richness
  let contextBoost = 0
  if (userContext.weather) contextBoost += 0.1
  if (userContext.occasion) contextBoost += 0.1
  if (userContext.mood) contextBoost += 0.1
  if (userContext.trendingTopics && Array.isArray(userContext.trendingTopics) && userContext.trendingTopics.length > 0) contextBoost += 0.1
  
  return Math.min(avgScore + contextBoost, 1.0)
}

function calculateConfidence(recommendations: any[]): number {
  if (recommendations.length === 0) return 0
  
  const confidenceScores = recommendations.map((rec: any) => 
    rec.personalizationFactors.styleMatch * 0.3 +
    rec.personalizationFactors.priceMatch * 0.2 +
    rec.personalizationFactors.contextMatch * 0.2 +
    rec.personalizationFactors.trendMatch * 0.15 +
    rec.personalizationFactors.socialProof * 0.15
  )
  
  return confidenceScores.reduce((a: number, b: number) => a + b, 0) / confidenceScores.length
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers'


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

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's style profile
    const { data: profile, error } = await supabase
      supabase.from('user_style_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // If no profile exists, create a default one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        supabase.from('user_style_profiles')
        .insert({
          user_id: user.id,
          style_preferences: {
            aesthetic: ['casual'],
            colorPalette: ['neutral'],
            fitPreference: 'fitted',
            occasionPreference: ['casual'],
            brandAffinity: [],
            priceRange: { min: 0, max: 1000, preferred: 50 },
            sustainability: 0.5,
            exclusivity: 0.5
          },
          body_profile: {
            height: 170,
            weight: 70,
            bodyType: 'average',
            sizePreferences: {
              tops: 'M',
              bottoms: 'M',
              shoes: '10',
              accessories: 'M'
            },
            fitNotes: []
          },
          behavior_profile: {
            browsingPatterns: {
              preferredTime: ['evening'],
              sessionDuration: 15,
              devicePreference: 'mobile',
              frequency: 'weekly'
            },
            purchaseBehavior: {
              averageOrderValue: 100,
              itemsPerOrder: 2,
              returnRate: 0.1,
              impulseBuyRate: 0.3,
              seasonalSpending: {
                spring: 0.25,
                summer: 0.25,
                fall: 0.25,
                winter: 0.25
              }
            },
            socialBehavior: {
              followsInfluencers: false,
              sharesPurchases: false,
              writesReviews: false,
              participatesInChallenges: false,
              referralActivity: 0
            }
          },
          context_profile: {
            location: {
              city: 'Unknown',
              state: 'Unknown',
              country: 'Unknown',
              climate: 'temperate',
              timezone: 'UTC'
            },
            lifestyle: {
              occupation: 'Unknown',
              activityLevel: 'moderate',
              hobbies: [],
              socialCircle: 'ambivert',
              lifeStage: 'young-professional'
            },
            values: {
              sustainability: 0.5,
              ethicalProduction: 0.5,
              localBusiness: 0.5,
              exclusivity: 0.5,
              affordability: 0.5
            }
          },
          ai_profile: {
            learningRate: 0.1,
            confidenceScore: 0.3,
            dataPoints: 0,
            accuracyScore: 0.5
          }
        })
        .select()
        .single()

      if (createError) throw createError
      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

export async function PUT(_request: NextRequest) {
  try {
    const body = await _request.json()
    const { stylePreferences, bodyProfile, contextProfile } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update user profile
    const { data: updatedProfile, error } = await supabase
      supabase.from('user_style_profiles')
      .upsert({
        user_id: user.id,
        style_preferences: stylePreferences,
        body_profile: bodyProfile,
        context_profile: contextProfile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json()
    const { eventType, itemId, category, price, context, metadata } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Track personalization event
    const { data: event, error } = await supabase
      supabase.from('personalization_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        item_id: itemId,
        category,
        price,
        context: {
          device: context?.device || 'unknown',
          location: context?.location || 'unknown',
          timeOfDay: context?.timeOfDay || 'unknown',
          weather: context?.weather,
          occasion: context?.occasion,
          mood: context?.mood,
          socialContext: context?.socialContext
        },
        metadata
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

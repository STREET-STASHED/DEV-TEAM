export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'

export async function GET(request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'active' | 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createRouteHandlerClient()

    if (type === 'active') {
      try {
        const { data, error } = await (supabase as any)
          .from('social_challenges')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString())
          .order('participants', { ascending: false })
          .limit(limit)

        if (error) {
          // If table doesn't exist, return mock active challenges
          console.log('Social challenges table not available, returning mock active challenges')
          return NextResponse.json({
            challenges: [
              {
                id: '1',
                title: 'Streetwear Style Challenge',
                description: 'Show off your best streetwear looks!',
                hashtag: '#StreetwearStyle',
                is_active: true,
                participants: 156,
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          })
        }

        return NextResponse.json({ challenges: data })
      } catch (_dbError) {
        // Fallback to mock data if database query fails
        console.log('Database query failed, returning mock active challenges')
        return NextResponse.json({
          challenges: [
            {
              id: '1',
              title: 'Streetwear Style Challenge',
              description: 'Show off your best streetwear looks!',
              hashtag: '#StreetwearStyle',
              is_active: true,
              participants: 156,
              end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        })
      }
    }

    // Get all challenges
    try {
      const { data, error } = await (supabase as any)
        .from('social_challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        // If table doesn't exist, return mock challenges
        console.log('Social challenges table not available, returning mock challenges')
        return NextResponse.json({
          challenges: [
            {
              id: '1',
              title: 'Streetwear Style Challenge',
              description: 'Show off your best streetwear looks!',
              hashtag: '#StreetwearStyle',
              is_active: true,
              participants: 156,
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Sneaker Collection Showcase',
              description: 'Display your sneaker collection!',
              hashtag: '#SneakerShowcase',
              is_active: false,
              participants: 89,
              created_at: new Date().toISOString()
            }
          ]
        })
      }

      return NextResponse.json({ challenges: data })
    } catch (_dbError) {
      // Fallback to mock data if database query fails
      console.log('Database query failed, returning mock challenges')
      return NextResponse.json({
        challenges: [
          {
            id: '1',
            title: 'Streetwear Style Challenge',
            description: 'Show off your best streetwear looks!',
            hashtag: '#StreetwearStyle',
            is_active: true,
            participants: 156,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Sneaker Collection Showcase',
            description: 'Display your sneaker collection!',
            hashtag: '#SneakerShowcase',
            is_active: false,
            participants: 89,
            created_at: new Date().toISOString()
          }
        ]
      })
    }
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}

export async function POST(request:NextRequest) {
  try {
    const body = await request.json()
    const { title, description, hashtag, startDate, endDate, prize, rules } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is influencer/admin
    const { data: profile } = await (supabase as any)
      .from('user_social_profiles')
      .select('is_influencer')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!(profile as any)?.is_influencer) {
      return NextResponse.json({ error: 'Only influencers can create challenges' }, { status: 403 })
    }

    // Create challenge
    const { data, error } = await (supabase as any)
      .from('social_challenges')
      .insert({
        title,
        description,
        hashtag,
        start_date: startDate,
        end_date: endDate,
        prize,
        rules
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ challenge: data })
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }
}

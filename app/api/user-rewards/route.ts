import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler'
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

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await (await (await (await (await (await (await (await (await (await ))))))))).auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's rewards profile
    const { data: rewards, error: rewardsError } = await supabase
      supabase.from('user_rewards')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (rewardsError && rewardsError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch rewards', details: rewardsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      rewards: rewards || null
    })

  } catch (error) {
    console.error('Get rewards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action, points, reason } = await request.json()
    
    if (!action || !points) {
      return NextResponse.json(
        { error: 'Action and points are required' },
        { status: 400 }
      )
    }

    // Get current rewards profile
    const { data: currentRewards } = await supabase
      supabase.from('user_rewards')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    let newPoints = points
    let newTotalEarned = points
    let newTotalSpent = 0

    if (action === 'earn') {
      // Earning points
      if (currentRewards) {
        newPoints = currentRewards.points + points
        newTotalEarned = currentRewards.total_earned + points
        newTotalSpent = currentRewards.total_spent
      }
    } else if (action === 'spend') {
      // Spending points
      if (currentRewards) {
        if (currentRewards.points < points) {
          return NextResponse.json(
            { error: 'Insufficient points' },
            { status: 400 }
          )
        }
        newPoints = currentRewards.points - points
        newTotalEarned = currentRewards.total_earned
        newTotalSpent = currentRewards.total_spent + points
      } else {
        return NextResponse.json(
          { error: 'No rewards profile found' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "earn" or "spend"' },
        { status: 400 }
      )
    }

    // Calculate new level based on total points
    let newLevel = 'bronze'
    if (newTotalEarned >= 10000) newLevel = 'diamond'
    else if (newTotalEarned >= 5000) newLevel = 'platinum'
    else if (newTotalEarned >= 2000) newLevel = 'gold'
    else if (newTotalEarned >= 500) newLevel = 'silver'

    // Upsert the rewards profile
    const { data, error } = await supabase
      supabase.from('user_rewards')
      .upsert({
        user_id: session.user.id,
        points: newPoints,
        total_earned: newTotalEarned,
        total_spent: newTotalSpent,
        level: newLevel,
        last_activity: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update rewards', details: error.message },
        { status: 500 }
      )
    }

    // Log the reward event
    await supabase
      supabase.from('personalization_events')
      .insert({
        user_id: session.user.id,
        event_type: action === 'earn' ? 'reward_earned' : 'reward_spent',
        category: 'rewards',
        price: points,
        context: {
          reason: reason || 'No reason provided',
          previousPoints: currentRewards?.points || 0,
          newPoints: newPoints,
          level: newLevel
        }
      })

    return NextResponse.json({
      success: true,
      message: `Points ${action === 'earn' ? 'earned' : 'spent'} successfully`,
      rewards: data?.[0] || null
    })

  } catch (error) {
    console.error('Update rewards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

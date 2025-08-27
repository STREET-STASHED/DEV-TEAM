import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'





export async function GET(_request: NextRequest) {
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

    // Get the user's rewards profile
    const { data: rewards, error: _rewardsError } = await (supabase as any).from('user_rewards')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (_rewardsError && _rewardsError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch rewards', details: _rewardsError.message },
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
    const { data: updatedRewards, error: _rewardsError2 } = await (supabase as any).from('user_rewards')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    let newPoints = points
    let newTotalEarned = points
    let _newTotalSpent = 0

    if (action === 'earn') {
      // Earning points
      if (updatedRewards) {
        newPoints = updatedRewards.points + points
        newTotalEarned = updatedRewards.total_earned + points
        _newTotalSpent = updatedRewards.total_spent
      }
    } else if (action === 'spend') {
      // Spending points
      if (updatedRewards) {
        if (updatedRewards.points < points) {
          return NextResponse.json(
            { error: 'Insufficient points' },
            { status: 400 }
          )
        }
        newPoints = updatedRewards.points - points
        newTotalEarned = updatedRewards.total_earned
        _newTotalSpent = (updatedRewards.total_spent || 0) + points
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
    const { data: updatedData, error: updateError } = await (supabase as any)
      .from('user_rewards')
      .upsert({
        user_id: session.user.id,
        points: newPoints,
        total_earned: newTotalEarned,
        total_spent: _newTotalSpent,
        level: newLevel
      }, {
        onConflict: 'user_id'
      })
      .select()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update rewards', details: updateError.message },
        { status: 500 }
      )
    }

    // Log the reward event
    await (supabase as any)
      .from('personalization_events')
      .insert({
        user_id: session.user.id,
        event_type: action === 'earn' ? 'reward_earned' : 'reward_spent',
        category: 'rewards',
        price: points,
        context: {
          reason: reason || 'No reason provided',
          previousPoints: updatedRewards?.points || 0,
          newPoints: newPoints
        }
      })

    return NextResponse.json({
      success: true,
      message: `Points ${action === 'earn' ? 'earned' : 'spent'} successfully`,
      rewards: updatedData?.[0] || null
    })

  } catch (error) {
    console.error('Update rewards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'




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

    // Get the user's referrals
    const { data: referrals, error: referralsError } = await (supabase as any).from('referrals')
      .select(`
        *,
        referrer:profiles!referrals_referrer_id_fkey (
          username,
          full_name,
          avatar_url
        ),
        referred:profiles!referrals_referred_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .or(`referrer_id.eq.${session.user.id},referred_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false })

    if (referralsError) {
      return NextResponse.json(
        { error: 'Failed to fetch referrals', details: referralsError.message },
        { status: 500 }
      )
    }

    // Separate sent and received referrals
    const sentReferrals = referrals?.filter((r: any) => r.referrer_id === session.user.id) || []
    const receivedReferrals = referrals?.filter((r: any) => r.referred_id === session.user.id) || []

    return NextResponse.json({
      sentReferrals,
      receivedReferrals
    })

  } catch (error) {
    console.error('Get referrals error:', error)
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

    const { referredEmail, referralCode } = await request.json()

    if (!referredEmail) {
      return NextResponse.json(
        { error: 'Referred email is required' },
        { status: 400 }
      )
    }

    // Check if user is trying to refer themselves
    if (referredEmail === session.user.email) {
      return NextResponse.json(
        { error: 'You cannot refer yourself' },
        { status: 400 }
      )
    }

    // Check if referral code is provided (for new user signup)
    if (referralCode) {
      // Find the referrer by referral code
      const { data: referrer } = await (supabase as any).from('profiles')
        .select('id, username')
        .eq('username', referralCode)
        .maybeSingle()

      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        )
      }

      // Check if user was already referred
      const { data: existingReferral } = await (supabase as any)
        .from('referrals')
        .select('*')
        .eq('referred_id', session.user.id)
        .maybeSingle()

      if (existingReferral) {
        return NextResponse.json(
          { error: 'You have already been referred' },
          { status: 400 }
        )
      }

      // Create the referral
      const { data, error } = await (supabase as any)
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: session.user.id,
          status: 'pending'
        })
        .select()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create referral', details: error.message },
          { status: 500 }
        )
      }

      // Award points to both users
      await (supabase as any)
        .from('user_rewards')
        .upsert([
          {
            user_id: referrer.id,
            points: 100,
            reason: 'referral_bonus'
          },
          {
            user_id: session.user.id,
            points: 50,
            reason: 'referred_bonus'
          }
        ], {
          onConflict: 'user_id'
        })

      return NextResponse.json({
        success: true,
        message: 'Referral created successfully',
        referral: data[0]
      })
    } else {
      // Creating a new referral (inviting someone)
      // Check if user already referred this email
      const { data: existingReferral } = await (supabase as any).from('referrals')
        .select('*')
        .eq('referrer_id', session.user.id)
        .eq('referred_id', referredEmail)
        .maybeSingle()

      if (existingReferral) {
        return NextResponse.json(
          { error: 'You have already referred this email' },
          { status: 400 }
        )
      }

      // For now, we'll create a pending referral
      // The actual referral will be completed when the referred user signs up
      const { data, error } = await (supabase as any).from('referrals')
        .insert({
          referrer_id: session.user.id,
          referred_id: '', // Will be set when user signs up
          referred_email: referredEmail,
          status: 'pending'
        })
        .select()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create referral', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Referral invitation sent successfully',
        referral: data[0]
      })
    }

  } catch (error) {
    console.error('Create referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { referralId, status } = await request.json()

    if (!referralId || !status) {
      return NextResponse.json(
        { error: 'Referral ID and status are required' },
        { status: 400 }
      )
    }

    // Update the referral status
    const { data, error } = await (supabase as any).from('referrals')
      .update({
        status: status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', referralId)
      .eq('referrer_id', session.user.id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update referral', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Referral updated successfully',
      referral: data[0]
    })

  } catch (error) {
    console.error('Update referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

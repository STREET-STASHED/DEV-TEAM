import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { onboardingGamification } from '@/lib/onboarding/gamification'

const claimRewardSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  rewardId: z.string().min(1, 'Reward ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, rewardId } = claimRewardSchema.parse(body)
    
    const supabaseAdmin = createAdminClient()
    
    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Claim the reward using gamification system
    const result = await onboardingGamification.claimReward(userId, rewardId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    // Log reward claim in database
    const { error: logError } = await supabaseAdmin
      .from('reward_claims')
      .insert({
        user_id: userId,
        reward_id: rewardId,
        reward_name: result.reward?.name || '',
        reward_type: result.reward?.type || '',
        reward_value: String(result.reward?.value || ''),
        claimed_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging reward claim:', logError)
      // Don't fail the request if logging fails
    }

    // Award XP for claiming reward
    const xpResult = await onboardingGamification.awardXP(userId, 'claim_reward', 25)

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        reward: result.reward,
        xpAwarded: xpResult
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Claim reward error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

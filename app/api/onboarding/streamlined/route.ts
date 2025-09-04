import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { autoApprovalSystem } from '@/lib/onboarding/autoApproval'
import { onboardingGamification } from '@/lib/onboarding/gamification'

// Streamlined onboarding schema
const streamlinedOnboardingSchema = z.object({
  role: z.enum(['seller', 'stylist', 'driver']),
  basicInfo: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    businessName: z.string().optional(),
    vehicleType: z.string().optional(),
    experience: z.number().optional()
  }),
  verificationData: z.object({
    emailVerified: z.boolean().default(false),
    phoneVerified: z.boolean().default(false),
    documentsUploaded: z.boolean().default(false),
    backgroundCheckPassed: z.boolean().default(false)
  }).optional(),
  preferences: z.object({
    specialties: z.array(z.string()).optional(),
    serviceTypes: z.array(z.string()).optional(),
    pricing: z.object({
      hourlyRate: z.number().optional(),
      commissionRate: z.number().optional()
    }).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = streamlinedOnboardingSchema.parse(body)
    
    const supabaseAdmin = createAdminClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Create user profile with streamlined data
    const profileData = {
      id: user.id,
      full_name: validatedData.basicInfo.fullName,
      email: validatedData.basicInfo.email,
      phone: validatedData.basicInfo.phone,
      role: validatedData.role,
      onboarding_completed: false,
      onboarding_started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // Create role-specific profile
    let roleProfileError = null
    switch (validatedData.role) {
      case 'seller':
        if (validatedData.basicInfo.businessName) {
          const sellerData = {
            user_id: user.id,
            business_name: validatedData.basicInfo.businessName,
            business_type: validatedData.basicInfo.businessName ? 'online' : null,
            specialties: validatedData.preferences?.specialties || [],
            experience_years: validatedData.basicInfo.experience || 0,
            verification_status: 'pending'
          }

          const { error } = await supabaseAdmin
            .from('seller_profiles')
            .upsert(sellerData, { onConflict: 'user_id' })
          
          roleProfileError = error
        }
        break

      case 'stylist':
        const stylistData = {
          user_id: user.id,
          specialties: validatedData.preferences?.specialties || [],
          experience_years: validatedData.basicInfo.experience || 0,
          services_offered: validatedData.preferences?.serviceTypes || [],
          hourly_rate: validatedData.preferences?.pricing?.hourlyRate || 50,
          verification_status: 'pending'
        }

        const { error: stylistError } = await supabaseAdmin
          .from('stylist_profiles')
          .upsert(stylistData, { onConflict: 'user_id' })
        
        roleProfileError = stylistError
        break

      case 'driver':
        if (validatedData.basicInfo.vehicleType) {
          const driverData = {
            user_id: user.id,
            vehicle_type: validatedData.basicInfo.vehicleType,
            is_online: false,
            is_available: true,
            verification_status: 'pending'
          }

          const { error: driverError } = await supabaseAdmin
            .from('stasher_profiles')
            .upsert(driverData, { onConflict: 'user_id' })
          
          roleProfileError = driverError
        }
        break
    }

    if (roleProfileError) {
      console.error('Role profile creation error:', roleProfileError)
      // Don't fail the entire onboarding if role profile fails
    }

    // Run auto-approval analysis
    const userProfile = {
      id: user.id,
      email: validatedData.basicInfo.email,
      fullName: validatedData.basicInfo.fullName,
      role: validatedData.role,
      phone: validatedData.basicInfo.phone,
      businessName: validatedData.basicInfo.businessName,
      vehicleType: validatedData.basicInfo.vehicleType,
      experience: validatedData.basicInfo.experience,
      documents: {
        idVerified: validatedData.verificationData?.documentsUploaded || false,
        businessLicense: validatedData.role === 'seller' && validatedData.verificationData?.documentsUploaded,
        insurance: validatedData.role === 'driver' && validatedData.verificationData?.documentsUploaded,
        backgroundCheck: validatedData.verificationData?.backgroundCheckPassed || false
      }
    }

    const approvalResult = await autoApprovalSystem.analyzeUserProfile(userProfile)

    // Initialize gamification progress
    const gamificationProgress = await onboardingGamification.getUserProgress(user.id, validatedData.role)

    // Award initial XP
    const xpResult = await onboardingGamification.awardXP(user.id, 'start_onboarding', 50)

    // Get available rewards
    const availableRewards = await onboardingGamification.getAvailableRewards(user.id, validatedData.role)

    return NextResponse.json({
      success: true,
      message: 'Onboarding started successfully',
      data: {
        userId: user.id,
        role: validatedData.role,
        approvalResult,
        gamification: {
          progress: gamificationProgress,
          xpAwarded: xpResult,
          availableRewards
        },
        nextSteps: approvalResult.nextSteps,
        estimatedApprovalTime: approvalResult.estimatedApprovalTime
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('Streamlined onboarding error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      )
    }

    // Get user progress
    const progress = await onboardingGamification.getUserProgress(userId, role)
    
    // Get available rewards
    const rewards = await onboardingGamification.getAvailableRewards(userId, role)
    
    // Get leaderboard
    const leaderboard = await onboardingGamification.getLeaderboard(role, 10)

    return NextResponse.json({
      success: true,
      data: {
        progress,
        rewards,
        leaderboard
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get onboarding progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabaseAdmin'

// Onboarding schema
const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters'),
  business_name: z.string().optional(),
  business_license: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  vehicle_type: z.string().optional(),
  insurance_info: z.string().optional(),
})

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json()
    
    // Validate request body
    const validationResult = onboardingSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      
      return NextResponse.json(
        { error: 'Invalid request data', details: errors },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const authHeader = _request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create admin client
    const supabaseAdmin = createAdminClient()
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Update the main profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        bio: data.bio,
        has_completed_onboarding: true,
        onboarding_step: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: profileError.message },
        { status: 500 }
      )
    }

    // Get user's role from profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'buyer'

    // Create role-specific profile based on role and provided data
    if (role === 'seller' && (data.business_name || data.business_license || data.experience_years)) {
      const sellerData = {
        user_id: user.id,
        business_name: data.business_name,
        business_license: data.business_license,
        specialties: data.specialties || [],
        experience_years: data.experience_years,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: sellerError } = await supabaseAdmin
        .from('seller_profiles')
        .upsert(sellerData, { onConflict: 'user_id' })

      if (sellerError) {
        console.error('Seller profile creation error:', sellerError)
        // Don't fail the entire onboarding if role profile fails
      }
    }

    if ((role === 'driver' || role === 'stasher') && (data.vehicle_type || data.insurance_info)) {
      const stasherData = {
        user_id: user.id,
        vehicle_type: data.vehicle_type,
        insurance_info: data.insurance_info,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: stasherError } = await supabaseAdmin
        .from('stasher_profiles')
        .upsert(stasherData, { onConflict: 'user_id' })

      if (stasherError) {
        console.error('Stasher profile creation error:', stasherError)
      }
    }

    if (role === 'stylist' && (data.specialties || data.experience_years)) {
      const stylistData = {
        user_id: user.id,
        specialties: data.specialties || [],
        experience_years: data.experience_years,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: stylistError } = await supabaseAdmin
        .from('stylist_profiles')
        .upsert(stylistData, { onConflict: 'user_id' })

      if (stylistError) {
        console.error('Stylist profile creation error:', stylistError)
      }
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        email: user.email,
        role: role,
      },
      profile: {
        full_name: data.full_name,
        phone: data.phone,
        has_completed_onboarding: true,
      },
      timestamp: new Date().toISOString(),
    }, { status: 200 })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's style profile
    const { data: profile, error: profileError } = await supabase
      supabase.from('user_style_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile: profile || null
    })

  } catch (error) {
    console.error('Get style profile error:', error)
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

    const profileData = await request.json()
    
    // Upsert the style profile
    const { data, error } = await supabase
      supabase.from('user_style_profiles')
      .upsert({
        user_id: session.user.id,
        style_preferences: profileData.stylePreferences || {},
        body_profile: profileData.bodyProfile || {},
        behavior_profile: profileData.behaviorProfile || {},
        context_profile: profileData.contextProfile || {},
        ai_profile: profileData.aiProfile || {}
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save profile', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data?.[0] || null
    })

  } catch (error) {
    console.error('Save style profile error:', error)
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

    const profileData = await request.json()
    
    // Update the style profile
    const { data, error } = await supabase
      supabase.from('user_style_profiles')
      .update({
        style_preferences: profileData.stylePreferences,
        body_profile: profileData.bodyProfile,
        behavior_profile: profileData.behaviorProfile,
        context_profile: profileData.contextProfile,
        ai_profile: profileData.aiProfile,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data?.[0] || null
    })

  } catch (error) {
    console.error('Update style profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

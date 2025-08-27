export const runtime = 'nodejs';
import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to get session', details: error.message },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: (profile as any)?.role || 'buyer',
        username: (profile as any)?.username,
        full_name: (profile as any)?.full_name,
        avatar_url: (profile as any)?.avatar_url
      },
      session: {
        expires_at: session.expires_at,
        refresh_token: session.refresh_token ? '***' : null
      }
    })

  } catch (error) {
    console.error('Auth status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    })

  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

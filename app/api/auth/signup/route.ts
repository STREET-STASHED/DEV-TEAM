export const runtime = 'nodejs';
import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'





export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { email, password, full_name, username, role = 'buyer' } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          username,
          role
        }
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create the user profile
    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username || null,
        full_name: full_name || null,
        role: role,
        avatar_url: null,
        phone: null
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the signup if profile creation fails
      // The user can still sign in and complete their profile later
    }

    return NextResponse.json({
      success: true,
      message: 'User account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

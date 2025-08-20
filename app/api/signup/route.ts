import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimitApp';

// Signup request schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userData: z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.enum(['buyer', 'seller', 'stylist', 'driver']),
    username: z.string().min(3, 'Username must be at least 3 characters'),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const supabase = await createRouteHandlerClient();
    
    // Create admin client for user creation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if username is taken
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', validatedData.userData.username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Create user account in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account', details: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user data returned' },
        { status: 500 }
      );
    }

    // Create profile record
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        full_name: validatedData.userData.full_name,
        username: validatedData.userData.username,
        role: validatedData.userData.role,
        has_completed_onboarding: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: validatedData.email,
        role: validatedData.userData.role,
      },
      profile: profileData,
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
// import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimitApp';

export const runtime = 'nodejs';

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
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Debug environment variables
    console.log('Environment variables check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    });

    // Clean up the service role key if it has formatting issues
    let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey && serviceRoleKey.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
      serviceRoleKey = serviceRoleKey.replace('SUPABASE_SERVICE_ROLE_KEY=', '');
    }

    // Create admin client for user creation
    const { createServiceRoleClient } = await import('@/lib/supabaseAdmin')
    const supabaseAdmin = createServiceRoleClient()

    // Create user account in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
      user_metadata: {
        full_name: validatedData.userData.full_name,
        role: validatedData.userData.role,
        username: validatedData.userData.username,
      }
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

    // For now, just return success without trying to create profile
    // The profile will be created by the database trigger or can be created later
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: validatedData.email,
        role: validatedData.userData.role,
      },
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
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

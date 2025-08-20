import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
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

    // For now, return a message indicating manual user creation is needed
    // In production, you would use Supabase Auth UI or implement proper admin flow
    return NextResponse.json({
      message: 'Signup endpoint working - manual user creation required',
      note: 'Due to Supabase configuration, users must be created manually in the dashboard for now',
      validatedData,
      nextSteps: [
        '1. Create user account in Supabase Auth dashboard',
        '2. Use the email and password provided',
        '3. Create profile record in profiles table',
        '4. Set has_completed_onboarding to false',
      ],
      timestamp: new Date().toISOString(),
    }, { status: 200 });

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

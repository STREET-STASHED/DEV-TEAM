import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimitApp';



export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Get user profile to determine redirect
    const { data: profile, error: profileError } = await (supabase as any).from('profiles')
      .select('has_completed_onboarding, role')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { redirectTo: '/onboarding' }
      );
    }

    // Determine redirect based on onboarding status and role
    let redirectTo = '/onboarding';

    if (profile.has_completed_onboarding) {
      // User has completed onboarding, redirect based on role
      switch (profile.role) {
        case 'buyer':
          redirectTo = '/dashboard';
          break;
        case 'seller':
          redirectTo = '/seller/dashboard';
          break;
        case 'stylist':
          redirectTo = '/stylist/dashboard';
          break;
        case 'driver':
          redirectTo = '/driver/dashboard';
          break;
        default:
          redirectTo = '/dashboard';
      }
    }

    return NextResponse.json({ redirectTo });

  } catch (error) {
    console.error('Redirect handler error:', error);
    return NextResponse.json(
      { redirectTo: '/onboarding' }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimitApp';
import { audit } from '@/lib/audit';
import { flags } from '@/lib/flags';
import { pushSubscriptionSchema } from '@/lib/schemas/viral';
import { analytics } from '@/lib/analytics';


function createSupabaseClient() {
  return createRouteHandlerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookies()).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            await Promise.all(
              cookiesToSet.map(({ name, value, options: _options }) =>
                cookieStore.set(name, value, _options)
              )
            )
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

export async function POST(request: NextRequest) {
  if (!flags.push) {
    return NextResponse.json({ error: 'Push notifications are disabled' }, { status: 403 });
  }

  try {
    // Get authenticated user
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { success } = await rateLimit(request);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = pushSubscriptionSchema.parse(body);

    // Store or update push token
    const { data: token, error: insertError } = await supabase
      .from('push_tokens')
      .upsert({
        user_id: user.id,
        token: validatedData.token,
        platform: validatedData.platform || 'web',
        last_used: new Date().toISOString(),
      }, {
        onConflict: 'user_id,token',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store push token:', insertError);
      return NextResponse.json({ error: 'Failed to subscribe to notifications' }, { status: 500 });
    }

    // Audit log
    await audit('push_token_subscribed', {
      userId: user.id,
      tokenId: token.id,
      platform: validatedData.platform || 'web',
    });

    // Analytics tracking
    analytics.track('push_subscription_created', {
      platform: validatedData.platform || 'web',
    }, user.id);

    return NextResponse.json({ 
      message: 'Successfully subscribed to push notifications',
      token: token.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!flags.push) {
    return NextResponse.json({ error: 'Push notifications are disabled' }, { status: 403 });
  }

  try {
    // Get authenticated user
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
    }

    // Parse request body to get token to remove
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Remove specific token
    const { error: deleteError } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('token', token);

    if (deleteError) {
      console.error('Failed to remove push token:', deleteError);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    // Audit log
    await audit('push_token_unsubscribed', {
      userId: user.id,
      token,
    });

    // Analytics tracking
    analytics.track('push_subscription_removed', {
      platform: 'web', // We could detect this from the token
    }, user.id);

    return NextResponse.json({ message: 'Successfully unsubscribed from push notifications' });
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!flags.push) {
    return NextResponse.json({ error: 'Push notifications are disabled' }, { status: 403 });
  }

  try {
    // Get authenticated user
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
    }

    // Get user's active push tokens
    const { data: tokens, error: fetchError } = await supabase
      .from('push_tokens')
      .select('id, token, platform, created_at, last_used')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Failed to fetch push tokens:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    return NextResponse.json({
      subscriptions: tokens || [],
      count: tokens?.length || 0,
    });
  } catch (error) {
    console.error('Push tokens fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

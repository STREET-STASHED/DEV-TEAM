import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimitApp';
import { flags } from '@/lib/flags';
import { shareLinkSchema } from '@/lib/schemas/viral';
import { analytics } from '@/lib/analytics';
import { generateUniversalLink } from '@/lib/deeplink';


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

export async function POST(request: NextRequest) {
  if (!flags.share) {
    return NextResponse.json({ error: 'Share feature is disabled' }, { status: 403 });
  }

  try {
    // Get authenticated user (optional for share links)
    const supabase = await createRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Rate limiting
    const { success } = await rateLimit(request);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many share link generations. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = shareLinkSchema.parse(body);

    // Generate the universal link
    const shareUrl = generateUniversalLink({
      type: validatedData.type,
      id: validatedData.id,
      platform: validatedData.platform,
    });

    // Analytics tracking
    if (user) {
      analytics.track('share_link_generated', {
        type: validatedData.type,
        platform: validatedData.platform || 'web',
      }, user.id);
    } else {
      analytics.track('share_link_generated', {
        type: validatedData.type,
        platform: validatedData.platform || 'web',
        anonymous: true,
      });
    }

    return NextResponse.json({
      shareUrl,
      type: validatedData.type,
      id: validatedData.id,
      expiresAt: null, // For now, links don't expire
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Share link generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!flags.share) {
    return NextResponse.json({ error: 'Share feature is disabled' }, { status: 403 });
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const platform = searchParams.get('platform') as 'web' | 'ios' | 'android' | null;

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    // Validate parameters
    const validatedData = shareLinkSchema.parse({
      type,
      id,
      platform: platform || undefined,
    });

    // Generate the universal link
    const shareUrl = generateUniversalLink(validatedData);

    return NextResponse.json({
      shareUrl,
      type: validatedData.type,
      id: validatedData.id,
      expiresAt: null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Share link generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

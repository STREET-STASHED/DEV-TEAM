import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
import { rateLimit } from '@/lib/rateLimitApp';
import { flags } from '@/lib/flags';
import { leaderboardQuerySchema } from '@/lib/schemas/viral';
import { analytics } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  if (!flags.leaderboard) {
    return NextResponse.json({ error: 'Leaderboard feature is disabled' }, { status: 403 });
  }

  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = leaderboardQuerySchema.parse(query);

    const supabase = await createRouteHandlerClient();

    // Try to use materialized view first, fallback to regular query
    let leaderboardData;
    let totalCount = 0;

    try {
      // Check if materialized view exists and has data
      const { data: viewData, error: viewError } = await supabase
        .from('referral_leaderboard')
        .select('*', { count: 'exact' });

      if (!viewError && viewData && viewData.length > 0) {
        // Use materialized view
        const offset = validatedQuery.offset;
        const limit = validatedQuery.limit;

        const { data, count } = await supabase
          .from('referral_leaderboard')
          .select('*', { count: 'exact' })
          .order('completed_orders', { ascending: false })
          .order('referred_orders', { ascending: false })
          .range(offset, offset + limit - 1);

        leaderboardData = data || [];
        totalCount = count || 0;
      } else {
        // Fallback to regular query
        throw new Error('Materialized view not available');
      }
    } catch {
      // Fallback: compute leaderboard on the fly - simplified to avoid foreign key issues
              // Using fallback query
      
      const offset = validatedQuery.offset;
      const limit = validatedQuery.limit;

      // Get total count
      const { count } = await supabase
        .from('referrals')
        .select('referrer_id', { count: 'exact', head: true });

      totalCount = count || 0;

      // Get leaderboard data - simplified query
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('referrer_id, created_at')
        .order('created_at', { ascending: false });

      if (referralsError) {
        throw referralsError;
      }

      // Process and aggregate data
      const referrerMap = new Map<string, { referrerId: string; referredCount: number }>();
      
      referralsData?.forEach(referral => {
        const referrerId = referral.referrer_id;
        const existing = referrerMap.get(referrerId);
        
        if (existing) {
          existing.referredCount++;
        } else {
          referrerMap.set(referrerId, {
            referrerId,
            referredCount: 1,
          });
        }
      });

      // Convert to array and sort by referral count
      leaderboardData = Array.from(referrerMap.values())
        .sort((a, b) => b.referredCount - a.referredCount)
        .slice(offset, offset + limit);
    }

    // Analytics tracking
    analytics.track('leaderboard_viewed', {
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
      totalCount,
    });

    return NextResponse.json({
      leaderboard: leaderboardData || [],
      pagination: {
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        total: totalCount,
        hasMore: validatedQuery.offset + validatedQuery.limit < totalCount,
      },
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to refresh the materialized view (admin only)
export async function POST() {
  if (!flags.leaderboard) {
    return NextResponse.json({ error: 'Leaderboard feature is disabled' }, { status: 403 });
  }

  try {
    // Check if user is admin
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role (you can customize this check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Refresh materialized view
    const { error } = await supabase.rpc('refresh_referral_leaderboard');

    if (error) {
      console.error('Failed to refresh leaderboard:', error);
      return NextResponse.json({ error: 'Failed to refresh leaderboard' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Leaderboard refreshed successfully' });
  } catch (error) {
    console.error('Leaderboard refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

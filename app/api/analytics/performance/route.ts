import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const body = await request.json();
    const { metric, value, id, timestamp, url, userAgent } = body;

    // Validate required fields
    if (!metric || value === undefined || !id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store performance data in Supabase
    const { data, error } = await (supabase as any).from('analytics_events')
      .insert([
        {
          event_type: `performance_${metric}`,
          event_data: {
            metric_name: metric,
            metric_value: value,
            metric_id: id,
            page_url: url,
            user_agent: userAgent,
            environment: process.env.NODE_ENV || 'development',
          },
          timestamp: new Date(timestamp).toISOString(),
        },
      ]);

    if (error) {
      console.error('Error storing performance data:', error);
      return NextResponse.json(
        { error: 'Failed to store performance data' },
        { status: 500 }
      );
    }

    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric recorded:', {
        metric,
        value,
        id,
        url,
        timestamp: new Date(timestamp).toISOString(),
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = (supabase as any)
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (metric) {
      query = query.eq('event_type', `performance_${metric}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching performance data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

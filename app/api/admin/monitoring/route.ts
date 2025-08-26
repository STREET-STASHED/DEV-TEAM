import { rateLimit } from '@/lib/rateLimitApp'
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'


// Unused function - keeping for future use
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

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = await createRouteHandlerClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get monitoring data from database
    const { data: metrics } = await supabase
      .from('monitoring_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    const { data: alerts } = await supabase
      .from('monitoring_alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    const { data: insights } = await supabase
      .from('monitoring_insights')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    // Calculate performance metrics
    const recentMetrics = metrics?.slice(0, 50) || []
    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.response_time, 0) / recentMetrics.length
      : 0
    const errorRate = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.error_rate, 0) / recentMetrics.length
      : 0
    const uptime = recentMetrics.length > 0
      ? (recentMetrics.filter(m => m.status_code < 400).length / recentMetrics.length) * 100
      : 100

    return NextResponse.json({
      isMonitoring: true, // This would come from the actual monitoring system
      totalMetrics: metrics?.length || 0,
      recentMetrics: metrics || [],
      alerts: alerts || [],
      insights: insights || [],
      performance: {
        avgResponseTime,
        errorRate,
        uptime
      }
    })

  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

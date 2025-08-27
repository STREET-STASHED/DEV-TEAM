import { rateLimit } from '@/lib/rateLimitApp'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'


// Unused function - keeping for future use

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

    const { data: profile } = await (supabase as any).from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get monitoring data from database
    const { data: metrics } = await (supabase as any).from('monitoring_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    const { data: alerts } = await (supabase as any).from('monitoring_alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    const { data: insights } = await (supabase as any).from('monitoring_insights')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    // Calculate performance metrics
    const recentMetrics = metrics?.slice(0, 50) || []
    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum: any, m: any) => sum + m.response_time, 0) / recentMetrics.length
      : 0
    const errorRate = recentMetrics.length > 0
      ? recentMetrics.reduce((sum: any, m: any) => sum + m.error_rate, 0) / recentMetrics.length
      : 0
    const uptime = recentMetrics.length > 0
      ? (recentMetrics.filter((m: any) => m.status_code < 400).length / recentMetrics.length) * 100
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

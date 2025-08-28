import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get current timestamp for calculations
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

    // Fetch real-time data from database
    const [
      activeUsersResult,
      ordersResult,
      revenueResult,
      pageViewsResult,
      sessionTimeResult
    ] = await Promise.all([
      // Active users (users with activity in last 15 minutes)
      supabase
        .from('user_behavior')
        .select('user_id')
        .gte('timestamp', new Date(now.getTime() - 15 * 60 * 1000).toISOString())
        .neq('user_id', null),

      // Orders in last hour
      supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', oneHourAgo.toISOString())
        .eq('status', 'completed'),

      // Revenue in last hour
      supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', oneHourAgo.toISOString())
        .eq('status', 'completed'),

      // Page views in last hour
      supabase
        .from('user_behavior')
        .select('id')
        .gte('timestamp', oneHourAgo.toISOString())
        .eq('action', 'view'),

      // Session time data
      supabase
        .from('user_behavior')
        .select('timestamp, user_id')
        .gte('timestamp', oneHourAgo.toISOString())
        .order('timestamp', { ascending: true })
    ])

    // Calculate metrics
    const activeUsers = activeUsersResult.data?.length || 0

    const ordersPerMinute = ordersResult.data?.length || 0

    const revenuePerHour = revenueResult.data?.reduce((sum, order) =>
      sum + (order.total_amount || 0), 0) || 0

    const pageViews = pageViewsResult.data?.length || 0

    // Calculate average session time
    let averageSessionTime = 0
    if (sessionTimeResult.data) {
      const sessions = new Map<string, { start: Date; end: Date }>()

      sessionTimeResult.data.forEach(record => {
        const userId = record.user_id || 'anonymous'
        const timestamp = new Date(record.timestamp)

        if (!sessions.has(userId)) {
          sessions.set(userId, { start: timestamp, end: timestamp })
        } else {
          const session = sessions.get(userId)!
          session.end = timestamp
        }
      })

      const sessionTimes = Array.from(sessions.values()).map(session =>
        session.end.getTime() - session.start.getTime()
      )

      if (sessionTimes.length > 0) {
        averageSessionTime = sessionTimes.reduce((sum, time) => sum + time, 0) / sessionTimes.length / 1000 // Convert to seconds
      }
    }

    // Calculate conversion rate (orders / page views)
    const conversionRate = pageViews > 0 ? (ordersPerMinute / pageViews) * 100 : 0

    // Mock performance metrics (in real app, these would come from monitoring systems)
    const serverResponseTime = Math.random() * 100 + 50 // 50-150ms
    const cacheHitRate = Math.random() * 20 + 80 // 80-100%

    // Return real-time data
    const realTimeData = {
      activeUsers,
      ordersPerMinute,
      revenuePerHour,
      conversionRate: Math.min(conversionRate, 100), // Cap at 100%
      pageViews,
      averageSessionTime: Math.round(averageSessionTime),
      serverResponseTime: Math.round(serverResponseTime),
      cacheHitRate: Math.round(cacheHitRate),
      timestamp: now.toISOString()
    }

    return NextResponse.json(realTimeData)

  } catch (error) {
    console.error('Error fetching real-time analytics:', error)

    // Return fallback data
    return NextResponse.json({
      activeUsers: 0,
      ordersPerMinute: 0,
      revenuePerHour: 0,
      conversionRate: 0,
      pageViews: 0,
      averageSessionTime: 0,
      serverResponseTime: 0,
      cacheHitRate: 0,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch real-time data'
    })
  }
}

// POST method for tracking events
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const eventData = await request.json()

    // Validate event data
    if (!eventData.type || !eventData.userId) {
      return NextResponse.json(
        { error: 'Missing required event data' },
        { status: 400 }
      )
    }

    // Track the event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventData.type,
        user_id: eventData.userId,
        session_id: eventData.sessionId,
        metadata: eventData.metadata || {},
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Error tracking analytics event:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in analytics POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

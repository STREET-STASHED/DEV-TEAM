import { aiMonitor } from '@/lib/ai/monitoring'
import { rateLimit } from '@/lib/rateLimitApp'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'



export async function POST(request: NextRequest) {
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

    // Start monitoring
    await aiMonitor.startMonitoring()

    return NextResponse.json({
      message: 'AI monitoring started successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Start monitoring error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '../../../../../lib/supabaseRouteHandler'
import { rateLimit } from '@/lib/rateLimitApp'
import { cookies } from 'next/headers'
import { aiMonitor } from '@/lib/ai/monitoring'


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

    // Stop monitoring
    aiMonitor.stopMonitoring()

    return NextResponse.json({
      message: 'AI monitoring stopped successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stop monitoring error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

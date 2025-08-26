import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers'


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

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's measurements
    const { data: measurements, error: measurementsError } = await supabase
      supabase.from('user_measurements')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (measurementsError && measurementsError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch measurements', details: measurementsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      measurements: measurements || null
    })

  } catch (error) {
    console.error('Get measurements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const measurementData = await request.json()
    
    // Validate required fields
    if (!measurementData.height || !measurementData.weight) {
      return NextResponse.json(
        { error: 'Height and weight are required' },
        { status: 400 }
      )
    }

    // Upsert the measurements
    const { data, error } = await supabase
      supabase.from('user_measurements')
      .upsert({
        user_id: session.user.id,
        height: measurementData.height,
        weight: measurementData.weight,
        chest: measurementData.chest || null,
        waist: measurementData.waist || null,
        hips: measurementData.hips || null,
        shoulders: measurementData.shoulders || null,
        inseam: measurementData.inseam || null,
        body_type: measurementData.body_type || 'regular'
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save measurements', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      measurements: data?.[0] || null
    })

  } catch (error) {
    console.error('Save measurements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const measurementData = await request.json()
    
    // Update the measurements
    const { data, error } = await supabase
      supabase.from('user_measurements')
      .update({
        height: measurementData.height,
        weight: measurementData.weight,
        chest: measurementData.chest,
        waist: measurementData.waist,
        hips: measurementData.hips,
        shoulders: measurementData.shoulders,
        inseam: measurementData.inseam,
        body_type: measurementData.body_type,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update measurements', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      measurements: data?.[0] || null
    })

  } catch (error) {
    console.error('Update measurements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

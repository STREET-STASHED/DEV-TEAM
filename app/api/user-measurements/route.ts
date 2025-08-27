import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'





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
    const { data: measurements, error: measurementsError } = await (supabase as any)
      .from('user_measurements')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

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
    const { data, error } = await (supabase as any)
      .from('user_measurements')
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
    const { data, error } = await (supabase as any)
      .from('user_measurements')
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
      .select('*')
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

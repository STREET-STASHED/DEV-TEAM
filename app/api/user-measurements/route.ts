import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user measurements
    const { data, error } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ measurements: data })
  } catch (error) {
    console.error('Error fetching user measurements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(_request:NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const measurements = await request.json()

    // Validate measurements
    const requiredFields = ['height', 'weight', 'chest', 'waist', 'hips', 'shoulders', 'inseam', 'bodyType']
    for (const field of requiredFields) {
      if (!measurements[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate ranges
    if (measurements.height < 48 || measurements.height > 84) {
      return NextResponse.json({ error: 'Height must be between 48 and 84 inches' }, { status: 400 })
    }

    if (measurements.weight < 80 || measurements.weight > 400) {
      return NextResponse.json({ error: 'Weight must be between 80 and 400 pounds' }, { status: 400 })
    }

    if (measurements.chest < 28 || measurements.chest > 60) {
      return NextResponse.json({ error: 'Chest measurement must be between 28 and 60 inches' }, { status: 400 })
    }

    if (measurements.waist < 24 || measurements.waist > 50) {
      return NextResponse.json({ error: 'Waist measurement must be between 24 and 50 inches' }, { status: 400 })
    }

    // Upsert measurements
    const { data, error } = await supabase
      .from('user_measurements')
      .upsert({
        user_id: user.id,
        height: measurements.height,
        weight: measurements.weight,
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
        shoulders: measurements.shoulders,
        inseam: measurements.inseam,
        body_type: measurements.bodyType
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      measurements: data 
    })
  } catch (error) {
    console.error('Error saving user measurements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const body = await request.json()
    const { driverId, location } = body

    if (!driverId || !location) {
      return NextResponse.json(
        { error: 'Driver ID and location are required' },
        { status: 400 }
      )
    }

    // Update driver location
    const { error } = await (supabase as any).from('driver_profiles')
      .update({
        last_location: location,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', driverId)

    if (error) {
      console.error('Failed to update driver location:', error)
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully'
    })

  } catch (error) {
    console.error('Driver location update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const body = await request.json()
    const { driverId, status, isOnline, isAvailable } = body

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (typeof isOnline === 'boolean') {
      updateData.is_online = isOnline
    }

    if (typeof isAvailable === 'boolean') {
      updateData.is_available = isAvailable
    }

    if (status) {
      updateData.status = status
    }

    // Update driver status
    const { error } = await supabase.from('driver_profiles')
      .update(updateData)
      .eq('user_id', driverId)

    if (error) {
      console.error('Failed to update driver status:', error)
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      data: updateData
    })

  } catch (error) {
    console.error('Driver status update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

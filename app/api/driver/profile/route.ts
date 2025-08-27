import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    // Get driver profile
    const { data: profile, error } = await (supabase as any).from('driver_profiles')
      .select('*')
      .eq('user_id', driverId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      )
    }

    // Get user profile for additional info
    const { data: userProfile } = await (supabase as any).from('profiles')
      .select('full_name, email, phone')
      .eq('id', driverId)
      .single()

    const formattedProfile = {
      id: profile.user_id,
      full_name: (profile as any).full_name || userProfile?.full_name,
      email: (profile as any).email || userProfile?.email,
      phone: (profile as any).phone || userProfile?.phone,
      rating: profile.rating || 5.0,
      is_online: profile.is_online || false,
      is_available: profile.is_available || false,
      vehicle_info: profile.vehicle_info || {},
      service_areas: (profile as any).service_areas || [],
      last_location: (profile as any).last_location,
      last_activity: (profile as any).last_activity,
      completion_rate: (profile as any).completion_rate || 100,
      total_orders: (profile as any).total_orders || 0,
      total_earnings: profile.total_earnings || 0,
      total_distance: (profile as any).total_distance || 0,
      tier: (profile as any).tier || 'Bronze',
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }

    return NextResponse.json({
      success: true,
      data: formattedProfile
    })

  } catch (error) {
    console.error('Driver profile GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const body = await request.json()
    const { driverId, updates } = body

    if (!driverId || !updates) {
      return NextResponse.json(
        { error: 'Driver ID and updates are required' },
        { status: 400 }
      )
    }

    // Validate updates
    const allowedUpdates = [
      'full_name', 'phone', 'email', 'vehicle_info', 'service_areas',
      'is_online', 'is_available', 'last_location', 'last_activity'
    ]

    const validUpdates: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = updates[key]
      }
    })

    // Add timestamp
    validUpdates.updated_at = new Date().toISOString()

    // Update driver profile
    const { data: updatedProfile, error } = await (supabase as any).from('driver_profiles')
      .update(validUpdates)
      .eq('user_id', driverId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update driver profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // If updating user profile fields, also update profiles table
    if (updates.full_name || updates.email || updates.phone) {
      const userUpdates: any = {}
      if (updates.full_name) userUpdates.full_name = updates.full_name
      if (updates.email) userUpdates.email = updates.email
      if (updates.phone) userUpdates.phone = updates.phone

      await supabase.from('profiles')
        .update(userUpdates)
        .eq('id', driverId)
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    })

  } catch (error) {
    console.error('Driver profile PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const body = await request.json()
    const { driverId, action, data } = body

    if (!driverId || !action) {
      return NextResponse.json(
        { error: 'Driver ID and action are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'go_online':
        await (supabase as any).from('driver_profiles')
          .update({
            is_online: true,
            is_available: true,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', driverId)

        return NextResponse.json({
          success: true,
          message: 'Driver is now online and available'
        })

      case 'go_offline':
        await (supabase as any).from('driver_profiles')
          .update({
            is_online: false,
            is_available: false,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', driverId)

        return NextResponse.json({
          success: true,
          message: 'Driver is now offline'
        })

      case 'update_location':
        if (!data?.location) {
          return NextResponse.json(
            { error: 'Location data is required' },
            { status: 400 }
          )
        }

        await (supabase as any).from('driver_profiles')
          .update({
            last_location: data.location,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', driverId)

        return NextResponse.json({
          success: true,
          message: 'Location updated successfully'
        })

      case 'update_availability':
        if (typeof data?.is_available !== 'boolean') {
          return NextResponse.json(
            { error: 'Availability status is required' },
            { status: 400 }
          )
        }

        await (supabase as any).from('driver_profiles')
          .update({
            is_available: data.is_available,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', driverId)

        return NextResponse.json({
          success: true,
          message: `Driver is now ${data.is_available ? 'available' : 'unavailable'}`
        })

      case 'update_vehicle_info':
        if (!data?.vehicle_info) {
          return NextResponse.json(
            { error: 'Vehicle information is required' },
            { status: 400 }
          )
        }

        await (supabase as any).from('driver_profiles')
          .update({
            vehicle_info: data.vehicle_info,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', driverId)

        return NextResponse.json({
          success: true,
          message: 'Vehicle information updated successfully'
        })

      case 'update_service_areas':
        if (!Array.isArray(data?.service_areas)) {
          return NextResponse.json(
            { error: 'Service areas must be an array' },
            { status: 400 }
          )
        }

        await (supabase as any).from('driver_profiles')
          .update({
            service_areas: data.service_areas,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', driverId)

        return NextResponse.json({
          success: true,
          message: 'Service areas updated successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Driver profile POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

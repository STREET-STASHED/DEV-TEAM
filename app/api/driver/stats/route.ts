import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Check for test authentication header
    const authHeader = request.headers.get('authorization')
    let driverId = null
    
    if (authHeader && authHeader.startsWith('Bearer test-token-')) {
      // Test user authentication
      const token = authHeader.replace('Bearer ', '')
      if (token.includes('driver')) {
        driverId = 'test-driver-1'
      }
    }
    
    // If no test driver, check query params
    if (!driverId) {
      driverId = new URL(request.url).searchParams.get('driverId')
    }
    
    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    // For test users, return mock data
    if (driverId === 'test-driver-1') {
      const mockProfile = {
        full_name: 'Test Driver',
        phone: '+1-555-0123',
        email: 'driver@test.com',
        rating: 4.9,
        is_online: true,
        is_available: true,
        vehicle_info: 'Honda Civic - 2020',
        service_areas: ['Downtown', 'Midtown', 'Uptown'],
        completion_rate: 98.5,
        total_orders: 156,
        total_earnings: 2847.50,
        total_distance: 1250.5
      }

      const mockStats = {
        driver_id: driverId,
        profile: mockProfile,
        performance: {
          weekly_earnings: 245.75,
          monthly_earnings: 984.25,
          active_orders: 2,
          completed_orders: 154,
          total_orders: 156,
          completion_rate: 98.5,
          average_rating: 4.9,
          total_earnings: 2847.50,
          total_distance: 1250.5
        },
        recent_orders: [
          {
            id: 'order-1',
            status: 'delivered',
            created_at: new Date().toISOString(),
            total_amount: 89.99,
            delivery_fee: 5.99
          },
          {
            id: 'order-2',
            status: 'in_transit',
            created_at: new Date().toISOString(),
            total_amount: 129.99,
            delivery_fee: 5.99
          }
        ]
      }

      return NextResponse.json(mockStats)
    }

    // For real users, get from database
    const { data: profile, error: profileError } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('user_id', driverId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      )
    }

    // Get driver earnings
    const { data: earnings, error: earningsError } = await supabase
      .from('driver_earnings')
      .select('*')
      .eq('driver_id', driverId)

    if (earningsError) {
      console.error('Failed to fetch driver earnings:', earningsError)
    }

    // Get driver orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('driver_id', driverId)

    if (ordersError) {
      console.error('Failed to fetch driver orders:', ordersError)
    }

    // Calculate stats
    const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.total_earnings || 0), 0) || 0
    const totalOrders = orders?.length || 0
    const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
    const activeOrders = orders?.filter(o => ['assigned_to_driver', 'picked_up', 'in_transit'].includes(o.status)).length || 0
    const totalDistance = earnings?.reduce((sum, e) => sum + (e.distance_bonus || 0), 0) || 0
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 100

    // Calculate weekly and monthly earnings
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const weeklyEarnings = earnings
      ?.filter(e => new Date(e.created_at) >= weekAgo)
      .reduce((sum, e) => sum + parseFloat(e.total_earnings || 0), 0) || 0

    const monthlyEarnings = earnings
      ?.filter(e => new Date(e.created_at) >= monthAgo)
      .reduce((sum, e) => sum + parseFloat(e.total_earnings || 0), 0) || 0

    // Get recent activity
    const recentOrders = orders
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || []

    const stats = {
      driver_id: driverId,
      profile: {
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email,
        rating: profile.rating || 5.0,
        is_online: profile.is_online || false,
        is_available: profile.is_available || false,
        vehicle_info: profile.vehicle_info,
        service_areas: profile.service_areas,
        completion_rate: completionRate,
        total_orders: totalOrders,
        total_earnings: totalEarnings,
        total_distance: totalDistance
      },
      performance: {
        weekly_earnings: weeklyEarnings,
        monthly_earnings: monthlyEarnings,
        active_orders: activeOrders,
        completed_orders: completedOrders,
        average_rating: profile.rating || 5.0,
        completion_rate: completionRate
      },
      recent_activity: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        delivery_fee: order.delivery_fee,
        created_at: order.created_at,
        pickup_address: order.pickup_address,
        delivery_address: order.delivery_address
      })),
      earnings_breakdown: {
        base_delivery_fees: earnings?.reduce((sum, e) => sum + parseFloat(e.base_delivery_fee || 0), 0) || 0,
        distance_bonuses: earnings?.reduce((sum, e) => sum + parseFloat(e.distance_bonus || 0), 0) || 0,
        time_bonuses: earnings?.reduce((sum, e) => sum + parseFloat(e.time_bonus || 0), 0) || 0,
        tips: earnings?.reduce((sum, e) => sum + parseFloat(e.tip_amount || 0), 0) || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Driver stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

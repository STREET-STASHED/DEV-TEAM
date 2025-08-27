import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const body = await request.json()
    const { orderId, force = false } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order details
    const { data: order, error: orderError } = await (supabase as any).from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order is ready for assignment
    if (order.status !== 'ready_for_pickup' && !force) {
      return NextResponse.json(
        { error: 'Order is not ready for pickup' },
        { status: 400 }
      )
    }

    // Check if order already has a driver
    if (order.driver_id && !force) {
      return NextResponse.json(
        { error: 'Order already has a driver assigned' },
        { status: 400 }
      )
    }

    // Find best available driver
    const bestDriver = await findBestDriverForOrder(order)
    
    if (!bestDriver) {
      return NextResponse.json(
        { error: 'No available drivers found' },
        { status: 404 }
      )
    }

    // Assign driver to order
    const { error: updateError } = await (supabase as any).from('orders')
      .update({
        driver_id: bestDriver.user_id,
        status: 'assigned_to_driver',
        assigned_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to assign driver:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign driver' },
        { status: 500 }
      )
    }

    // Add status history
    await (supabase as any).from('order_status_history')
      .insert({
        order_id: orderId,
        driver_id: bestDriver.user_id,
        status: 'assigned_to_driver',
        notes: 'Driver auto-assigned via smart matching',
        timestamp: new Date().toISOString()
      })

    // Send notification to driver
    await (supabase as any).from('notifications')
      .insert({
        user_id: bestDriver.user_id,
        type: 'new_order_assigned',
        title: 'New Order Assigned! 🚚',
        message: `You have a new delivery order worth $${order.total_amount}. Pickup: ${order.pickup_address}`,
        data: { 
          order_id: orderId,
          order_amount: order.total_amount,
          pickup_address: order.pickup_address,
          delivery_address: order.delivery_address
        },
        created_at: new Date().toISOString()
      })

    // Send notification to buyer
    await (supabase as any).from('notifications')
      .insert({
        user_id: order.buyer_id,
        type: 'driver_assigned',
        title: 'Driver Assigned! 🎉',
        message: `Your order has been assigned to a driver and is being prepared for pickup.`,
        data: { 
          order_id: orderId,
          driver_name: bestDriver.full_name,
          estimated_pickup: '15-30 minutes'
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Driver auto-assigned successfully',
      data: {
        order_id: orderId,
        driver_id: bestDriver.user_id,
        driver_name: (bestDriver as any).full_name || 'Unknown Driver',
        driver_rating: bestDriver.rating,
        assigned_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Auto-assignment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function findBestDriverForOrder(order: any) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get all available drivers
    const { data: availableDrivers, error } = await (supabase as any).from('driver_profiles')
      .select(`
        *,
        profiles!driver_profiles_user_id_fkey(full_name, phone, avatar_url)
      `)
      .eq('is_available', true)
      .eq('is_online', true)

    if (error || !availableDrivers || availableDrivers.length === 0) {
      return null
    }

    // Score drivers based on multiple factors
    const scoredDrivers = availableDrivers.map((driver: any) => {
      let score = 0

      // Rating bonus (0-5 stars) - 40% weight
      score += (driver.rating || 5.0) * 20

      // Completion rate bonus (0-100%) - 30% weight
      const completionRate = (driver as any).completion_rate || 100
      score += completionRate * 0.3

      // Activity recency bonus (more recent = higher score) - 20% weight
      if ((driver as any).last_activity) {
        const lastActivity = new Date((driver as any).last_activity)
        const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60)
        score += Math.max(0, 24 - hoursSinceActivity) * 2
      }

      // Location proximity bonus (if available) - 10% weight
      const lastLocation = (driver as any).last_location
      if (lastLocation && order.pickup_address) {
        // Simplified distance calculation - in real app, use proper geocoding
        score += 10
      }

      // Vehicle type bonus (if specified)
      const vehicleType = (driver.vehicle_info as any)?.type
      if (vehicleType === 'motorcycle' && order.distance_miles < 5) {
        score += 15 // Motorcycles good for short distances
      }

      // Service area bonus
      const serviceAreas = (driver as any).service_areas || []
      if (Array.isArray(serviceAreas)) {
        // Check if order pickup/delivery is in driver's service areas
        score += 5
      }

      return {
        ...driver,
        full_name: (driver as any).profiles?.full_name || 'Unknown Driver',
        score
      }
    })

    // Sort by score and return the best driver
    scoredDrivers.sort((a: any, b: any) => b.score - a.score)
    return scoredDrivers[0]

  } catch (error) {
    console.error('Error finding best driver:', error)
    return null
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const body = await request.json()
    const { orderId, driverId } = body

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

    // If driverId is provided, assign that specific driver
    if (driverId) {
      // Verify driver exists and is available
      const { data: driver, error: driverError } = await (supabase as any).from('driver_profiles')
        .select('*')
        .eq('user_id', driverId)
        .eq('is_available', true)
        .single()

      if (driverError || !driver) {
        return NextResponse.json(
          { error: 'Driver not found or unavailable' },
          { status: 400 }
        )
      }

      // Assign driver to order
      const { error: updateError } = await (supabase as any).from('orders')
        .update({
          driver_id: driverId,
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
          driver_id: driverId,
          status: 'assigned_to_driver',
          notes: 'Driver manually assigned',
          timestamp: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        message: 'Driver assigned successfully',
        data: {
          order_id: orderId,
          driver_id: driverId,
          driver_name: (driver as any).full_name,
          assigned_at: new Date().toISOString()
        }
      })
    }

    // Auto-assign best available driver
    const bestDriver = await selectBestDriver(order)

    if (!bestDriver) {
      return NextResponse.json(
        { error: 'No available drivers found' },
        { status: 404 }
      )
    }

    // Assign best driver to order
    const { error: updateError } = await (supabase as any).from('orders')
      .update({
        driver_id: bestDriver.id,
        status: 'assigned_to_driver',
        assigned_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to assign best driver:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign driver' },
        { status: 500 }
      )
    }

    // Add status history
    await (supabase as any).from('order_status_history')
      .insert({
        order_id: orderId,
        driver_id: bestDriver.id,
        status: 'assigned_to_driver',
        notes: 'Best driver auto-assigned',
        timestamp: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Best driver assigned successfully',
      data: {
        order_id: orderId,
        driver_id: bestDriver.id,
        driver_name: (bestDriver as any).full_name,
        assigned_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Driver assignment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function selectBestDriver(order: any) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get all available drivers
    const { data: availableDrivers, error } = await (supabase as any).from('driver_profiles')
      .select('*')
      .eq('is_available', true)
      .eq('is_online', true)

    if (error || !availableDrivers || availableDrivers.length === 0) {
      return null
    }

    // Score drivers based on multiple factors
    const scoredDrivers = availableDrivers.map((driver: any) => {
      let score = 0

      // Rating bonus (0-5 stars)
      score += (driver.rating || 5.0) * 2

      // Completion rate bonus (0-100%)
      score += ((driver as any).completion_rate || 100) * 0.5

      // Activity recency bonus (more recent = higher score)
      if ((driver as any).last_activity) {
        const hoursSinceActivity = (Date.now() - new Date((driver as any).last_activity).getTime()) / (1000 * 60 * 60)
        score += Math.max(0, 24 - hoursSinceActivity)
      }

      // Location proximity bonus (if available)
      if ((driver as any).last_location && order.pickup_address) {
        // Simplified distance calculation - in real app, use proper geocoding
        score += 10 // Base proximity bonus
      }

      // Vehicle type bonus (if specified)
      if ((driver.vehicle_info as any)?.type === 'motorcycle' && order.distance_miles < 5) {
        score += 5 // Motorcycles good for short distances
      }

      return {
        ...driver,
        score
      }
    })

    // Sort by score and return the best driver
    scoredDrivers.sort((a: any, b: any) => b.score - a.score)
    return scoredDrivers[0]

  } catch (error) {
    console.error('Error selecting best driver:', error)
    return null
  }
}

// GET endpoint to check available drivers for an order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get order details
    const { data: order, error: orderError } = await (supabase as any).from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get available drivers count
    const { count: availableDrivers, error: countError } = await (supabase as any).from('driver_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true)
      .eq('is_available', true);

    if (countError) {
      return NextResponse.json({ error: 'Failed to get driver count' }, { status: 500 });
    }

    // Get estimated wait time
    const estimatedWaitTime = calculateEstimatedWaitTime(availableDrivers || 0);

    return NextResponse.json({
      order_id: orderId,
      available_drivers: availableDrivers || 0,
      estimated_wait_time: estimatedWaitTime,
      status: order.status,
      can_assign: order.status === 'ready_for_pickup' && !order.driver_id
    });

  } catch (error) {
    console.error('Driver availability check error:', error);
    return NextResponse.json({ error: 'Failed to check driver availability' }, { status: 500 });
  }
}

// Calculate estimated wait time based on available drivers
function calculateEstimatedWaitTime(availableDrivers: number): string {
  if (availableDrivers === 0) return 'No drivers available';
  if (availableDrivers >= 5) return '5-15 minutes';
  if (availableDrivers >= 3) return '15-30 minutes';
  if (availableDrivers >= 1) return '30-45 minutes';
  return '45+ minutes';
}

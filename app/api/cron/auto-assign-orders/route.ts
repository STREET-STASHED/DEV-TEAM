import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Check for cron service authentication (optional for testing)
    const authHeader = request.headers.get('authorization')
    const isCronService = authHeader === `Bearer ${process.env.CRON_SECRET_KEY}`
    
    // For testing purposes, allow requests without proper auth
    if (!isCronService && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all orders ready for pickup
    const { data: readyOrders, error: ordersError } = await (supabase as any).from('orders')
      .select('*')
      .eq('status', 'ready_for_pickup')
      .is('driver_id', null)
      .order('created_at', { ascending: true }) // First-come-first-serve

    if (ordersError) {
      console.error('Failed to fetch ready orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch ready orders' },
        { status: 500 }
      )
    }

    if (!readyOrders || readyOrders.length === 0) {
      return NextResponse.json({ 
        message: 'No orders ready for assignment',
        assigned_count: 0
      })
    }

    // Get all available drivers
    const { data: availableDrivers, error: driversError } = await (supabase as any).from('driver_profiles')
      .select(`
        *,
        profiles!driver_profiles_user_id_fkey(full_name, phone, avatar_url)
      `)
      .eq('is_online', true)
      .eq('is_available', true)
      .order('last_activity', { ascending: false })

    if (driversError) {
      console.error('Failed to fetch available drivers:', driversError)
      return NextResponse.json(
        { error: 'Failed to fetch available drivers' },
        { status: 500 }
      )
    }

    if (!availableDrivers || availableDrivers.length === 0) {
      return NextResponse.json({ 
        message: 'No drivers currently available',
        assigned_count: 0,
        pending_orders: readyOrders.length
      })
    }

    let assignedCount = 0
    const assignmentResults = []
    const currentAvailableDrivers = [...availableDrivers]

    // Assign orders to drivers (first-come-first-serve)
    for (const order of readyOrders) {
      // Find the best available driver for this order
      const bestDriver = findBestDriverForOrder(currentAvailableDrivers, order)
      
      if (bestDriver) {
        try {
          // Assign the order
          const { error: assignmentError } = await (supabase as any).from('orders')
            .update({
              driver_id: bestDriver.user_id,
              status: 'assigned_to_driver',
              assigned_at: new Date().toISOString()
            })
            .eq('id', order.id)

          if (assignmentError) {
            console.error(`Failed to assign order ${order.id}:`, assignmentError)
            continue
          }

          // Add status history
          await (supabase as any).from('order_status_history')
            .insert({
              order_id: order.id,
              driver_id: bestDriver.user_id,
              status: 'assigned_to_driver',
              notes: 'Driver auto-assigned via cron job',
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
                order_id: order.id,
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
                order_id: order.id,
                driver_name: bestDriver.profiles?.full_name,
                estimated_pickup: '15-30 minutes'
              },
              created_at: new Date().toISOString()
            })

          assignedCount++
          assignmentResults.push({
            order_id: order.id,
            driver_id: bestDriver.user_id,
            driver_name: bestDriver.profiles?.full_name,
            assignment_time: new Date().toISOString()
          })

          // Remove this driver from available list for this batch
          const driverIndex = currentAvailableDrivers.findIndex(d => d.user_id === bestDriver.user_id)
          if (driverIndex > -1) {
            currentAvailableDrivers.splice(driverIndex, 1)
          }

        } catch (error) {
          console.error(`Error assigning order ${order.id}:`, error)
        }
      }
    }

    // Log the cron job execution
    await (supabase as any).from('cron_job_logs')
      .insert({
        job_name: 'auto_assign_orders',
        executed_at: new Date().toISOString(),
        success: true,
        details: {
          orders_processed: readyOrders.length,
          orders_assigned: assignedCount,
          available_drivers: availableDrivers.length,
          assignments: assignmentResults
        }
      })

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${assignedCount} orders`,
      assigned_count: assignedCount,
      total_ready_orders: readyOrders.length,
      available_drivers: availableDrivers.length,
      assignments: assignmentResults
    })

  } catch (error) {
    console.error('Cron auto-assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-assign orders' },
      { status: 500 }
    )
  }
}

// Find the best driver for a specific order
function findBestDriverForOrder(availableDrivers: any[], order: any) {
  if (availableDrivers.length === 0) return null

  // Score drivers based on multiple factors
  const scoredDrivers = availableDrivers.map(driver => {
    let score = 0
    
    // Rating score (40% weight)
    score += (driver.rating || 4.0) * 10
    
    // Completion rate score (30% weight)
    score += (driver.completion_rate || 85) * 0.3
    
    // Activity score (20% weight) - prefer recently active drivers
    const lastActivity = new Date(driver.last_activity || Date.now())
    const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60)
    score += Math.max(0, 24 - hoursSinceActivity)
    
    // Distance score (10% weight) - if we have location data
    if (driver.last_location && order.pickup_address) {
      // This would calculate actual distance in production
      // For now, we'll use a simple heuristic
      score += 5 // Base score for location
    }

    return { ...driver, score }
  })

  // Sort by score (highest first) and return the best driver
  scoredDrivers.sort((a, b) => b.score - a.score)
  
  return scoredDrivers[0]
}

// GET endpoint to check auto-assignment status
export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get statistics
    const { count: readyOrders } = await (supabase as any).from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready_for_pickup')
      .is('driver_id', null)

    const { count: availableDrivers } = await (supabase as any).from('driver_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true)
      .eq('is_available', true)

    const { count: assignedOrders } = await (supabase as any).from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'assigned_to_driver')

    return NextResponse.json({
      ready_for_assignment: readyOrders || 0,
      available_drivers: availableDrivers || 0,
      currently_assigned: assignedOrders || 0,
      can_auto_assign: (readyOrders || 0) > 0 && (availableDrivers || 0) > 0,
      estimated_wait_time: calculateEstimatedWaitTime(readyOrders || 0, availableDrivers || 0)
    })

  } catch (error) {
    console.error('Auto-assignment status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check auto-assignment status' },
      { status: 500 }
    )
  }
}

// Calculate estimated wait time based on orders and drivers
function calculateEstimatedWaitTime(readyOrders: number, availableDrivers: number): string {
  if (availableDrivers === 0) return 'No drivers available'
  if (readyOrders === 0) return 'No orders waiting'
  
  const ratio = readyOrders / availableDrivers
  
  if (ratio <= 1) return '5-15 minutes'
  if (ratio <= 2) return '15-30 minutes'
  if (ratio <= 3) return '30-45 minutes'
  return '45+ minutes'
}

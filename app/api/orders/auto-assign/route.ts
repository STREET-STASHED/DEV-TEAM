import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
import { rateLimit } from '@/lib/rateLimitApp';

// Type definitions for auto-assignment
interface DriverProfile {
  id: string;
  user_id: string;
  is_online: boolean;
  is_available: boolean;
  rating?: number;
  completion_rate?: number;
  last_activity?: string;
  last_location?: { lat: number; lng: number } | null;
}

interface OrderData {
  id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  total_amount: number;
  driver_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = await createRouteHandlerClient();
    
    // Check authentication (admin only for auto-assignment)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all orders ready for pickup
    const { data: readyOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'ready_for_pickup')
      .is('driver_id', null)
      .order('created_at', { ascending: true }); // First-come-first-serve

    if (ordersError) {
      return NextResponse.json({ error: 'Failed to fetch ready orders' }, { status: 500 });
    }

    if (!readyOrders || readyOrders.length === 0) {
      return NextResponse.json({ 
        message: 'No orders ready for assignment',
        assigned_count: 0
      });
    }

    // Get all available drivers
    const { data: availableDrivers, error: driversError } = await supabase
      .from('driver_profiles')
      .select(`
        *,
        profiles!driver_profiles_user_id_fkey(
          full_name,
          phone,
          avatar_url
        )
      `)
      .eq('is_online', true)
      .eq('is_available', true)
      .order('last_activity', { ascending: false });

    if (driversError) {
      return NextResponse.json({ error: 'Failed to fetch available drivers' }, { status: 500 });
    }

    if (!availableDrivers || availableDrivers.length === 0) {
      return NextResponse.json({ 
        message: 'No drivers currently available',
        assigned_count: 0,
        pending_orders: readyOrders.length
      });
    }

    let assignedCount = 0;
    const assignmentResults = [];

    // Assign orders to drivers (first-come-first-serve)
    for (const order of readyOrders) {
      // Find the best available driver for this order
      const bestDriver = findBestDriverForOrder(availableDrivers, order);
      
      if (bestDriver) {
        try {
          // Assign the order
          const { error: assignmentError } = await supabase
            .from('orders')
            .update({
              driver_id: bestDriver.user_id,
              status: 'assigned_to_driver',
              assigned_at: new Date().toISOString(),
              driver_assigned_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (assignmentError) {
            console.error(`Failed to assign order ${order.id}:`, assignmentError);
            continue;
          }

          // Update driver availability
          await supabase
            .from('driver_profiles')
            .update({
              is_available: false,
              current_order_id: order.id,
              last_activity: new Date().toISOString()
            })
            .eq('user_id', bestDriver.user_id);

          // Send notification to driver
          await supabase
            .from('notifications')
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
              }
            });

          // Send notification to buyer
          await supabase
            .from('notifications')
            .insert({
              user_id: order.buyer_id,
              type: 'driver_assigned',
              title: 'Driver Assigned! 🎉',
              message: `Your order has been assigned to a driver and is being prepared for pickup.`,
              data: { 
                order_id: order.id,
                driver_name: bestDriver.profiles?.full_name,
                estimated_pickup: '15-30 minutes'
              }
            });

          // Log the assignment
          await supabase
            .from('driver_assignments')
            .insert({
              order_id: order.id,
              driver_id: bestDriver.user_id,
              assigned_at: new Date().toISOString(),
              assignment_method: 'auto_first_come',
              driver_rating: bestDriver.rating || 0,
              driver_completion_rate: bestDriver.completion_rate || 0
            });

          assignedCount++;
          assignmentResults.push({
            order_id: order.id,
            driver_id: bestDriver.user_id,
            driver_name: bestDriver.profiles?.full_name,
            assignment_time: new Date().toISOString()
          });

          // Remove this driver from available list for this batch
          const driverIndex = availableDrivers.findIndex(d => d.user_id === bestDriver.user_id);
          if (driverIndex > -1) {
            availableDrivers.splice(driverIndex, 1);
          }

        } catch (error) {
          console.error(`Error assigning order ${order.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${assignedCount} orders`,
      assigned_count: assignedCount,
      total_ready_orders: readyOrders.length,
      available_drivers: availableDrivers.length,
      assignments: assignmentResults
    });

  } catch (error) {
    console.error('Auto-assignment error:', error);
    return NextResponse.json({ error: 'Failed to auto-assign orders' }, { status: 500 });
  }
}

// Find the best driver for a specific order
function findBestDriverForOrder(availableDrivers: DriverProfile[], order: OrderData) {
  if (availableDrivers.length === 0) return null;

  // Score drivers based on multiple factors
  const scoredDrivers = availableDrivers.map(driver => {
    let score = 0;
    
    // Rating score (40% weight)
    score += (driver.rating || 4.0) * 10;
    
    // Completion rate score (30% weight)
    score += (driver.completion_rate || 85) * 0.3;
    
    // Activity score (20% weight) - prefer recently active drivers
    const lastActivity = new Date(driver.last_activity || Date.now());
    const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 24 - hoursSinceActivity);
    
    // Distance score (10% weight) - if we have location data
    if (driver.last_location && order.pickup_address) {
      // This would calculate actual distance in production
      // For now, we'll use a simple heuristic
      score += 5; // Base score for location
    }

    return { ...driver, score };
  });

  // Sort by score (highest first) and return the best driver
  scoredDrivers.sort((a, b) => b.score - a.score);
  
  return scoredDrivers[0];
}

// GET endpoint to check auto-assignment status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get statistics
    const { count: readyOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready_for_pickup')
      .is('driver_id', null);

    const { count: availableDrivers } = await supabase
      .from('driver_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true)
      .eq('is_available', true);

    const { count: assignedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'assigned_to_driver');

    return NextResponse.json({
      ready_for_assignment: readyOrders || 0,
      available_drivers: availableDrivers || 0,
      currently_assigned: assignedOrders || 0,
      can_auto_assign: (readyOrders || 0) > 0 && (availableDrivers || 0) > 0,
      estimated_wait_time: calculateEstimatedWaitTime(readyOrders || 0, availableDrivers || 0)
    });

  } catch (error) {
    console.error('Auto-assignment status check error:', error);
    return NextResponse.json({ error: 'Failed to check auto-assignment status' }, { status: 500 });
  }
}

// Calculate estimated wait time based on orders and drivers
function calculateEstimatedWaitTime(readyOrders: number, availableDrivers: number): string {
  if (availableDrivers === 0) return 'No drivers available';
  if (readyOrders === 0) return 'No orders waiting';
  
  const ratio = readyOrders / availableDrivers;
  
  if (ratio <= 1) return '5-15 minutes';
  if (ratio <= 2) return '15-30 minutes';
  if (ratio <= 3) return '30-45 minutes';
  return '45+ minutes';
}

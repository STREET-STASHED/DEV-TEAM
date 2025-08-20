import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';

// Type definitions for cron job
interface DriverProfile {
  id: string;
  user_id: string;
  is_online: boolean;
  is_available: boolean;
  rating?: number;
  completion_rate?: number;
  last_activity?: string;
  last_location?: { lat: number; lng: number } | null;
  profiles?: {
    full_name: string;
    phone: string;
    avatar_url?: string;
  };
}

interface OrderData {
  id: string;
  status: string;
  buyer_id: string;
  seller_id: string;
  pickup_address: string;
  delivery_address: string;
  total_amount: number;
  driver_id?: string;
  created_at: string;
}

// This endpoint is designed to be called by a cron job service
// (e.g., Vercel Cron, GitHub Actions, or external cron service)
// It automatically assigns orders to available drivers

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createRouteHandlerClient();
    
    // Get all orders ready for pickup
    const { data: readyOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, buyer_id, seller_id, total_amount, pickup_address, delivery_address, created_at')
      .eq('status', 'ready_for_pickup')
      .is('driver_id', null)
      .order('created_at', { ascending: true }); // First-come-first-serve

    if (ordersError) {
      console.error('Failed to fetch ready orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch ready orders' }, { status: 500 });
    }

    if (!readyOrders || readyOrders.length === 0) {
      return NextResponse.json({ 
        message: 'No orders ready for assignment',
        assigned_count: 0,
        timestamp: new Date().toISOString()
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
      console.error('Failed to fetch available drivers:', driversError);
      return NextResponse.json({ error: 'Failed to fetch available drivers' }, { status: 500 });
    }

    if (!availableDrivers || availableDrivers.length === 0) {
      return NextResponse.json({ 
        message: 'No drivers currently available',
        assigned_count: 0,
        pending_orders: readyOrders.length,
        timestamp: new Date().toISOString()
      });
    }

    let assignedCount = 0;
    const assignmentResults = [];
    const availableDriversCopy = [...availableDrivers];

    // Assign orders to drivers (first-come-first-serve)
    for (const order of readyOrders) {
      // Find the best available driver for this order
      const bestDriver = findBestDriverForOrder(availableDriversCopy, order);
      
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
              assignment_method: 'cron_auto_assignment',
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
          const driverIndex = availableDriversCopy.findIndex(d => d.user_id === bestDriver.user_id);
          if (driverIndex > -1) {
            availableDriversCopy.splice(driverIndex, 1);
          }

          // Log successful assignment
          console.log(`✅ Auto-assigned order ${order.id} to driver ${bestDriver.user_id}`);

        } catch (error) {
          console.error(`Error assigning order ${order.id}:`, error);
        }
      }
    }

    // Log the cron job execution
    await supabase
      .from('cron_job_logs')
      .insert({
        job_name: 'auto_assign_orders',
        executed_at: new Date().toISOString(),
        orders_processed: readyOrders.length,
        orders_assigned: assignedCount,
        drivers_available: availableDrivers.length,
        success: true,
        details: {
          assignments: assignmentResults,
          remaining_orders: readyOrders.length - assignedCount,
          remaining_drivers: availableDriversCopy.length
        }
      });

    return NextResponse.json({
      success: true,
      message: `Cron job completed successfully`,
      assigned_count: assignedCount,
      total_ready_orders: readyOrders.length,
      available_drivers: availableDrivers.length,
      remaining_drivers: availableDriversCopy.length,
      assignments: assignmentResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    
    // Log the failed cron job
    try {
      const supabase = await createRouteHandlerClient();
      await supabase
        .from('cron_job_logs')
        .insert({
          job_name: 'auto_assign_orders',
          executed_at: new Date().toISOString(),
          orders_processed: 0,
          orders_assigned: 0,
          drivers_available: 0,
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
    } catch (logError) {
      console.error('Failed to log cron job error:', logError);
    }
    
    return NextResponse.json({ 
      error: 'Cron job failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
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
  
  // Return the driver without the score property to maintain the original structure
  const bestDriver = scoredDrivers[0];
  return {
    id: bestDriver.id,
    user_id: bestDriver.user_id,
    is_online: bestDriver.is_online,
    is_available: bestDriver.is_available,
    rating: bestDriver.rating,
    completion_rate: bestDriver.completion_rate,
    last_activity: bestDriver.last_activity,
    last_location: bestDriver.last_location,
    profiles: bestDriver.profiles
  };
}

// POST endpoint for manual triggering (useful for testing)
export async function POST(request: NextRequest) {
  // Redirect to GET for manual execution
  return GET(request);
}

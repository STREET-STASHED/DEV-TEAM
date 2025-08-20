import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
import { rateLimit } from '@/lib/rateLimitApp';

// Type definitions for driver assignment
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
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };
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
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'ready_for_pickup') {
      return NextResponse.json({ error: 'Order is not ready for pickup' }, { status: 400 });
    }

    if (order.driver_id) {
      return NextResponse.json({ error: 'Order already has a driver assigned' }, { status: 400 });
    }

    // Find available drivers (first-come-first-serve with smart matching)
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
      .order('last_activity', { ascending: false }); // Most recently active first

    if (driversError) {
      return NextResponse.json({ error: 'Failed to find available drivers' }, { status: 500 });
    }

    if (!availableDrivers || availableDrivers.length === 0) {
      return NextResponse.json({ 
        error: 'No drivers currently available',
        code: 'NO_DRIVERS_AVAILABLE'
      }, { status: 404 });
    }

    // Smart driver selection algorithm
    const selectedDriver = selectBestDriver(availableDrivers, order);

    if (!selectedDriver) {
      return NextResponse.json({ 
        error: 'No suitable driver found for this order',
        code: 'NO_SUITABLE_DRIVER'
      }, { status: 404 });
    }

    // Assign order to driver
    const { error: assignmentError } = await supabase
      .from('orders')
      .update({
        driver_id: selectedDriver.user_id,
        status: 'assigned_to_driver',
        assigned_at: new Date().toISOString(),
        driver_assigned_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (assignmentError) {
      return NextResponse.json({ error: 'Failed to assign driver' }, { status: 500 });
    }

    // Update driver availability
    await supabase
      .from('driver_profiles')
      .update({
        is_available: false,
        current_order_id: orderId,
        last_activity: new Date().toISOString()
      })
      .eq('user_id', selectedDriver.user_id);

    // Send notification to driver
    await supabase
      .from('notifications')
      .insert({
        user_id: selectedDriver.user_id,
        type: 'new_order_assigned',
        title: 'New Order Assigned! 🚚',
        message: `You have a new delivery order worth $${order.total_amount}. Pickup: ${order.pickup_address}`,
        data: { 
          order_id: orderId,
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
          order_id: orderId,
          driver_name: selectedDriver.profiles?.full_name,
          estimated_pickup: '15-30 minutes'
        }
      });

    // Log the assignment
    await supabase
      .from('driver_assignments')
      .insert({
        order_id: orderId,
        driver_id: selectedDriver.user_id,
        assigned_at: new Date().toISOString(),
        assignment_method: 'smart_matching',
        driver_rating: selectedDriver.rating || 0,
        driver_completion_rate: selectedDriver.completion_rate || 0
      });

    return NextResponse.json({
      success: true,
      driver: {
        id: selectedDriver.user_id,
        name: selectedDriver.profiles?.full_name,
        phone: selectedDriver.profiles?.phone,
        rating: selectedDriver.rating,
        completion_rate: selectedDriver.completion_rate
      },
      order: {
        id: orderId,
        status: 'assigned_to_driver',
        assigned_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Driver assignment error:', error);
    return NextResponse.json({ error: 'Failed to assign driver' }, { status: 500 });
  }
}

// Smart driver selection algorithm
function selectBestDriver(drivers: DriverProfile[], order: OrderData) {
  // Filter drivers by basic criteria
  const eligibleDrivers = drivers.filter(driver => {
    // Driver must be online and available
    if (!driver.is_online || !driver.is_available) return false;
    
    // Driver must have good rating (4.0+)
    if (driver.rating && driver.rating < 4.0) return false;
    
    // Driver must have decent completion rate (80%+)
    if (driver.completion_rate && driver.completion_rate < 80) return false;
    
    return true;
  });

  if (eligibleDrivers.length === 0) return null;

  // Score drivers based on multiple factors
  const scoredDrivers = eligibleDrivers.map(driver => {
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
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get available drivers count
    const { count: availableDrivers, error: countError } = await supabase
      .from('driver_profiles')
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

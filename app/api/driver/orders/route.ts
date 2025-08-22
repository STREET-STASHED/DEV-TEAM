import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!orders_buyer_id_fkey(full_name, phone, email),
        seller:profiles!orders_seller_id_fkey(full_name, phone, email),
        order_items(*)
      `)
      .eq('driver_id', driverId)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply limit and ordering
    query = query
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data: orders, error } = await query

    if (error) {
      console.error('Failed to fetch driver orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Format orders with additional information
    const formattedOrders = orders?.map(order => ({
      id: order.id,
      status: order.status,
      buyer: {
        id: order.buyer_id,
        name: order.buyer?.full_name || 'Unknown',
        phone: order.buyer?.phone || 'N/A',
        email: order.buyer?.email || 'N/A'
      },
      seller: {
        id: order.seller_id,
        name: order.seller?.full_name || 'Unknown',
        phone: order.seller?.phone || 'N/A',
        email: order.seller?.email || 'N/A'
      },
      pickup_address: order.pickup_address,
      delivery_address: order.delivery_address,
      total_amount: order.total_amount,
      delivery_fee: order.delivery_fee,
      distance_miles: order.distance_miles,
      created_at: order.created_at,
      assigned_at: order.assigned_at,
      picked_up_at: order.picked_up_at,
      delivered_at: order.delivered_at,
      items: order.order_items || [],
      estimated_earnings: calculateEstimatedEarnings(order),
      status_timeline: getStatusTimeline(order)
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      pagination: {
        total: formattedOrders.length,
        limit,
        has_more: formattedOrders.length === limit
      }
    })

  } catch (error) {
    console.error('Driver orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driverId, orderId, action, notes, location } = body

    if (!driverId || !orderId || !action) {
      return NextResponse.json(
        { error: 'Driver ID, order ID, and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    let statusHistoryData: any = {}

    switch (action) {
      case 'accept_order':
        updateData = {
          status: 'assigned_to_driver',
          assigned_at: new Date().toISOString()
        }
        statusHistoryData = {
          status: 'assigned_to_driver',
          notes: 'Driver accepted order'
        }
        break

      case 'pick_up':
        updateData = {
          status: 'picked_up',
          picked_up_at: new Date().toISOString()
        }
        statusHistoryData = {
          status: 'picked_up',
          notes: 'Order picked up from seller',
          location: location || 'Seller location'
        }
        break

      case 'start_delivery':
        updateData = {
          status: 'in_transit'
        }
        statusHistoryData = {
          status: 'in_transit',
          notes: 'Started delivery to buyer',
          location: location || 'En route'
        }
        break

      case 'deliver':
        updateData = {
          status: 'delivered',
          delivered_at: new Date().toISOString()
        }
        statusHistoryData = {
          status: 'delivered',
          notes: 'Order delivered successfully',
          location: location || 'Buyer location'
        }
        break

      case 'update_location':
        // Update driver's last known location
        await supabase
          .from('driver_profiles')
          .update({
            last_location: location,
            last_activity: new Date().toISOString()
          })
          .eq('user_id', driverId)

        return NextResponse.json({
          success: true,
          message: 'Location updated'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('driver_id', driverId)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Add status history
    if (statusHistoryData.status) {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          driver_id: driverId,
          ...statusHistoryData,
          timestamp: new Date().toISOString()
        })
    }

    // Send notification to buyer
    if (['picked_up', 'in_transit', 'delivered'].includes(action)) {
      await supabase
        .from('notifications')
        .insert({
          user_id: (await supabase.from('orders').select('buyer_id').eq('id', orderId).single()).data?.buyer_id,
          type: `delivery_${action}`,
          title: getNotificationTitle(action),
          message: getNotificationMessage(action),
          data: { order_id: orderId, driver_id: driverId },
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      message: `Order ${action} successful`,
      data: updateData
    })

  } catch (error) {
    console.error('Driver orders POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateEstimatedEarnings(order: any) {
  const baseDeliveryFee = order.delivery_fee || 0
  const distanceBonus = (order.distance_miles || 0) * 0.50 // $0.50 per mile
  const timeBonus = 0 // Could be calculated based on delivery time
  const tipAmount = 0 // Would come from buyer
  
  return {
    base_delivery_fee: baseDeliveryFee,
    distance_bonus: distanceBonus,
    time_bonus: timeBonus,
    tip_amount: tipAmount,
    total: baseDeliveryFee + distanceBonus + timeBonus + tipAmount
  }
}

function getStatusTimeline(order: any) {
  const timeline = [
    { status: 'order_placed', timestamp: order.created_at, label: 'Order Placed' }
  ]

  if (order.assigned_at) {
    timeline.push({ status: 'assigned_to_driver', timestamp: order.assigned_at, label: 'Driver Assigned' })
  }

  if (order.picked_up_at) {
    timeline.push({ status: 'picked_up', timestamp: order.picked_up_at, label: 'Picked Up' })
  }

  if (order.delivered_at) {
    timeline.push({ status: 'delivered', timestamp: order.delivered_at, label: 'Delivered' })
  }

  return timeline
}

function getNotificationTitle(action: string): string {
  switch (action) {
    case 'pick_up':
      return '📦 Order Picked Up'
    case 'start_delivery':
      return '🚛 Order In Transit'
    case 'deliver':
      return '✅ Order Delivered!'
    default:
      return '📋 Order Update'
  }
}

function getNotificationMessage(action: string): string {
  switch (action) {
    case 'pick_up':
      return 'Your order has been picked up and is on its way to you!'
    case 'start_delivery':
      return 'Your order is currently in transit to your delivery location.'
    case 'deliver':
      return 'Your order has been delivered successfully! Please check your delivery.'
    default:
      return 'Your order status has been updated.'
  }
}

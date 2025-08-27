import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const body = await request.json()
    const { orderId, type, message, driverInfo, estimatedDelivery } = body

    if (!orderId || !type) {
      return NextResponse.json(
        { error: 'Order ID and notification type are required' },
        { status: 400 }
      )
    }

    // Get order details
    const { data: order, error: orderError } = await (supabase as any).from('orders')
      .select('buyer_id, seller_id, driver_id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create notification for buyer
    const notificationData = {
      user_id: order.buyer_id,
      type: `delivery_${type}`,
      title: getNotificationTitle(type),
      message: message || getDefaultMessage(type),
      data: {
        order_id: orderId,
        type,
        driver_info: driverInfo,
        estimated_delivery: estimatedDelivery,
        status: order.status
      },
      priority: getNotificationPriority(type),
      created_at: new Date().toISOString()
    }

    const { data: notification, error: notificationError } = await (supabase as any).from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (notificationError) {
      console.error('Failed to create notification:', notificationError)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    // Send real-time notification via Supabase Realtime
    await (supabase as any).channel('delivery_notifications')
      .send({
        type: 'broadcast',
        event: 'delivery_update',
        payload: {
          user_id: order.buyer_id,
          notification: notificationData
        }
      })

    // If driver assigned, also notify seller
    if (type === 'driver_assigned' && order.seller_id) {
      const sellerNotification = {
        user_id: order.seller_id,
        type: 'delivery_driver_assigned',
        title: 'Driver Assigned to Order',
        message: 'A driver has been assigned to pick up your order.',
        data: {
          order_id: orderId,
          driver_info: driverInfo
        },
        priority: 'medium',
        created_at: new Date().toISOString()
      }

      await (supabase as any).from('notifications')
        .insert(sellerNotification)

      // Send real-time notification to seller
      await (supabase as any).channel('delivery_notifications')
        .send({
          type: 'broadcast',
          event: 'delivery_update',
          payload: {
            user_id: order.seller_id,
            notification: sellerNotification
          }
        })
    }

    return NextResponse.json({
      success: true,
      data: notification
    })

  } catch (error) {
    console.error('Delivery notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'driver_assigned':
      return '🚚 Driver Assigned!'
    case 'picked_up':
      return '📦 Order Picked Up'
    case 'in_transit':
      return '🚛 Order In Transit'
    case 'delivered':
      return '✅ Order Delivered!'
    case 'delayed':
      return '⏰ Delivery Delayed'
    case 'driver_arriving':
      return '🚗 Driver Arriving Soon'
    default:
      return '📋 Delivery Update'
  }
}

function getDefaultMessage(type: string): string {
  switch (type) {
    case 'driver_assigned':
      return 'Your order has been assigned to a driver and is being prepared for pickup.'
    case 'picked_up':
      return 'Your order has been picked up and is on its way to you!'
    case 'in_transit':
      return 'Your order is currently in transit to your delivery location.'
    case 'delivered':
      return 'Your order has been delivered successfully! Please check your delivery.'
    case 'delayed':
      return 'Your delivery has been delayed. We apologize for the inconvenience.'
    case 'driver_arriving':
      return 'Your driver is arriving soon. Please be ready to receive your order.'
    default:
      return 'Your delivery status has been updated.'
  }
}

function getNotificationPriority(type: string): string {
  switch (type) {
    case 'delivered':
    case 'delayed':
      return 'high'
    case 'driver_arriving':
    case 'picked_up':
      return 'medium'
    default:
      return 'low'
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Failed to fetch notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notifications || []
    })

  } catch (error) {
    console.error('Notifications GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

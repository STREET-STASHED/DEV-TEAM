import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'

export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's order history
    const { data: orders, error: ordersError } = await (supabase as any)
      .from('order_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (ordersError) {
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orders: orders || []
    })

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orderData = await request.json()

    // Validate required fields
    if (!orderData.items || !orderData.total_amount) {
      return NextResponse.json(
        { error: 'Items and total amount are required' },
        { status: 400 }
      )
    }

    // Generate order number
    const _orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create the order
    const { data, error } = await (supabase as any)
      .from('orders')
      .insert({
        buyer_id: session.user.id,
        status: 'pending',
        total_amount: orderData.total_amount,
        item_total: orderData.total_amount,
        items: orderData.items,
        delivery_address: orderData.shipping_address || {},
        pickup_address: {},
        distance_miles: 0,
        driver_payout: 0,
        platform_margin: 0,
        support_fee_total: 0,
        seller_id: '00000000-0000-0000-0000-000000000000' // Default seller ID
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      )
    }

    // Clear the shopping cart after successful order
    // TODO: Implement shopping cart functionality
    // if (orderData.clear_cart) {
    //   await supabase.from('shopping_cart')
    //     .delete()
    //     .eq('user_id', session.user.id)
    // }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: data
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId, status, ...updateData } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Update the order
    const { data, error } = await (supabase as any)
      .from('orders')
      .update({
        status: status || 'pending',
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('buyer_id', session.user.id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update order', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: data[0]
    })

  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

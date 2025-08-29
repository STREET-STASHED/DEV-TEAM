import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET method for debugging
export async function GET() {
  return NextResponse.json({
    message: 'Guest orders API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const orderData = await request.json()

    // Validate required fields for guest orders
    if (!orderData.items || !orderData.totalPrice) {
      return NextResponse.json(
        { error: 'Items and total price are required' },
        { status: 400 }
      )
    }

    // Validate guest user data
    if (!orderData.guestUser?.email || !orderData.guestUser?.fullName) {
      return NextResponse.json(
        { error: 'Guest email and full name are required' },
        { status: 400 }
      )
    }

    // Create the guest order with minimal required fields
    const { data, error } = await (supabase as any)
      .from('orders')
      .insert({
        buyer_id: null, // Set to null for guest orders
        seller_id: null, // Set to null for guest orders (no specific seller)
        status: 'ready_for_pickup', // Changed from 'pending' to 'ready_for_pickup'
        items: orderData.items,
        pickup_address: orderData.pickupAddress || {},
        delivery_address: orderData.deliveryAddress || {},
        distance_miles: orderData.distanceMiles || 0,
        item_total: orderData.totalPrice,
        total_amount: orderData.totalPrice,
        support_fee_total: 0,
        driver_payout: 0,
        platform_margin: 0,
        guest_info: {
          email: orderData.guestUser.email,
          full_name: orderData.guestUser.fullName,
          phone: orderData.guestUser.phone || null
        },
        is_guest_order: true
      })
      .select('id, status, total_amount, guest_info, created_at')
      .single()

    if (error) {
      console.error('Guest order creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create guest order', details: error.message },
        { status: 500 }
      )
    }

    // Auto-assign driver if available
    try {
      const autoAssignResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/auto-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.id })
      })

      if (autoAssignResponse.ok) {
        console.log('Driver auto-assigned successfully')
      } else {
        console.log('No drivers available for auto-assignment')
      }
    } catch (autoAssignError) {
      console.log('Auto-assignment failed:', autoAssignError)
    }

    return NextResponse.json({
      success: true,
      message: 'Guest order created successfully',
      orderId: data?.id || 'unknown',
      order: data || {}
    })

  } catch (error) {
    console.error('Guest order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

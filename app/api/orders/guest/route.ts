import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

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

    // Create the guest order
    const { data, error } = await (supabase as any)
      .from('orders')
      .insert({
        buyer_id: null, // Set to null for guest orders since we can't reference auth.users
        status: 'pending',
        total_amount: orderData.totalPrice,
        item_total: orderData.totalPrice,
        items: orderData.items,
        delivery_address: orderData.deliveryAddress || {},
        pickup_address: orderData.pickupAddress || {},
        distance_miles: orderData.distanceMiles || 0,
        driver_payout: 0,
        platform_margin: 0,
        support_fee_total: 0,
        seller_id: '00000000-0000-0000-0000-000000000000', // Default seller ID
        guest_info: {
          email: orderData.guestUser.email,
          full_name: orderData.guestUser.fullName,
          phone: orderData.guestUser.phone || null
        },
        is_guest_order: true
      })
      .select()
      .single()

    if (error) {
      console.error('Guest order creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create guest order', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guest order created successfully',
      orderId: data.id,
      order: data
    })

  } catch (error) {
    console.error('Guest order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get available orders that are ready for pickup
    const { data: orders, error } = await (supabase as any)
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        distance_miles,
        pickup_address,
        delivery_address,
        created_at,
        guest_info,
        buyer:profiles!orders_buyer_id_fkey(full_name, phone)
      `)
      .eq('status', 'ready_for_pickup')
      .is('driver_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching available orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch available orders' },
        { status: 500 }
      )
    }

    // Format orders for driver view
    const formattedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.total_amount,
      distanceMiles: order.distance_miles,
      pickupAddress: order.pickup_address,
      deliveryAddress: order.delivery_address,
      createdAt: order.created_at,
      customerName: order.guest_info?.full_name || order.buyer?.full_name || 'Guest Customer',
      customerPhone: order.guest_info?.phone || order.buyer?.phone || 'N/A',
      estimatedEarnings: calculateDriverEarnings(order.distance_miles, order.total_amount)
    }))

    return NextResponse.json({
      success: true,
      orders: formattedOrders
    })

  } catch (error) {
    console.error('Available orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateDriverEarnings(distanceMiles: number, orderTotal: number): number {
  // Base delivery fee + distance bonus + platform tip
  const baseFee = 8.00
  const distanceBonus = Math.max(0, (distanceMiles - 5) * 0.50)
  const platformTip = Math.max(2.00, orderTotal * 0.05)

  return Math.round((baseFee + distanceBonus + platformTip) * 100) / 100
}


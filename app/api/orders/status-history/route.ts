import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order status history
    const { data: statusHistory, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Failed to fetch status history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch status history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: statusHistory || []
    })

  } catch (error) {
    console.error('Status history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, driverId, location, notes } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    // Add new status history entry
    const { data: newEntry, error } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status,
        driver_id: driverId,
        location,
        notes,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to add status history:', error)
      return NextResponse.json(
        { error: 'Failed to add status history' },
        { status: 500 }
      )
    }

    // Update the order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status,
        ...(status === 'picked_up' && { picked_up_at: new Date().toISOString() }),
        ...(status === 'delivered' && { delivered_at: new Date().toISOString() })
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newEntry
    })

  } catch (error) {
    console.error('Status history POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

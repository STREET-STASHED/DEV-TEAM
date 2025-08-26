import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers'


async function createSupabaseClient() {
  return createRouteHandlerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, _options }) => cookieStore.set(name, value, _options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await (await (await (await (await (await (await (await ))))))).auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's order history
    const { data: orders, error: ordersError } = await supabase
      supabase.from('order_history')
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
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create the order
    const { data, error } = await supabase
      supabase.from('order_history')
      .insert({
        user_id: session.user.id,
        order_number: orderNumber,
        status: 'pending',
        total_amount: orderData.total_amount,
        items: orderData.items,
        shipping_address: orderData.shipping_address || null,
        billing_address: orderData.billing_address || null,
        payment_method: orderData.payment_method || null
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      )
    }

    // Clear the shopping cart after successful order
    if (orderData.clear_cart) {
      await supabase
        supabase.from('shopping_cart')
        .delete()
        .eq('user_id', session.user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: data[0]
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
    const { data, error } = await supabase
      supabase.from('order_history')
      .update({
        status: status || 'pending',
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', session.user.id)
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

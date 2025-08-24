import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimitApp';

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image_url: z.string(),
    category: z.string(),
  })),
  pickupAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  distanceMiles: z.number(),
  totalPrice: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = await createRouteHandlerClient();
    
    // Check authentication - allow guest users
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const isGuest = !user || authError;
    
    // For guest users, we'll create orders without a buyer_id
    if (isGuest) {
      console.log('Processing guest checkout');
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = orderSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { items, pickupAddress, deliveryAddress, distanceMiles, totalPrice } = validationResult.data;

    // Create order in database
    const orderData: any = {
      status: 'pending_payment',
      total_amount: totalPrice,
      delivery_fee: 0, // Will be calculated separately
      distance_miles: distanceMiles,
      pickup_address: JSON.stringify(pickupAddress),
      delivery_address: JSON.stringify(deliveryAddress),
      items: JSON.stringify(items),
      created_at: new Date().toISOString(),
    };

    // Add buyer_id only for authenticated users
    if (!isGuest) {
      orderData.buyer_id = user.id;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      // Order was created but items failed - this is recoverable
    }

    return NextResponse.json({ 
      orderId: order.id,
      success: true,
      message: 'Order created successfully',
      nextStep: 'payment',
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.total_amount,
        distanceMiles: order.distance_miles,
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          item_id,
          quantity,
          price
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Failed to fetch orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

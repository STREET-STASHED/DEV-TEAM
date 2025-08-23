import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
import { rateLimit } from '@/lib/rateLimitApp';
import Stripe from 'stripe';

// Lazy initialize Stripe to avoid build-time issues
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
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
    const { amount, orderId, currency = 'usd' } = body;

    if (!amount || !orderId) {
      return NextResponse.json({ error: 'Amount and order ID are required' }, { status: 400 });
    }

    // Initialize Stripe only when needed
    const stripe = getStripe();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
        userId: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_intent_id: paymentIntent.id,
        status: 'payment_pending'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order with payment intent:', updateError);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}

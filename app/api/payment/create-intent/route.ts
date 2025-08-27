import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { rateLimit } from '@/lib/rateLimitApp';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Lazy initialize Stripe to avoid build-time issues
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// GET method for endpoint information and testing
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Payment Intent Endpoint',
    method: 'POST',
    description: 'Create a new payment intent for orders',
    requiredHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <token> (optional for testing)'
    },
    requiredBody: {
      amount: 'number (in dollars)',
      orderId: 'string',
      currency: 'string (optional, defaults to usd)'
    },
    testMode: 'Use Authorization: Bearer test-token-buyer for testing',
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-buyer'
      },
      body: {
        amount: 99.99,
        orderId: 'order-123',
        currency: 'usd'
      }
    }
  }, { status: 200 });
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

    // Check for test authentication header
    const authHeader = request.headers.get('authorization')
    let user = null

    if (authHeader && authHeader.startsWith('Bearer test-token-')) {
      // Test user authentication
      const token = authHeader.replace('Bearer ', '')
      if (token.includes('buyer')) {
        user = { id: 'test-buyer-1', role: 'buyer' }
      } else if (token.includes('stylist')) {
        user = { id: 'test-stylist-1', role: 'stylist' }
      } else if (token.includes('driver')) {
        user = { id: 'test-driver-1', role: 'driver' }
      }
    } else {
      // Try Supabase authentication as fallback
      try {
        const supabase = await createRouteHandlerClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !supabaseUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        user = supabaseUser
      } catch (_supabaseError) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, orderId, currency = 'usd' } = body;

    if (!amount || !orderId) {
      return NextResponse.json({ error: 'Amount and order ID are required' }, { status: 400 });
    }

    // For test users, create a mock payment intent
    if (user.id.startsWith('test-')) {
      const mockPaymentIntent = {
        id: `pi_test_${Date.now()}`,
        client_secret: `pi_test_secret_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        status: 'requires_payment_method'
      };

      return NextResponse.json({
        clientSecret: mockPaymentIntent.client_secret,
        paymentIntentId: mockPaymentIntent.id,
        isTestMode: true,
        message: 'Test payment intent created successfully'
      });
    }

    // For real users, use Stripe
    try {
      const stripe = getStripe();
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

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 });
    }

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}

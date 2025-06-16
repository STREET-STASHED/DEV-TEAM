import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});
import supabase from '../../lib/supabaseClient'; // Adjust path if necessary

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Handle frontend-triggered checkout session creation
  if (!req.headers['stripe-signature']) {
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty cart items' });
    }

    console.log('Incoming cart items:', req.body.items);
    try {
      const totalAmount = req.body.items.reduce((sum: number, item: any) => {
        return sum + item.price * item.quantity;
      }, 0);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'usd',
        payment_method: req.body.paymentMethodId,
        confirmation_method: 'automatic',
        confirm: true,
        metadata: {
          buyer_id: 'test_buyer_id',
          seller_id: 'test_seller_id',
          cart: JSON.stringify(req.body.items),
        },
        receipt_email: req.body.email ?? undefined,
        description: `In-app order by ${req.body.name ?? 'Guest User'}`,
      });

      if (
        paymentIntent.status === 'requires_action' &&
        paymentIntent.next_action?.type === 'use_stripe_sdk'
      ) {
        return res.status(200).json({
          requiresAction: true,
          paymentIntentClientSecret: paymentIntent.client_secret,
        });
      }

      if (paymentIntent.status !== 'succeeded') {
        return res.status(500).json({ error: 'Payment failed', status: paymentIntent.status });
      }

      return res.status(200).json({
        success: true,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      });
    } catch (err) {
      console.error('Stripe PaymentIntent creation error:', err);
      return res.status(500).json({
        error: 'Unable to create payment intent',
        message: err instanceof Error ? err.message : 'Unknown error',
        raw: err,
      });
    }
  }

  // Handle Stripe webhook
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    const buyer_id = metadata.buyer_id ?? null;
    const seller_id = metadata.seller_id ?? null;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    let parsedCart = [];
    try {
      parsedCart = metadata.cart ? JSON.parse(metadata.cart) : [];
    } catch (e) {
      console.error('Failed to parse cart metadata:', e);
    }

    const { error } = await supabase.from('orders').insert([
      {
        buyer_id,
        seller_id,
        items: parsedCart,
        total: amount,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Failed to insert order into Supabase:', error.message, error);
    } else {
      console.log('Order inserted successfully for buyer:', buyer_id);
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true, status: 'success' });
}

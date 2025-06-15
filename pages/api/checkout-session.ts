import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});
import supabase from '../../lib/supabaseClient'; // Adjust path if necessary

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
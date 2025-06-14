import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import supabase from '@/lib/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-05-28.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
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

    const { buyer_id, seller_id, cart } = session.metadata || {};
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    let parsedCart = [];
    try {
      parsedCart = cart ? JSON.parse(cart) : [];
    } catch (e) {
      console.error('Failed to parse cart metadata:', e);
    }

    const { error } = await supabase.from('orders').insert([
      {
        buyer_id,
        seller_id,
        items: parsedCart, // assuming JSON column in Supabase
        total: amount,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Failed to insert order into Supabase:', error.message);
    }
  }

  res.status(200).json({ received: true });
}
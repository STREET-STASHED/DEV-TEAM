import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, name, email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing cart items' });
    }

    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // convert dollars to cents
      currency: 'usd',
      metadata: {
        customer_name: name,
        customer_email: email,
        cart: JSON.stringify(items),
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('PaymentIntent error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
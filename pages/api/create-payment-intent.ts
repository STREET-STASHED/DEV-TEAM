import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, name, email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing cart items' });
    }

    if (!items.every(item => typeof item.price === 'number' && typeof item.quantity === 'number')) {
      return res.status(400).json({ error: 'Invalid item format' });
    }

    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // convert dollars to cents
      currency: 'usd',
      metadata: {
        customer_name: name,
        customer_email: email,
        cart: JSON.stringify(items),
      },
      receipt_email: email,
      description: `Order by ${name}`,
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('PaymentIntent error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
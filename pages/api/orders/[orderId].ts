// pages/api/orders/[orderId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query as { orderId: string };

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ order: data });
  }

  if (req.method === 'PATCH') {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status' });
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Order updated', order: data });
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}


import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Missing email or role' });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('email', email);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'Role set successfully', data });
}
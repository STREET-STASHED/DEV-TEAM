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

  const { email, userId, role } = req.body;

  if ((!email && !userId) || !role) {
    return res.status(400).json({ error: 'Missing email/userId or role' });
  }

  const query = userId
    ? supabase.from('users').update({ role }).eq('id', userId)
    : supabase.from('users').update({ role }).eq('email', email);

  const { data, error }: { data: any[] | null; error: any } = await query;

  if (error) {
    console.error('Set role error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'User not found or update failed' });
  }

  return res.status(200).json({ message: 'Role set successfully', data });
}
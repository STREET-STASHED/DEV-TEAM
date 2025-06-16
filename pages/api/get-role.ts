import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, id } = req.body;

  if (!email && !id) {
    return res.status(400).json({ error: 'Email or user ID is required' });
  }

  let query;
  if (email) {
    query = supabase.from('users').select('role').eq('email', email).single();
  } else if (id) {
    query = supabase.from('users').select('role').eq('id', id).single();
  } else {
    return res.status(400).json({ error: 'Email or user ID is required' });
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ role: data.role });
}
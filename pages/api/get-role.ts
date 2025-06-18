import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ error: 'User not found or role not set' });
  }

  return res.status(200).json({ role: data.role });
}
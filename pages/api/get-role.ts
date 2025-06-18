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

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching role:', error.message);
      return res.status(500).json({ error: 'Failed to fetch user role from database' });
    }

    if (!data || !data.role) {
      console.warn('Role not set or user not found:', data);
      return res.status(404).json({ error: 'User not found or role not set' });
    }

    return res.status(200).json({ role: data.role });
  } catch (err: any) {
    console.error('Unexpected error in get-role:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
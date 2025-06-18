import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { id } = req.body;

  if (!id || typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ error: 'Valid user ID is required.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', id.trim())
      .single();

    if (error) {
      console.error('Supabase error fetching user role:', error.message);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    if (!data || !data.role) {
      return res.status(404).json({ error: `Role not set for user ID: ${id}` });
    }

    return res.status(200).json({ role: data.role });
  } catch (err: any) {
    console.error('Unexpected server error in get-role:', err.message);
    return res.status(500).json({ error: 'Unexpected server error occurred.' });
  }
}
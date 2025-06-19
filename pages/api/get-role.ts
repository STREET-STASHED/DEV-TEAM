import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';

// Unified handler for both GET and POST methods to fetch user role by ID
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let userId: string | undefined = undefined;

  // Support both GET (query param) and POST (body) for user ID
  if (req.method === 'GET') {
    userId = typeof req.query.id === 'string' ? req.query.id : undefined;
  } else if (req.method === 'POST') {
    userId = typeof req.body.id === 'string' ? req.body.id : undefined;
  } else {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  // Validate user ID
  if (!userId || !userId.trim()) {
    return res.status(400).json({ error: 'Valid user ID is required as "id".' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', userId.trim())
      .single();

    if (error) {
      console.error('Supabase error fetching user role:', error.message);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    if (!data || !data.role) {
      return res.status(404).json({ error: `Role not set for user ID: ${userId}` });
    }

    return res.status(200).json({ role: data.role });
  } catch (err: any) {
    console.error('Unexpected server error in get-role:', err.message);
    return res.status(500).json({ error: 'Unexpected server error occurred.' });
  }
}
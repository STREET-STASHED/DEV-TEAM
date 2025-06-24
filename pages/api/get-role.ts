import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';

// Unified handler for both GET and POST methods to fetch user role by ID or email
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let userIdOrEmail: string | undefined;

  if (req.method === 'GET') {
    userIdOrEmail = typeof req.query.id === 'string' ? req.query.id.trim().toLowerCase() : undefined;
  } else if (req.method === 'POST') {
    userIdOrEmail = typeof req.body.id === 'string' ? req.body.id.trim().toLowerCase() : undefined;
  } else {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
}

  if (!userIdOrEmail) {
    return res.status(400).json({ error: 'Valid user ID or email is required as "id".' });
  }

  try {
    const response = await supabaseAdmin
      .from('users')
      .select('id, role, details_complete, verified')
      .or(`id.eq.${userIdOrEmail},email.eq.${userIdOrEmail}`)
      .single();

    const { data, error } = response;

    if (error) {
      console.error('Supabase error fetching user role:', error.message);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    if (
      !data ||
      typeof data !== 'object' ||
      !('role' in data) ||
      !('details_complete' in data) ||
      !('verified' in data)
    ) {
      return res.status(404).json({ error: `Role or required fields not set for user identifier: ${userIdOrEmail}` });
    }

    return res.status(200).json({
      role: (data as any).role,
      details_complete: (data as any).details_complete ?? null,
      verified: (data as any).verified ?? null
    });
  } catch (err: any) {
    console.error('Unexpected server error in get-role:', err.message);
    return res.status(500).json({ error: 'Unexpected server error occurred.' });
  }
}

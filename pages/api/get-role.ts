import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';

// API handler to get a user's role, verification status, and profile completeness
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Support GET and POST only
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  // Extract input from query or body
  const input =
    req.method === 'GET'
      ? (req.query.id as string)?.trim().toLowerCase()
      : (req.body.id as string)?.trim().toLowerCase();

  if (!input) {
    return res.status(400).json({ error: 'Valid user ID or email is required as "id".' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, role, details_complete, verified')
      .or(`id.eq.${input},email.eq.${input}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: 'Database query failed.', details: error.message });
    }

    // Type guard to ensure data is an object with expected properties
    if (
      !data ||
      typeof data !== 'object' ||
      !('role' in data) ||
      !('details_complete' in data) ||
      !('verified' in data)
    ) {
      return res.status(404).json({ error: `User not found or missing columns for identifier: ${input}` });
    }

    return res.status(200).json({
      role: (data as any).role,
      details_complete: (data as any).details_complete ?? null,
      verified: (data as any).verified ?? null
    });
  } catch (err: any) {
    console.error('Unexpected error in get-role:', err.message);
    return res.status(500).json({ error: 'Unexpected server error occurred.' });
  }
}
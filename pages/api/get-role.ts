import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies['sb-access-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: no token.' });
  }

  const {
    data: { user },
    error: authError
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: failed to get user.' });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role, details_complete, verified')
    .eq('id', user.id)
    .maybeSingle<{ role: string; details_complete: boolean; verified: boolean }>();

  if (error) {
    console.error('Error fetching user role:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve user role.' });
  }

  if (!data) {
    console.warn('No user record found for ID:', user.id);
    return res.status(404).json({ error: 'User not found.' });
  }

  const { role, details_complete, verified } = data;

  return res.status(200).json({ role, details_complete, verified });
}
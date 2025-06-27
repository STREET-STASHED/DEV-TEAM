import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';
import supabase from '@/lib/supabaseBrowserClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies['sb-access-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: no token.' });
  }

  await supabase.auth.setSession({ access_token: token, refresh_token: '' });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized: failed to get user.' });
  }

  const userId = user.id;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role, details_complete, verified')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user role:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve user role.' });
  }

  if (!data) {
    console.warn('No user record found for ID:', userId);
    return res.status(404).json({ error: 'User not found.' });
  }

  const role = (data && 'role' in data) ? data.role : null;
  const is_details_complete = (data && 'details_complete' in data) ? data.details_complete : false;
  const is_verified = (data && 'verified' in data) ? data.verified : false;

  return res.status(200).json({ role, details_complete: is_details_complete, verified: is_verified });
}
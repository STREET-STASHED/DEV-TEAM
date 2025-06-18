import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, id } = req.body;
  if (!email && !id) {
    return res.status(400).json({ error: 'Email or user ID is required' });
  }

  // Query the users table for metadata by email or id
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('user_metadata')
    .match(email ? { email } : { id: id as string })
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if user_metadata exists on the user object
  const userMetadata = (user as { user_metadata?: { role?: string } })?.user_metadata;
  const role = userMetadata?.role;
  if (!role) {
    return res.status(404).json({ error: 'User role not found' });
  }

  return res.status(200).json({ role });
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import supabaseAdmin from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const session = await getServerSession(req, res, authOptions) as { user?: { id?: string } } | null;
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: no session user found.' });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error?.message);
    return res.status(500).json({ error: 'Failed to retrieve user role.' });
  }

  return res.status(200).json({ role: data.role });
}
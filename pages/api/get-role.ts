import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = supabaseServer;
  // Parse Supabase session token from cookies
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies['sb-access-token'] || '';

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error('Auth error or missing user:', authError);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, email, phone, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Error fetching user data' });
  }

  return res.status(200).json({
    userId: user.id,
    userData: data ?? null,
  });
}
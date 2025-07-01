import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = supabaseServer;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Auth error or missing user:', authError);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, role, email, phone, created_at, updated_at, last_sign_in_at, is_sso_user, is_anonymous')
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
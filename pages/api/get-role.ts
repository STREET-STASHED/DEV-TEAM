import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';

interface UserRoleData {
  role: string | null;
  details_complete: boolean;
  verified: boolean;
  has_completed_onboarding: boolean;
  onboarded: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.body;

  if (!user || !user.id) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role, details_complete, verified, has_completed_onboarding, onboarded')
    .eq('id', user.id)
    .maybeSingle<UserRoleData>();

  if (error) {
    console.error('Error fetching user role:', error);
    return res.status(500).json({ error: 'Error fetching user role' });
  }

  const role = data?.role ?? null;
  const details_complete = data?.details_complete ?? false;
  const verified = data?.verified ?? false;
  const has_completed_onboarding = data?.has_completed_onboarding ?? false;
  const onboarded = data?.onboarded ?? false;

  return res.status(200).json({
    role,
    details_complete,
    verified,
    has_completed_onboarding,
    onboarded,
  });
}
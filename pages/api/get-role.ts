import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { jwtVerify } from 'jose';

interface UserRoleData {
  role: string | null;
  details_complete: boolean;
  verified: boolean;
  has_completed_onboarding: boolean;
  onboarded: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token in Authorization header' });
  }

  try {
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.sub;
    console.log('Decoded user ID:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: no user ID (sub) found' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role, details_complete, verified, has_completed_onboarding, onboarded')
      .eq('id', userId)
      .maybeSingle<UserRoleData>();

    if (error) {
      console.error('Error fetching user role:', error);
      return res.status(500).json({ error: 'Error fetching user role' });
    }

    return res.status(200).json({
      userId,
      role: data?.role ?? null,
      details_complete: data?.details_complete ?? false,
      verified: data?.verified ?? false,
      has_completed_onboarding: data?.has_completed_onboarding ?? false,
      onboarded: data?.onboarded ?? false,
    });
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
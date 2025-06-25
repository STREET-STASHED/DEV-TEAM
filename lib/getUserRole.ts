import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import supabaseAdmin from './supabaseAdmin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function getUserRole(req: NextApiRequest, res: NextApiResponse): Promise<{
  role: string | null;
  details_complete: boolean;
  verified: boolean;
} | null> {
  const session = await getServerSession(req, res, authOptions) as { user?: { id?: string } } | null;
  const userId = session?.user?.id;

  if (!userId) {
    console.error('No authenticated user found.');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role, details_complete, verified')
    .eq('id', userId)
    .single<{ role: string | null; details_complete: boolean; verified: boolean }>();

  if (error || !data) {
    console.error('Error fetching user info:', error);
    return null;
  }

  return {
    role: data.role || null,
    details_complete: data.details_complete || false,
    verified: data.verified || false,
  };
}
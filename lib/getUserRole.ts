import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import supabaseAdmin from './supabaseAdmin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function getUserRole(req: NextApiRequest, res: NextApiResponse): Promise<string | null> {
  const session = await getServerSession(req, res, authOptions) as { user?: { id?: string } } | null;
  const userId = session?.user?.id;

  if (!userId) {
    console.error('No authenticated user found.');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data.role || null;
}
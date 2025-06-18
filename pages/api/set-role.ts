import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const VALID_ROLES = ['buyer', 'seller', 'driver', 'stylist', 'admin'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { email, userId, role } = req.body;

  if ((!email && !userId) || !role) {
    console.error('Missing required fields:', { email, userId, role });
    return res.status(400).json({ error: 'Missing email/userId or role' });
  }

  role = role.trim().toLowerCase();

  if (!VALID_ROLES.includes(role)) {
    console.error('Invalid role specified:', role);
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  try {
    const query = userId
      ? supabase.from('users').update({ role }).eq('id', userId).select('id, email, role').single()
      : supabase.from('users').update({ role }).eq('email', email).select('id, email, role').single();

    const { data, error }: { data: any | null; error: any } = await query;

    if (error) {
      console.error('Set role error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      console.warn('No user found or no rows updated:', { email, userId });
      return res.status(404).json({ error: `User not found or update failed for ${userId || email}` });
    }

    console.log('Role updated successfully:', data);
    return res.status(200).json({ message: 'Role set successfully', data });

  } catch (err: any) {
    console.error('Unexpected error in set-role:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
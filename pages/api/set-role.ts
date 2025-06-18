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
    const { data: existingUser, error: fetchError } = userId
      ? await supabase.from('users').select('*').eq('id', userId).single()
      : await supabase.from('users').select('*').eq('email', email).single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    const upsertPayload = {
      id: userId,
      email,
      role,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('users').upsert(upsertPayload, { onConflict: 'id' }).select().single();

    if (error) {
      console.error('Upsert role error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Role upserted successfully:', data);
    return res.status(200).json({ message: 'Role set successfully', data });
  } catch (err: any) {
    console.error('Unexpected error in set-role:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
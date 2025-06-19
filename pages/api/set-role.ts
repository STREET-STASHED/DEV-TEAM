import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const VALID_ROLES = ['buyer', 'seller', 'driver', 'stylist', 'admin'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST and PUT for role assignment
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed. Use POST or PUT.' });
  }

  let { email, userId, role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required.' });
  }
  role = String(role).trim().toLowerCase();
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Invalid role: "${role}". Must be one of: ${VALID_ROLES.join(', ')}.` });
  }

  // Must have at least one identifier
  if (!userId && !email) {
    return res.status(400).json({ error: 'userId or email is required.' });
  }

  // Attempt to find user
  let lookupCol = userId ? 'id' : 'email';
  let lookupVal = userId ? userId : email;

  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq(lookupCol, lookupVal)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database fetch error:', fetchError);
      return res.status(500).json({ error: 'Database fetch error', details: fetchError.message });
    }

    // Always upsert (insert or update) the user's role
    const upsertPayload: Record<string, any> = {
      role,
      updated_at: new Date().toISOString(),
    };
    if (userId) upsertPayload.id = userId;
    if (email) upsertPayload.email = email;

    const { data, error } = await supabase
      .from('users')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Upsert role error:', error);
      return res.status(500).json({ error: 'Upsert role error', details: error.message });
    }

    return res.status(200).json({ message: 'Role set successfully', data });
  } catch (err: any) {
    console.error('Unexpected error in set-role:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
}
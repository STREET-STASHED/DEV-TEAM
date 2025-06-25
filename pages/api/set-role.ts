import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const VALID_ROLES = ['buyer', 'seller', 'driver', 'stylist', 'admin'];

const getUserFromRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error,
  } = await supabaseServerClient.auth.getUser();

  if (error || !user) {
    res.status(401).json({ error: 'Unauthorized: unable to retrieve user.' });
    return null;
  }
  return user;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed. Use POST or PUT.' });
  }

  const authUser = await getUserFromRequest(req, res);
  if (!authUser) return;

  let { email, userId, role } = req.body;

  // Validate role
  if (!role) {
    return res.status(400).json({ error: 'Role is required.' });
  }

  role = String(role).trim().toLowerCase();
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      error: `Invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}.`
    });
  }

  if (!userId && !email) {
    return res.status(400).json({ error: 'userId or email is required.' });
  }

  if (email) email = email.trim().toLowerCase();

  const lookupCol = userId ? 'id' : 'email';
  const lookupVal = userId || email;

  try {
    // Attempt to find existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq(lookupCol, lookupVal)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Database fetch error:', fetchError);
      return res.status(500).json({
        error: 'Database fetch error',
        details: fetchError.message
      });
    }

    // Prepare upsert payload
    const upsertPayload: Record<string, any> = {
      role,
      details_complete: true,
      verified: true,
      updated_at: new Date().toISOString()
    };

    if (userId) upsertPayload.id = userId;
    if (email) upsertPayload.email = email;

    const conflictTarget = userId && email ? 'id,email' : userId ? 'id' : 'email';

    const { data, error: upsertError } = await supabase
      .from('users')
      .upsert(upsertPayload, { onConflict: conflictTarget })
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Upsert role error:', upsertError);
      return res.status(500).json({
        error: 'Upsert role error',
        details: upsertError.message
      });
    }

    console.log(`✅ Role "${role}" set for: ${userId || email}`);
    return res.status(200).json({ message: 'Role set successfully', data });
  } catch (err: any) {
    console.error('❌ Unexpected error in set-role:', err);
    return res.status(500).json({
      error: 'Unexpected server error',
      details: err.message
    });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Admin client for server-side operations
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate request method and content type
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  // Environment variable check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Missing Supabase environment variables' });
  }

  // Extract signup payload
  const { email = '', password = '', userData = {} } = req.body || {};
  const { full_name = '', role = '' } = userData;

  // Validate required fields
  if (!email || !password || !full_name || !role) {
    return res.status(400).json({
      error: 'Missing required fields: email, password, full_name, or role',
      received: { email, passwordPresent: !!password, full_name, role }
    });
  }

  // Validate input types
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid email or password format' });
  }

  // Normalize role
  const normalizedRole = role.toLowerCase() === 'role' ? null : role.toLowerCase();

  try {
    // Use admin client to bypass session requirements
    const { data, error } = await admin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: normalizedRole,
        }
      },
    });

    if (error) {
      console.error('[SIGNUP] Supabase error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    const user = data?.user;

    if (!user?.id) {
      console.warn('[SIGNUP] No user ID returned; profile will not be inserted.');
      return res.status(500).json({ error: 'User creation failed' });
    }

    // Insert profile using admin client
    console.log('[SIGNUP] Inserting profile for user:', user.id, {
      user_id: user.id,
      email: user.email,
      full_name,
      role: normalizedRole,
      has_completed_onboarding: false,
      details_complete: false,
      onboarding_step: 'role',
      verified: false,
      updated_at: new Date().toISOString()
    });

    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name,
        role: normalizedRole,
        has_completed_onboarding: false,
        details_complete: false,
        onboarding_step: 'role',
        verified: false,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message);
      return res.status(500).json({ error: 'Profile creation failed' });
    }

    // Successful signup response
    return res.status(201).json({
      user: data.user,
      redirectTo: '/onboarding',
      message: 'Signup successful'
    });

  } catch (err: any) {
    console.error('[SIGNUP] Unexpected error:', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Server error during signup' });
  }
}
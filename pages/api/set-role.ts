import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { jwtVerify } from 'jose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = supabaseServer;

  try {
    console.log('Incoming request to set-role');
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    console.log('Access Token:', accessToken);
    if (!accessToken) {
      return res.status(401).json({ error: 'Missing or invalid access token' });
    }

    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
    const { payload } = await jwtVerify(accessToken, secret);
    const userId = payload.sub;
    console.log('Decoded User ID:', userId);
    if (!userId) {
      return res.status(401).json({ error: 'Unable to decode user ID from token' });
    }

    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role not provided' });
    }

    const allowedRoles = ['buyer', 'seller', 'stylist', 'driver'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        role,
        details_complete: false,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: `Failed to update role: ${updateError.message}` });
    }

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Unexpected error in set-role:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
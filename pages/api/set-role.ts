import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    console.log('Incoming request to set-role');
    const accessToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('Access Token:', accessToken);
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing or invalid access token' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
    const { payload } = await jwtVerify(accessToken, secret);
    const userId = payload.sub;
    console.log('Decoded User ID:', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unable to decode user ID from token' }, { status: 401 });
    }

    const { role } = await req.json();
    if (!role) {
      return NextResponse.json({ error: 'Role not provided' }, { status: 400 });
    }

    const allowedRoles = ['buyer', 'seller', 'stylist', 'driver'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString(),
        has_completed_onboarding: false,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: `Failed to update role: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Unexpected error in set-role:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
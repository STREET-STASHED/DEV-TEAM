import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing or invalid access token' }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unable to fetch user' }, { status: 401 });
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
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: `Failed to update role: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
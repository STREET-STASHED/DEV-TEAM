import { audit } from '@/lib/audit';
import { getDisputeById, updateDisputeStatus } from '@/lib/db/disputes';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler';


async function createSupabaseClient() {
  return createRouteHandlerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
    return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, _options }: { name: string; value: string; options?: any }) =>
              cookieStore.set(name, value, _options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const disputeId = id;

    // Validate request body
    const updateDisputeSchema = z.object({
      status: z.enum(['open', 'pending', 'approved', 'denied', 'refunded', 'resolved']),
      resolution: z.object({
        type: z.enum(['refund', 'exchange', 'partial_credit', 'decline']),
        notes: z.string().max(2000).optional()
      }).optional()
    });

    const body = await request.json();
    const validationResult = updateDisputeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const { status, resolution } = validationResult.data;

    // Update dispute using service wrapper
    const { dispute, error } = await updateDisputeStatus(disputeId, {
      status,
      resolution
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Log audit event
    await audit('dispute_updated_patch', {
      dispute_id: disputeId,
      user_id: user.id,
      new_status: status,
      resolution
    }, request);

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Error in PATCH /api/disputes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const disputeId = id;

    // Get dispute details using service wrapper
    const { dispute, error } = await getDisputeById(disputeId);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Error in GET /api/disputes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

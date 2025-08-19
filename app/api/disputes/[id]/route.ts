import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler';
import { z } from 'zod';
import { updateDisputeStatus, getDisputeById } from '@/lib/db/disputes';
import { audit } from '@/lib/audit';

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

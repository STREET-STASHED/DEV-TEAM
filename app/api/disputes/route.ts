import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler';
import { z } from 'zod';
import { createDispute, updateDisputeStatus, listDisputesForBuyer, listDisputesForSeller, listDisputesAdmin, DisputeStatus } from '@/lib/db/disputes';

import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement proper rate limiting for App Router
    // Rate limiting: max 10 disputes per day per user

    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const createDisputeSchema = z.object({
      order_id: z.string().uuid(),
      reason: z.string().min(1).max(500),
      description: z.string().max(2000).optional()
    });

    const body = await request.json();
    const validationResult = createDisputeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { order_id, reason, description } = validationResult.data;

    // Create dispute using service wrapper
    const { dispute, error } = await createDispute({
      orderId: order_id,
      reason,
      details: description
    });

    if (error || !dispute) {
      return NextResponse.json({ error: error || 'Failed to create dispute' }, { status: 400 });
    }

    // Log audit event
    await audit('dispute_created_api', {
      dispute_id: dispute.id,
      order_id,
      user_id: user.id,
      reason
    }, request);

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/disputes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user role to determine access level
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let disputes;
    let error;

    if (profile?.role === 'admin') {
      // Admin can see all disputes with filters
      const filters = { status: status as DisputeStatus || undefined, q: q || undefined, page, limit };
      const result = await listDisputesAdmin(filters);
      disputes = result.disputes;
      error = result.error;
    } else if (role === 'buyer') {
      // Buyer sees their own disputes
      const result = await listDisputesForBuyer();
      disputes = result.disputes;
      error = result.error;
    } else if (role === 'seller') {
      // Seller sees disputes for their orders
      const result = await listDisputesForSeller();
      disputes = result.disputes;
      error = result.error;
    } else {
      // Default to buyer view
      const result = await listDisputesForBuyer();
      disputes = result.disputes;
      error = result.error;
    }

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error('Error in GET /api/disputes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const updateDisputeSchema = z.object({
      dispute_id: z.string().uuid(),
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

    const { dispute_id, status, resolution } = validationResult.data;

    // Update dispute using service wrapper
    const { dispute, error } = await updateDisputeStatus(dispute_id, {
      status,
      resolution
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Log audit event
    await audit('dispute_updated_api', {
      dispute_id,
      user_id: user.id,
      new_status: status,
      resolution
    }, request);

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Error in PUT /api/disputes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

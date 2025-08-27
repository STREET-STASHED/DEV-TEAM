export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@/app/lib/supabase/server';

export type DisputeStatus = 'open' | 'pending' | 'approved' | 'denied' | 'refunded' | 'resolved';
export type ResolutionType = 'refund' | 'exchange' | 'partial_credit' | 'decline';

export interface CreateDisputePayload {
  orderId: string;
  reason: string;
  details?: string;
}

export interface UpdateDisputeStatusPayload {
  status: DisputeStatus;
  resolution?: {
    type: ResolutionType;
    notes?: string;
  };
}

export interface DisputeWithOrder {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution_notes: string | null;
  escalated_at: string | null;
  resolved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  orders: {
    id: string;
    total_amount: number;
    status: string;
    buyer_id: string;
    seller_id: string;
    created_at: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

export interface DisputeFilters {
  status?: DisputeStatus;
  q?: string;
  page?: number;
  limit?: number;
}

/**
 * Create a new dispute for an order
 */
export async function createDispute(payload: CreateDisputePayload): Promise<{ dispute: Record<string, unknown> | null; error?: string }> {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { dispute: null, error: 'Unauthorized' };
    }

    // Verify order exists and user is the buyer
    const { data: order, error: orderError } = await supabase.from('orders')
      .select('id, buyer_id, seller_id, total_amount, status')
      .eq('id', payload.orderId)
      .single();

    if (orderError || !order) {
      return { dispute: null, error: 'Order not found' };
    }

    if (order.buyer_id !== user.id) {
      return { dispute: null, error: 'You can only create disputes for your own orders' };
    }

    if (order.status === 'cancelled') {
      return { dispute: null, error: 'Cannot create disputes for cancelled orders' };
    }

    // Create dispute
    const { data: dispute, error: disputeError } = await supabase.from('disputes')
      .insert({
        order_id: payload.orderId,
        buyer_id: user.id,
        seller_id: order.seller_id,
        reason: payload.reason,
        description: payload.details || '',
        status: 'open'
      })
      .select()
      .single();

    if (disputeError) {
      console.error('Error creating dispute:', disputeError);
      return { dispute: null, error: 'Failed to create dispute' };
    }

    // Log audit event
    await logAuditEvent('dispute_created', {
      dispute_id: dispute.id,
      order_id: payload.orderId,
      user_id: user.id,
      reason: payload.reason
    });

    return { dispute };
  } catch (error) {
    console.error('Error in createDispute:', error);
    return { dispute: null, error: 'Internal server error' };
  }
}

/**
 * Update dispute status and resolution
 */
export async function updateDisputeStatus(
  disputeId: string,
  payload: UpdateDisputeStatusPayload
): Promise<{ dispute: Record<string, unknown> | null; error?: string }> {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { dispute: null, error: 'Unauthorized' };
    }

    // Get dispute and verify permissions
    const { data: dispute, error: disputeError } = await supabase.from('disputes')
      .select('*')
      .eq('id', disputeId)
      .single();

    if (disputeError || !dispute) {
      return { dispute: null, error: 'Dispute not found' };
    }

    // Check permissions: seller can update their disputes, admin can update any
    const { data: profile } = await supabase.from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isSeller = dispute.seller_id === user.id;
    const isAdmin = profile?.role === 'admin';

    if (!isSeller && !isAdmin) {
      return { dispute: null, error: 'Insufficient permissions' };
    }

    // Update dispute
    const updateData: Record<string, unknown> = {
      status: payload.status,
      updated_at: new Date().toISOString()
    };

    if (payload.resolution) {
      updateData.resolution_notes = payload.resolution.notes || '';
      if (payload.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    const { data: updatedDispute, error: updateError } = await supabase.from('disputes')
      .update(updateData)
      .eq('id', disputeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating dispute:', updateError);
      return { dispute: null, error: 'Failed to update dispute' };
    }

    // Log audit event
    await logAuditEvent('dispute_updated', {
      dispute_id: disputeId,
      user_id: user.id,
      old_status: dispute.status,
      new_status: payload.status,
      resolution: payload.resolution
    });

    return { dispute: updatedDispute };
  } catch (error) {
    console.error('Error in updateDisputeStatus:', error);
    return { dispute: null, error: 'Internal server error' };
  }
}

/**
 * List disputes for buyer (current user)
 */
export async function listDisputesForBuyer(): Promise<{ disputes: DisputeWithOrder[]; error?: string }> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { disputes: [], error: 'Unauthorized' };
    }

    const { data: disputes, error } = await supabase.from('disputes')
      .select(`
        *,
        orders (
          id,
          total_amount,
          status,
          buyer_id,
          seller_id,
          created_at
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer disputes:', error);
      return { disputes: [], error: 'Failed to fetch disputes' };
    }

    return { disputes: (disputes || []) as any };
  } catch (error) {
    console.error('Error in listDisputesForBuyer:', error);
    return { disputes: [], error: 'Internal server error' };
  }
}

/**
 * List disputes for seller (current user)
 */
export async function listDisputesForSeller(): Promise<{ disputes: DisputeWithOrder[]; error?: string }> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { disputes: [], error: 'Unauthorized' };
    }

    const { data: disputes, error } = await supabase.from('disputes')
      .select(`
        *,
        orders (
          id,
          total_amount,
          status,
          buyer_id,
          seller_id,
          created_at
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller disputes:', error);
      return { disputes: [], error: 'Failed to fetch disputes' };
    }

    return { disputes: (disputes || []) as any };
  } catch (error) {
    console.error('Error in listDisputesForSeller:', error);
    return { disputes: [], error: 'Internal server error' };
  }
}

/**
 * List all disputes for admin with filters
 */
export async function listDisputesAdmin(filters: DisputeFilters = {}): Promise<{ disputes: DisputeWithOrder[]; total: number; error?: string }> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { disputes: [], total: 0, error: 'Unauthorized' };
    }

    // Verify admin role
    const { data: profile } = await supabase.from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { disputes: [], total: 0, error: 'Admin access required' };
    }

    let query = supabase
      .from('disputes')
      .select(`
        *,
        orders (
          id,
          total,
          status,
          buyer_id,
          seller_id,
          created_at
        ),
        profiles (
          full_name,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.q) {
      query = query.or(`reason.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: disputes, error, count } = await query;

    if (error) {
      console.error('Error fetching admin disputes:', error);
      return { disputes: [], total: 0, error: 'Failed to fetch disputes' };
    }

    return {
      disputes: (disputes || []) as any,
      total: count || 0
    };
  } catch (error) {
    console.error('Error in listDisputesAdmin:', error);
    return { disputes: [], total: 0, error: 'Internal server error' };
  }
}

/**
 * Get dispute by ID with full details
 */
export async function getDisputeById(disputeId: string): Promise<{ dispute: DisputeWithOrder | null; error?: string }> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { dispute: null, error: 'Unauthorized' };
    }

    const { data: dispute, error } = await supabase.from('disputes')
      .select(`
        *,
        orders (
          id,
          total,
          status,
          buyer_id,
          seller_id,
          created_at
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', disputeId)
      .single();

    if (error || !dispute) {
      return { dispute: null, error: 'Dispute not found' };
    }

    // Check permissions
    const { data: profile } = await supabase.from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isBuyer = dispute.buyer_id === user.id;
    const isSeller = dispute.seller_id === user.id;
    const isAdmin = profile?.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return { dispute: null, error: 'Insufficient permissions' };
    }

    return { dispute: dispute as any };
  } catch {
    console.error('Error in getDisputeById');
    return { dispute: null, error: 'Internal server error' };
  }
}

/**
 * Log audit event using the audit system
 */
async function logAuditEvent(event: string, data?: Record<string, unknown>): Promise<void> {
  try {
    const { audit } = await import('@/lib/audit');
    await audit(event, data);
  } catch {
    // Fallback to console logging if audit system fails
    console.info('[AUDIT]', event, data);
  }
}

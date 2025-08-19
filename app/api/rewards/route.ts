import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler';
import { z } from 'zod';
import { getMyPoints, spendPoints, calculateCheckoutPointsApplication } from '@/lib/db/rewards';

import { audit } from '@/lib/audit';

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's reward points using service wrapper
    const { points, error } = await getMyPoints();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ points });
  } catch (error) {
    console.error('Error in GET /api/rewards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement proper rate limiting for App Router
    // Rate limiting: max 5 points operations per hour per user

    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const spendPointsSchema = z.object({
      action: z.enum(['spend', 'calculate_checkout']),
      amount: z.number().positive().optional(),
      support_fee: z.number().nonnegative().optional(),
      order_total: z.number().nonnegative().optional(),
      order_id: z.string().uuid().optional()
    });

    const body = await request.json();
    const validationResult = spendPointsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { action, amount, support_fee, order_total, order_id } = validationResult.data;

    if (action === 'spend') {
      if (!amount) {
        return NextResponse.json({ error: 'Amount is required for spend action' }, { status: 400 });
      }

      // Spend points
      const { success, newBalance, error } = await spendPoints(amount, {
        source: 'api',
        order_id,
        timestamp: new Date().toISOString()
      });

      if (!success) {
        return NextResponse.json({ error }, { status: 400 });
      }

      // Log audit event
      await audit('points_spent_api', {
        user_id: user.id,
        amount,
        new_balance: newBalance,
        order_id
      }, request);

      return NextResponse.json({ 
        success: true, 
        new_balance: newBalance,
        message: `Successfully spent ${amount} points`
      });
    }

    if (action === 'calculate_checkout') {
      if (!support_fee || !order_total) {
        return NextResponse.json({ 
          error: 'Support fee and order total are required for checkout calculation' 
        }, { status: 400 });
      }

      // Calculate how points would be applied to checkout
      const { application, error } = await calculateCheckoutPointsApplication(
        amount || 0,
        support_fee,
        order_total
      );

      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      return NextResponse.json({ 
        application,
        message: 'Checkout points application calculated successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/rewards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

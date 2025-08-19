import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler';
import { z } from 'zod';
import { redeemReferral, getMyReferral, generateReferralCode } from '@/lib/db/referrals';

import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement proper rate limiting for App Router
    // Rate limiting: max 20 referrals per day per user

    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const redeemReferralSchema = z.object({
      referral_code: z.string().min(1).max(20)
    });

    const body = await request.json();
    const validationResult = redeemReferralSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { referral_code } = validationResult.data;

    // Redeem referral using service wrapper
    const { success, referrerId, error } = await redeemReferral(referral_code);

    if (!success) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Log audit event
    await audit('referral_redeemed_api', {
      referral_code,
      user_id: user.id,
      referrer_id: referrerId
    }, request);

    return NextResponse.json({ 
      success: true, 
      message: 'Referral code redeemed successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral information using service wrapper
    const { referralCode, stats, referredUsers, error } = await getMyReferral();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ 
      referralCode,
      stats,
      referredUsers
    });
  } catch (error) {
    console.error('Error in GET /api/referrals:', error);
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

    const body = await request.json();
    const { referral_id, status } = body;

    if (!referral_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get referral details
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referral_id)
      .single();

    if (referralError || !referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    // Only allow updating referrals where user is the referrer
    if (referral.referrer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update referral
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedReferral, error: updateError } = await supabase
      .from('referrals')
      .update(updateData)
      .eq('id', referral_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating referral:', updateError);
      return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
    }

    return NextResponse.json({ referral: updatedReferral });
  } catch (error) {
    console.error('Error in PUT /api/referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Generate referral code for current user
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate referral code using service wrapper
    const { referralCode, error } = await generateReferralCode();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    // Log audit event
    await audit('referral_code_generated_api', {
      user_id: user.id,
      referral_code: referralCode
    }, request);

    return NextResponse.json({ referral_code: referralCode });
  } catch (error) {
    console.error('Error in PATCH /api/referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

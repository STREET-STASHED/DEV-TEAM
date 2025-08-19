import { createRouteHandlerClient } from '../supabaseRouteHandler';

export interface RewardPoints {
  current_balance: number;
  total_earned: number;
  total_spent: number;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'spent' | 'awarded' | 'deducted' | 'expired';
  source: 'referral' | 'purchase' | 'admin' | 'checkout' | 'expiration';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CheckoutPointsApplication {
  points_to_apply: number;
  support_fee_reduction: number;
  order_total_reduction: number;
  remaining_balance: number;
}

/**
 * Get current user's reward points and balance
 */
export async function getMyPoints(): Promise<{ 
  points: RewardPoints; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { 
        points: { current_balance: 0, total_earned: 0, total_spent: 0 }, 
        error: 'Unauthorized' 
      };
    }

    // Get user's current points balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('reward_points')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { 
        points: { current_balance: 0, total_earned: 0, total_spent: 0 }, 
        error: 'Failed to fetch profile' 
      };
    }

    // For now, we'll use the profile reward_points as current balance
    // In a full implementation, you'd want a separate rewards table with transaction history
    const currentBalance = profile.reward_points || 0;

    // TODO: Implement transaction history to calculate total_earned and total_spent
    // For now, we'll estimate based on current balance
    const points: RewardPoints = {
      current_balance: currentBalance,
      total_earned: currentBalance, // Placeholder
      total_spent: 0 // Placeholder
    };

    return { points };
  } catch (error) {
    console.error('Error in getMyPoints:', error);
    return { 
      points: { current_balance: 0, total_earned: 0, total_spent: 0 }, 
      error: 'Internal server error' 
    };
  }
}

/**
 * Spend points (deduct from balance)
 */
export async function spendPoints(
  amount: number, 
  meta?: Record<string, unknown>
): Promise<{ 
  success: boolean; 
  newBalance: number; 
  error?: string 
}> {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, newBalance: 0, error: 'Unauthorized' };
    }

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('reward_points')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { success: false, newBalance: 0, error: 'Failed to fetch profile' };
    }

    const currentBalance = profile.reward_points || 0;

    if (currentBalance < amount) {
      return { 
        success: false, 
        newBalance: currentBalance, 
        error: 'Insufficient points balance' 
      };
    }

    // Update balance
    const newBalance = currentBalance - amount;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ reward_points: newBalance })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating reward points:', updateError);
      return { success: false, newBalance: currentBalance, error: 'Failed to update balance' };
    }

    // Log audit event
    await logAuditEvent('points_spent', {
      user_id: user.id,
      amount,
      old_balance: currentBalance,
      new_balance: newBalance,
      metadata: meta
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error in spendPoints:', error);
    return { success: false, newBalance: 0, error: 'Internal server error' };
  }
}

/**
 * Award points to user
 */
export async function awardPoints(
  amount: number, 
  meta?: Record<string, unknown>
): Promise<{ 
  success: boolean; 
  newBalance: number; 
  error?: string 
}> {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, newBalance: 0, error: 'Unauthorized' };
    }

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('reward_points')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { success: false, newBalance: 0, error: 'Failed to fetch profile' };
    }

    const currentBalance = profile.reward_points || 0;
    const newBalance = currentBalance + amount;

    // Update balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ reward_points: newBalance })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating reward points:', updateError);
      return { success: false, newBalance: currentBalance, error: 'Failed to update balance' };
    }

    // Log audit event
    await logAuditEvent('points_awarded', {
      user_id: user.id,
      amount,
      old_balance: currentBalance,
      new_balance: newBalance,
      metadata: meta
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error in awardPoints:', error);
    return { success: false, newBalance: 0, error: 'Internal server error' };
  }
}

/**
 * Award points to a specific user (admin function)
 */
export async function awardPointsToUser(
  userId: string,
  amount: number, 
  reason: string,
  meta?: Record<string, unknown>
): Promise<{ 
  success: boolean; 
  newBalance: number; 
  error?: string 
}> {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    const supabase = await createRouteHandlerClient();
    
    // Verify current user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, newBalance: 0, error: 'Unauthorized' };
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || adminProfile?.role !== 'admin') {
      return { success: false, newBalance: 0, error: 'Admin access required' };
    }

    // Get target user's current balance
    const { data: targetProfile, error: targetProfileError } = await supabase
      .from('profiles')
      .select('reward_points')
      .eq('user_id', userId)
      .single();

    if (targetProfileError) {
      console.error('Error fetching target profile:', targetProfileError);
      return { success: false, newBalance: 0, error: 'Target user not found' };
    }

    const currentBalance = targetProfile.reward_points || 0;
    const newBalance = currentBalance + amount;

    // Update balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ reward_points: newBalance })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating reward points:', updateError);
      return { success: false, newBalance: currentBalance, error: 'Failed to update balance' };
    }

    // Log audit event
    await logAuditEvent('points_awarded_admin', {
      admin_user_id: user.id,
      target_user_id: userId,
      amount,
      reason,
      old_balance: currentBalance,
      new_balance: newBalance,
      metadata: meta
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error in awardPointsToUser:', error);
    return { success: false, newBalance: 0, error: 'Internal server error' };
  }
}

/**
 * Calculate how points should be applied to checkout
 * Points are applied to Stashed Support Fee first, then to order total
 */
export async function calculateCheckoutPointsApplication(
  pointsToApply: number,
  supportFee: number,
  orderTotal: number
): Promise<{ 
  application: CheckoutPointsApplication; 
  error?: string 
}> {
  try {
    if (pointsToApply <= 0) {
      return {
        application: {
          points_to_apply: 0,
          support_fee_reduction: 0,
          order_total_reduction: 0,
          remaining_balance: 0
        },
        error: 'Points to apply must be positive'
      };
    }

    // Get current user's points balance
    const { points, error } = await getMyPoints();
    if (error) {
      return {
        application: {
          points_to_apply: 0,
          support_fee_reduction: 0,
          order_total_reduction: 0,
          remaining_balance: 0
        },
        error
      };
    }

    if (points.current_balance < pointsToApply) {
      return {
        application: {
          points_to_apply: 0,
          support_fee_reduction: 0,
          order_total_reduction: 0,
          remaining_balance: points.current_balance
        },
        error: 'Insufficient points balance'
      };
    }

    // Convert points to dollars (1 point = $0.10)
    const pointsValue = pointsToApply * 0.1;
    
    // Apply to support fee first
    const supportFeeReduction = Math.min(pointsValue, supportFee);
    let orderTotalReduction = 0;
    
    // If there are remaining points after support fee, apply to order total
    if (pointsValue > supportFee) {
      orderTotalReduction = Math.min(pointsValue - supportFee, orderTotal);
    }

    const totalReduction = supportFeeReduction + orderTotalReduction;
    const actualPointsUsed = Math.ceil(totalReduction / 0.1); // Convert back to points

    const application: CheckoutPointsApplication = {
      points_to_apply: actualPointsUsed,
      support_fee_reduction: supportFeeReduction,
      order_total_reduction: orderTotalReduction,
      remaining_balance: points.current_balance - actualPointsUsed
    };

    return { application };
  } catch (error) {
    console.error('Error in calculateCheckoutPointsApplication:', error);
    return {
      application: {
        points_to_apply: 0,
        support_fee_reduction: 0,
        order_total_reduction: 0,
        remaining_balance: 0
      },
      error: 'Internal server error'
    };
  }
}

/**
 * Apply points to checkout and deduct from balance
 */
export async function applyPointsToCheckout(
  pointsToApply: number,
  supportFee: number,
  orderTotal: number,
  orderId: string
): Promise<{ 
  success: boolean; 
  application: CheckoutPointsApplication | null; 
  error?: string 
}> {
  try {
    // Calculate how points should be applied
    const { application, error: calcError } = await calculateCheckoutPointsApplication(
      pointsToApply,
      supportFee,
      orderTotal
    );

    if (calcError || !application) {
      return { success: false, application: null, error: calcError };
    }

    if (application.points_to_apply === 0) {
      return { success: false, application: null, error: 'No points to apply' };
    }

    // Deduct points from user's balance
    const { success, error: spendError } = await spendPoints(application.points_to_apply, {
      order_id: orderId,
      support_fee_reduction: application.support_fee_reduction,
      order_total_reduction: application.order_total_reduction,
      source: 'checkout'
    });

    if (!success) {
      return { success: false, application: null, error: spendError };
    }

    // Log audit event
    await logAuditEvent('points_applied_checkout', {
      order_id: orderId,
      points_used: application.points_to_apply,
      support_fee_reduction: application.support_fee_reduction,
      order_total_reduction: application.order_total_reduction,
      total_reduction: application.support_fee_reduction + application.order_total_reduction
    });

    return { success: true, application };
  } catch (error) {
    console.error('Error in applyPointsToCheckout:', error);
    return { success: false, application: null, error: 'Internal server error' };
  }
}

/**
 * Get reward points history for current user
 */
export async function getPointsHistory(): Promise<{ 
  transactions: RewardTransaction[]; 
  total: number; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { transactions: [], total: 0, error: 'Unauthorized' };
    }

    // TODO: Implement actual rewards transaction table
    // For now, return empty array
    // In a full implementation, you'd query a rewards_transactions table
    
    return { 
      transactions: [], 
      total: 0 
    };
  } catch {
    console.error('Error in getPointsHistory');
    return { transactions: [], total: 0, error: 'Internal server error' };
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

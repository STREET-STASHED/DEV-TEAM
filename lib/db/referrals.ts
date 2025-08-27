export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@/app/lib/supabase/server';

export interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_points_earned: number;
}

export interface ReferralWithProfile {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'expired';
  reward_points_awarded: number;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
    referral_code: string;
  };
}

export interface ReferralLeaderboardEntry {
  user_id: string;
  full_name: string;
  total_referrals: number;
  completed_referrals: number;
  total_points_earned: number;
  rank: number;
}

/**
 * Get current user's referral information and stats
 */
export async function getMyReferral(): Promise<{ 
  referralCode: string | null; 
  stats: ReferralStats; 
  referredUsers: ReferralWithProfile[];
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { 
        referralCode: null, 
        stats: { total_referrals: 0, completed_referrals: 0, pending_referrals: 0, total_points_earned: 0 }, 
        referredUsers: [], 
        error: 'Unauthorized' 
      };
    }

    // Get user's referral code
    const { data: profile, error: profileError } = await supabase.from('profiles')
      .select('referral_code')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { 
        referralCode: null, 
        stats: { total_referrals: 0, completed_referrals: 0, pending_referrals: 0, total_points_earned: 0 }, 
        referredUsers: [], 
        error: 'Failed to fetch profile' 
      };
    }

    // Get referrals sent by this user
    const { data: referrals, error: referralsError } = await supabase.from('referrals')
      .select(`
        *,
        profiles (
          full_name,
          email,
          referral_code
        )
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      return { 
        referralCode: profile.referral_code, 
        stats: { total_referrals: 0, completed_referrals: 0, pending_referrals: 0, total_points_earned: 0 }, 
        referredUsers: [], 
        error: 'Failed to fetch referrals' 
      };
    }

    // Calculate stats
    const totalReferrals = referrals?.length || 0;
    const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
    const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
    const totalPointsEarned = referrals?.reduce((sum, r) => sum + (r.reward_points_awarded || 0), 0) || 0;

    const stats: ReferralStats = {
      total_referrals: totalReferrals,
      completed_referrals: completedReferrals,
      pending_referrals: pendingReferrals,
      total_points_earned: totalPointsEarned
    };

    return {
      referralCode: profile.referral_code,
      stats,
      referredUsers: referrals || []
    };
  } catch (error) {
    console.error('Error in getMyReferral:', error);
    return { 
      referralCode: null, 
      stats: { total_referrals: 0, completed_referrals: 0, pending_referrals: 0, total_points_earned: 0 }, 
      referredUsers: [], 
      error: 'Internal server error' 
    };
  }
}

/**
 * Redeem a referral code (server action)
 */
export async function redeemReferral(code: string): Promise<{ 
  success: boolean; 
  referrerId: string | null; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, referrerId: null, error: 'Unauthorized' };
    }

    // Validate referral code format
    if (!code || !code.startsWith('REF-') || code.length !== 12) {
      return { success: false, referrerId: null, error: 'Invalid referral code format' };
    }

    // Find user with this referral code
    const { data: referrerProfile, error: profileError } = await supabase.from('profiles')
      .select('user_id')
      .eq('referral_code', code)
      .single();

    if (profileError || !referrerProfile) {
      return { success: false, referrerId: null, error: 'Invalid referral code' };
    }

    // Prevent self-referral
    if (referrerProfile.user_id === user.id) {
      return { success: false, referrerId: null, error: 'Cannot refer yourself' };
    }

    // Check if user already has a referral
    const { data: existingReferral, error: existingError } = await supabase.from('referrals')
      .select('id')
      .eq('referred_id', user.id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is what we want
      console.error('Error checking existing referral:', existingError);
      return { success: false, referrerId: null, error: 'Failed to check existing referral' };
    }

    if (existingReferral) {
      return { success: false, referrerId: null, error: 'You have already been referred' };
    }

    // Create referral record
    const { data: referral, error: referralError } = await supabase.from('referrals')
      .insert({
        referrer_id: referrerProfile.user_id,
        referred_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating referral:', referralError);
      return { success: false, referrerId: null, error: 'Failed to create referral' };
    }

    // Log audit event
    await logAuditEvent('referral_redeemed', {
      referral_id: referral.id,
      referrer_id: referrerProfile.user_id,
      referred_id: user.id,
      code: code
    });

    return { 
      success: true, 
      referrerId: referrerProfile.user_id 
    };
  } catch (error) {
    console.error('Error in redeemReferral:', error);
    return { success: false, referrerId: null, error: 'Internal server error' };
  }
}

/**
 * Get referral leaderboard
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<{ 
  leaderboard: ReferralLeaderboardEntry[]; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get top referrers by completed referrals
    const { data: leaderboard, error } = await supabase.from('referrals')
      .select(`
        referrer_id,
        status,
        reward_points_awarded,
        profiles!referrer_id (
          full_name
        )
      `)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching referral data:', error);
      return { leaderboard: [], error: 'Failed to fetch leaderboard data' };
    }

    // Aggregate data by referrer
    const referrerStats = new Map<string, ReferralLeaderboardEntry>();
    
    leaderboard?.forEach(referral => {
      const referrerId = referral.referrer_id;
      const existing = referrerStats.get(referrerId);
      
      if (existing) {
        existing.completed_referrals += 1;
        existing.total_points_earned += referral.reward_points_awarded || 0;
      } else {
        referrerStats.set(referrerId, {
          user_id: referrerId,
          full_name: (referral.profiles as unknown as Record<string, unknown>[])?.[0]?.full_name as string || (referral.profiles as unknown as Record<string, unknown>)?.full_name as string || 'Unknown User',
          total_referrals: 0, // We'll calculate this separately
          completed_referrals: 1,
          total_points_earned: referral.reward_points_awarded || 0,
          rank: 0
        });
      }
    });

    // Get total referrals for each user
    const { data: totalReferrals, error: totalError } = await supabase.from('referrals')
      .select('referrer_id')
      .eq('referrer_id', Array.from(referrerStats.keys()));

    if (!totalError && totalReferrals) {
      totalReferrals.forEach(ref => {
        const stats = referrerStats.get(ref.referrer_id);
        if (stats) {
          stats.total_referrals += 1;
        }
      });
    }

    // Convert to array and sort by completed referrals, then by points
    const leaderboardArray = Array.from(referrerStats.values())
      .sort((a, b) => {
        if (b.completed_referrals !== a.completed_referrals) {
          return b.completed_referrals - a.completed_referrals;
        }
        return b.total_points_earned - a.total_points_earned;
      })
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    return { leaderboard: leaderboardArray };
  } catch (error) {
    console.error('Error in getReferralLeaderboard:', error);
    return { leaderboard: [], error: 'Internal server error' };
  }
}

/**
 * Generate referral code for current user
 */
export async function generateReferralCode(): Promise<{ 
  referralCode: string | null; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { referralCode: null, error: 'Unauthorized' };
    }

    // Check if user already has a referral code
    const { data: profile, error: profileError } = await supabase.from('profiles')
      .select('referral_code')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { referralCode: null, error: 'Failed to fetch profile' };
    }

    if (profile.referral_code) {
      return { referralCode: profile.referral_code };
    }

    // Generate unique referral code
    let referralCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      referralCode = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      attempts++;
      
      // Check if code is unique
      const { data: existing } = await supabase.from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (!existing) break;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return { referralCode: null, error: 'Failed to generate unique referral code' };
    }

    // Update profile with referral code
    const { error: updateError } = await supabase.from('profiles')
      .update({ referral_code: referralCode })
      .eq('user_id', user.id)
      .select('referral_code')
      .single();

    if (updateError) {
      console.error('Error updating profile with referral code:', updateError);
      return { referralCode: null, error: 'Failed to save referral code' };
    }

    // Log audit event
    await logAuditEvent('referral_code_generated', {
      user_id: user.id,
      referral_code: referralCode
    });

    return { referralCode };
  } catch (error) {
    console.error('Error in generateReferralCode:', error);
    return { referralCode: null, error: 'Internal server error' };
  }
}

/**
 * Get referral by ID with full details
 */
export async function getReferralById(referralId: string): Promise<{ 
  referral: ReferralWithProfile | null; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { referral: null, error: 'Unauthorized' };
    }

    const { data: referral, error } = await supabase.from('referrals')
      .select(`
        *,
        profiles (
          full_name,
          email,
          referral_code
        )
      `)
      .eq('id', referralId)
      .single();

    if (error || !referral) {
      return { referral: null, error: 'Referral not found' };
    }

    // Check permissions
    const { data: profile } = await supabase.from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isReferrer = referral.referrer_id === user.id;
    const isReferred = referral.referred_id === user.id;
    const isAdmin = profile?.role === 'admin';

    if (!isReferrer && !isReferred && !isAdmin) {
      return { referral: null, error: 'Insufficient permissions' };
    }

    return { referral };
  } catch {
    console.error('Error in getReferralById');
    return { referral: null, error: 'Internal server error' };
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

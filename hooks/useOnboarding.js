/* eslint-env browser */
'use client';
/* global fetch, console */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.ts';

// Define the valid role types to match your database enum
export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER_BRAND: 'seller/brand',
  STYLIST: 'stylist',
  DRIVER: 'driver'
};

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} [full_name]
 * @property {string} [role]
 * @property {string} [onboarding_step]
 * @property {boolean} [details_complete]
 * @property {boolean} [has_completed_onboarding]
 * @property {string} [verification_submitted_at]
 * @property {string} [business_license_url]
 * @property {string} [brand_logo_url]
 * @property {string} [additional_document_url]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * Custom hook for onboarding profile data.
 * @returns {{
 *   profile: Profile | null,
 *   loading: boolean,
 *   error: string | null,
 *   updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: any }>,
 *   updateOnboardingStep: (step: string) => Promise<{ data: Profile | null; error: any }>,
 *   completeOnboarding: () => Promise<{ data: Profile | null; error: any }>,
 *   refreshProfile: () => Promise<void>,
 *   updateUserRole: (newRole: string) => Promise<any>,
 *   USER_ROLES: Record<string, string>,
 *   ONBOARDING_STEPS: Record<string,string>
 * }}
 */
export function useOnboarding() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.access_token) throw new Error('No valid session token found');

      const res = await fetch('http://localhost:54321/functions/v1/handle-onboarding', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) throw new Error(`Edge Function failed: ${res.status}`);
      const responseData = await res.json();
      if (!responseData?.success) throw new Error('Failed to retrieve profile');
      setProfile(responseData?.user || null);
    } catch (err) {
      console.error('fetchProfile error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates })
        .select()
        .limit(1);

      if (upsertError) throw upsertError;

      const result = data?.[0] || null;
      setProfile(result);
      return { data: result, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingStep = (step) => updateProfile({ onboarding_step: step });

  const completeOnboarding = () =>
    updateProfile({ has_completed_onboarding: true, onboarding_step: 'complete' });

  const updateUserRole = async (newRole) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.id) throw new Error('User not authenticated');

      if (!Object.values(USER_ROLES).includes(newRole)) {
        throw new Error('Invalid role selected');
      }

      const { data, error: updateError } = await supabase.rpc('update_profile_role', {
        user_id: user.id,
        new_role: newRole
      });
      if (updateError) throw updateError;

      await fetchProfile();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      const onboardingPaths = ['/onboarding/role', '/onboarding/details', '/onboarding/verify'];
      const pathname = globalThis?.window?.location?.pathname;
      if (onboardingPaths.includes(pathname)) {
        setShouldFetch(true);
      }
    }
  }, []);

  useEffect(() => {
    if (shouldFetch) fetchProfile();
  }, [shouldFetch]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateOnboardingStep,
    completeOnboarding,
    refreshProfile: fetchProfile,
    updateUserRole,
    ONBOARDING_STEPS: {
      ROLE: 'role',
      DETAILS: 'details',
      VERIFY: 'verify',
      COMPLETE: 'complete'
    },
    USER_ROLES
  };
}
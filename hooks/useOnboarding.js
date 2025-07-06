

'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
 *   updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null, error: any }>,
 *   updateOnboardingStep: (step: string) => Promise<{ data: Profile | null, error: any }>,
 *   completeOnboarding: () => Promise<{ data: Profile | null, error: any }>,
 *   refreshProfile: () => Promise<void>
 * }}
 */
export function useOnboarding() {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const user = sessionData.session?.user;
      if (!user) {
        setProfile(null);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error('No authenticated user');
      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates })
        .select()
        .single();
      if (upsertError) throw upsertError;
      setProfile(data);
      return { data, error: null };
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

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateOnboardingStep,
    completeOnboarding,
    refreshProfile: fetchProfile,
  };
}
// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabaseClient';

export interface UserProfile {
  role: string;
  full_name?: string;
  // add more profile fields if needed
}

/**
 * Custom hook to fetch the current user's profile (including role) from Supabase.
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      // 1) Get the logged-in user from Supabase Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 2) Fetch their profile row
        const { data, error } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (error) console.error('Error loading profile:', error);
        setProfile(
          data
            ? {
                ...data,
                full_name: data.full_name ?? undefined,
              }
            : null
        );
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  return { profile, loading };
}

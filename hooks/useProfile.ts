// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

export interface UserProfile {
  role: string;
  full_name?: string;
}

/** Fetch the current user's profile (including role) from Supabase. */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const resp = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        const data = resp.data as UserProfile | null;
        const error = resp.error;
        if (error) console.error('Error loading profile:', error);
        setProfile(data ?? null);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  return { profile, loading };
}

// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import supabaseAdmin from '../lib/supabaseAdmin';

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
      } = await supabaseAdmin.auth.getUser();
      if (user) {
        // use `any` to bypass generated typings for the `profiles` table
        const resp = await (supabaseAdmin as any)
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

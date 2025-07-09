import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';


export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}


export async function getVerifiedProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, verified')
    .eq('verified', true);

  if (error) {
    console.error('Error fetching verified profiles:', error);
    return [];
  }

  return data;
}
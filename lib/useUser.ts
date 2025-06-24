import { useEffect, useState } from 'react';
import supabase from './supabaseClient';

interface AppUser {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        setUser(null);
      } else {
        setUser({ ...authUser, ...userData } as AppUser);
      }
    } catch (error) {
      console.error('Unexpected error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      fetchUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

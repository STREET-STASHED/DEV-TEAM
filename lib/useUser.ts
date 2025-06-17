import { useEffect, useState } from 'react';
import supabase from './supabaseClient';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, role')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        setUser(null);
      } else {
        setUser({ ...user, ...userData });
      }

      setLoading(false);
    };

    getUser();
  }, []);

  return { user, loading };
}

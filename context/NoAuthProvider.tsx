import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Session } from '@supabase/supabase-js';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NoAuthContextType = {
  isAuthenticated: boolean;
};

const NoAuthContext = createContext<NoAuthContextType>({ isAuthenticated: false });

export const useNoAuth = () => useContext(NoAuthContext);

type NoAuthProviderProps = {
  children: React.ReactNode;
};

export default function NoAuthProvider({ children }: NoAuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    isAuthenticated: !!session,
  };

  return <NoAuthContext.Provider value={value}>{children}</NoAuthContext.Provider>;
}

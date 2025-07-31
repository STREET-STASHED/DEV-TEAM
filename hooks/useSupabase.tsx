import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    // Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("getSession error:", error);
      if (mounted) {
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
        setLoading(false);
      }
    });
    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      },
    );
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
    });
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  };

  const updatePassword = async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
  };
};

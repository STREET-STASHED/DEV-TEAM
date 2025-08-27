import { createSupabaseBrowser } from "@/app/lib/supabase/browser";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const supabase = createSupabaseBrowser();
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("getSession error:", error);
        if (mounted) {
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to get initial session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void getInitialSession();

    // Subscribe to auth changes
    const supabase = createSupabaseBrowser();
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
    const supabase = createSupabaseBrowser();
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signUp = async (email: string, password: string) => {
    const supabase = createSupabaseBrowser();
    return await supabase.auth.signUp({
      email,
      password,
    });
  };

  const resetPassword = async (email: string) => {
    const supabase = createSupabaseBrowser();
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  };

  const updatePassword = async (newPassword: string) => {
    const supabase = createSupabaseBrowser();
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

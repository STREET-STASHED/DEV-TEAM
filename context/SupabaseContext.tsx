import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

// Define the Profile type to match a realistic Supabase marketplace schema
type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: "buyer" | "seller" | "stylist" | "driver" | null;
};

interface SupabaseContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  signIn: (params: {
    email: string;
    password: string;
  }) => Promise<{ error: any; data: any }>;
  signUp: (params: {
    email: string;
    password: string;
  }) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined,
);

type SupabaseProviderProps = {
  children: ReactNode;
};

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Fetch profile from the database
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      setProfile(null);
      return;
    }
    setProfile(data);
  };

  useEffect(() => {
    let mounted = true;
    const getSessionAndProfile = async () => {
      setLoading(true);
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      if (activeSession?.user) {
        await fetchProfile(activeSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { data, error };
  };

  const signUp = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const value: SupabaseContextType = {
    user,
    session,
    loading,
    profile,
    signIn,
    signUp,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

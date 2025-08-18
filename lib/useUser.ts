import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setIsLoading(false);
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.warn("No profile found for user yet — possibly a new signup.");
      }

      setProfile(profileData ?? null);

      setIsLoading(false);
    };

    void getUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, isLoading };
}

export async function getVerifiedProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, verified")
    .eq("verified", true);

  if (error) {
    console.error("Error fetching verified profiles:", error);
    return [];
  }

  return data;
}

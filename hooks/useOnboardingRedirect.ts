"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function useOnboardingRedirect() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!router.isReady) return;
    // Skip redirect logic on the final verify step
    if (router.pathname === '/onboarding/verify') return;

    const checkOnboarding = async () => {
      // Ensure the user is logged in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace("/signup");
        return;
      }

      // Fetch onboarding flags
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, details_complete, verified")
        .eq("id", user.id)
        .single();
      if (profileError || !profile) {
        return;
      }

      const { role, details_complete, verified } = profile;
      const current = router.pathname;

      // Enforce onboarding flow
      if (!role && current !== "/onboarding/role") {
        router.replace("/onboarding/role");
      } else if (role && !details_complete && current !== "/onboarding/details") {
        router.replace("/onboarding/details");
      } else if (role && details_complete && !verified && current !== "/onboarding/verify") {
        router.replace("/onboarding/verify");
      }
      // All steps complete → no redirect (manual dashboard push should handle final)
    };

    checkOnboarding();
  }, [router]);
}
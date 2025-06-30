"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function useOnboardingRedirect() {
  const router = useRouter();
  const { isReady, pathname, replace } = router;
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!isReady) return;
    // Only protect the first two onboarding steps: role and details
    if (
      !pathname.startsWith('/onboarding/role') &&
      !pathname.startsWith('/onboarding/details')
    ) {
      return;
    }

    const checkOnboarding = async () => {
      // Ensure the user is logged in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        replace("/signup");
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
      const current = pathname;

      // Enforce onboarding flow
      if (!role && current !== "/onboarding/role") {
        replace("/onboarding/role");
      } else if (role && !details_complete && current !== "/onboarding/details") {
        replace("/onboarding/details");
      }
      // All steps complete → no redirect (dashboard handling takes over)
    };

    checkOnboarding();
  }, [isReady, pathname]);
}
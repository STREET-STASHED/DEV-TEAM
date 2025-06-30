"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardRedirect } from "@/lib/getDashboardRedirect";

export default function useOnboardingRedirect() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!router.isReady) return;

    const path = router.pathname;
    // Only guard onboarding steps and dashboard/admin pages
    if (
      !path.startsWith("/onboarding") &&
      !path.startsWith("/dashboard") &&
      !path.startsWith("/admin")
    ) {
      return;
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return router.replace("/signup");
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role, details_complete, verified")
        .eq("id", user.id)
        .single();

      if (!profile) {
        return router.replace("/signup");
      }

      const { role, details_complete, verified } = profile;

      // If fully onboarded, send them to their dashboard
      if (role && details_complete && verified) {
        return router.replace(getDashboardRedirect(role));
      }

      // Otherwise, enforce the appropriate onboarding step:
      if (!role) {
        return router.replace("/onboarding/role");
      }
      if (!details_complete) {
        return router.replace("/onboarding/details");
      }
      if (!verified) {
        return router.replace("/onboarding/verify");
      }
    })();
  }, [router]);
}
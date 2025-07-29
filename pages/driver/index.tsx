import { useEffect } from "react";
import { useRouter } from "next/router";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function DriverIndex() {
  const router = useRouter();
  const { profile, loading } = useOnboarding();

  useEffect(() => {
    if (loading || !profile) return;

    const timeout = setTimeout(() => {
      if (!profile) {
        router.replace("/onboarding/role");
      } else if (profile.role === "driver") {
        if (profile.has_completed_onboarding) {
          router.replace("/driver/dashboard");
        } else {
          router.replace("/onboarding/verify");
        }
      } else {
        router.replace("/unauthorized");
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [profile, loading]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg">
      Checking access...
    </div>
  );
}

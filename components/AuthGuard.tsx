"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const { session, isLoading, supabaseClient } = useSessionContext();

  useEffect(() => {
    const validateUser = async () => {
      const onboardingPaths = [
        "/welcome",
        "/signup",
        "/onboarding/role",
        "/onboarding/details",
        "/onboarding/verify",
      ];

      if (onboardingPaths.includes(router.pathname)) return;

      if (!isLoading && !session?.user) {
        router.replace("/welcome");
        return;
      }

      if (requiredRole) {
        const { data: userData } = await supabaseClient
          .from("users")
          .select("role")
          .eq("id", session?.user?.id)
          .single();

        if (!userData || userData.role !== requiredRole) {
          router.replace("/welcome");
          return;
        }
      }
    };

    if (!isLoading) validateUser();
  }, [session, isLoading, requiredRole, router.pathname]);

  if (isLoading) return null;

  return <>{children}</>;
};

export default AuthGuard;
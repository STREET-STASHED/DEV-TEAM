"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createBrowserClient } from "@supabase/ssr";
import { Session, User } from "@supabase/supabase-js";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setIsLoading(false);
    };
    getSession();
  }, []);

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

      if (!isLoading && !session?.user?.id) {
        router.replace("/welcome");
        return;
      }

      if (requiredRole) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session!.user!.id)
          .single();

        if (!userData || userData?.role !== requiredRole) {
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
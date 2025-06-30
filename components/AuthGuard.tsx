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
      if (!session?.user) {
        router.replace("/signup");
        return;
      }

      if (requiredRole) {
        const { data: userData } = await supabaseClient
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!userData || userData.role !== requiredRole) {
          router.replace("/signup");
          return;
        }
      }
    };

    if (!isLoading) validateUser();
  }, [session, isLoading, requiredRole]);

  if (isLoading) return null;

  return <>{children}</>;
};

export default AuthGuard;
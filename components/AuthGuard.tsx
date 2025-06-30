"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        router.replace("/signup");
        setLoading(false);
        return;
      }

      if (requiredRole) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!userData || userData.role !== requiredRole) {
          router.replace("/signup");
          setLoading(false);
          return;
        }
      }

      setAuthenticated(true);
      setLoading(false);
    };

    checkSession();
  }, [requiredRole]);

  if (loading) return null;

  return authenticated ? <>{children}</> : null;
};

export default AuthGuard;
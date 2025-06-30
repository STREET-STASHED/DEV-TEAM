"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Only protect dashboard/admin routes; let all other routes pass through
    if (!pathname?.startsWith('/dashboard') && !pathname?.startsWith('/admin')) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();

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
  }, [pathname, requiredRole]);

  if (loading) return null;

  return authenticated ? <>{children}</> : null;
};

export default AuthGuard;
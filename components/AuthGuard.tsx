"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user && pathname !== "/signup") {
        router.replace("/signup");
      } else {
        setAuthenticated(true);
      }

      setLoading(false);
    };

    checkSession();
  }, [pathname]);

  if (loading) return null;

  return authenticated ? <>{children}</> : null;
};

export default AuthGuard;
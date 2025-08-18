import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import PropTypes from "prop-types";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const publicRoutes = useMemo(() => [
    "/",
    "/welcome",
    "/marketplace",
    "/stores",
    "/stylist-booking",
  ], []);

  const redirectToDashboard = useCallback((role) => {
    switch (role) {
      case "buyer":
        router.replace("/buyer/dashboard");
        break;
      case "seller":
        router.replace("/seller/dashboard");
        break;
      case "stylist":
        router.replace("/stylist/dashboard");
        break;
      case "driver":
        router.replace("/driver/dashboard");
        break;
      default:
        router.replace("/dashboard");
    }
  }, [router]);

  const fetchUserAndRedirect = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      if (
        !router.pathname.startsWith("/auth") &&
        !publicRoutes.includes(router.pathname)
      ) {
        router.replace(`/auth?redirectedFrom=${router.pathname}`);
      }
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role, onboarding_step")
      .eq("user_id", user.id)
      .single();

    if (!data || error) {
      console.error("Error fetching role from profiles table:", error);
      setProfileError(error);
      setIsLoading(false);
      return;
    }

    const { role, onboarding_step } = data;
    setIsLoading(false);

    if (
      onboarding_step !== "completed" &&
      router.pathname !== "/onboarding"
    ) {
      router.replace("/onboarding");
      return;
    }

    if (onboarding_step === "completed") {
      if (
        router.pathname === "/onboarding" ||
        router.pathname === "/dashboard" ||
        router.pathname === "/"
      ) {
        redirectToDashboard(role);
      }
    }
  }, [router, publicRoutes, redirectToDashboard]);

  useEffect(() => {
    void fetchUserAndRedirect();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        await fetchUserAndRedirect();
      } else if (event === "SIGNED_OUT") {
        if (
          !router.pathname.startsWith("/auth") &&
          !publicRoutes.includes(router.pathname)
        ) {
          router.replace(`/auth?redirectedFrom=${router.pathname}`);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserAndRedirect, router, publicRoutes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error loading profile. Please refresh or contact support.</p>
      </div>
    );
  }

  return <>{children}</>;
}

ProtectedLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

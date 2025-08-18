import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import type { NextRouter } from "next/router";
import { useEffect, useState } from "react";
import { SupabaseProvider } from "../context/SupabaseContext.tsx";
import { CartProvider } from "../context/CartContext";
import Layout from "../components/Layout";
import ProtectedLayout from "../components/ProtectedLayout";
import { supabase } from "../lib/supabaseClient";
import CartDrawer from "../components/CartDrawer";

async function handleRedirect(router: NextRouter) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return;
    }

    console.log("[APP REDIRECT] Found session token:", session.access_token);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/handle-redirect`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      },
    );

    let data;
    try {
      const text = await response.text();
      console.log("[APP REDIRECT STATUS]", response.status);
      console.log("[APP REDIRECT RAW]", text);
      data = JSON.parse(text);
    } catch (err) {
      console.error("[APP REDIRECT ERROR] Failed to parse JSON:", err);
      return;
    }

    if (response.ok && data?.redirectTo) {
      await router.replace(data.redirectTo);
    } else {
      console.warn(
        "[APP REDIRECT ERROR] No valid redirect data or response not OK",
        data,
      );
    }
  } catch (error) {
    console.error("[APP REDIRECT ERROR]", error);
  }
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const protectedRoutes = ["/dashboard", "/onboarding"];
  const isProtected = protectedRoutes.some((path) =>
    router.pathname.startsWith(path),
  );

  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);

  useEffect(() => {
    const runRedirect = async () => {
      if (!hasHandledRedirect && router.isReady) {
        await handleRedirect(router);
        setHasHandledRedirect(true);
      }
    };

    void runRedirect();
  }, [router.pathname, router.isReady, hasHandledRedirect, router]);

  return (
    <SupabaseProvider>
      <CartProvider>
        <Layout>
          {isProtected ? (
            <ProtectedLayout>
              <Component {...pageProps} />
            </ProtectedLayout>
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
        <CartDrawer />
      </CartProvider>
    </SupabaseProvider>
  );
}

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useSession } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';
import { CartProvider } from '../context/CartContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../components/Header';
import dynamic from 'next/dynamic';
import React from 'react';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/auth-helpers-react';

type MyAppProps = AppProps & {
  pageProps: AppProps['pageProps'] & { initialSession?: Session };
};

export default function MyApp({ Component, pageProps }: MyAppProps) {
  const [supabaseClient] = React.useState(() => createPagesBrowserClient());

  const router = useRouter();

  const session = useSession();

  useEffect(() => {
    if (!router.isReady || typeof session === 'undefined') return;

    console.log("🔥 Routing Check Triggered");
    console.log("router.pathname:", router.pathname);
    console.log("session.user:", session?.user);

    const runRedirectLogic = async () => {
      if (!supabaseClient) return;
      const supabase = supabaseClient;

      const unprotected = ['/', '/welcome', '/signup'];
      const onboarding = ['/onboarding/role', '/onboarding/details', '/onboarding/verify'];
      const currentPath = router.pathname;

      if (!session?.user && !unprotected.includes(currentPath)) {
        console.log("❌ No session.user — redirecting to /welcome");
        await router.push('/welcome');
        return;
      }

      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('role, details_complete')
          .eq('id', session.user.id)
          .single();

        console.log("✅ Fetched userProfile:", userProfile);

        const role = userProfile?.role;
        const detailsComplete = userProfile?.details_complete;

        // Improved onboarding flow: /onboarding/role → /onboarding/details → /onboarding/verify → <role>/dashboard
        if (!role && currentPath !== '/onboarding/role') {
          console.log("➡️ Redirecting to /onboarding/role");
          await router.push('/onboarding/role');
          return;
        }

        if (role && !detailsComplete && currentPath !== '/onboarding/details') {
          console.log("➡️ Redirecting to /onboarding/details");
          await router.push('/onboarding/details');
          return;
        }

        if (role && detailsComplete && currentPath !== '/onboarding/verify' && currentPath !== `/${role}/dashboard`) {
          const { data: verificationCheck } = await supabase
            .from('users')
            .select('verified')
            .eq('id', session.user.id)
            .single();

          const isVerified = verificationCheck?.verified;

          if (!isVerified && currentPath !== '/onboarding/verify') {
            console.log("➡️ Redirecting to /onboarding/verify");
            await router.push('/onboarding/verify');
            return;
          }

          if (isVerified && onboarding.includes(currentPath)) {
            console.log("✅ Fully onboarded — redirecting to dashboard");
            await router.push(`/${role}/dashboard`);
            return;
          }
        }
      }
    };

    runRedirectLogic();
  }, [router, session, supabaseClient]);

  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

  const isBuyerFacing =
    router.pathname === '/' ||
    router.pathname === '/welcome' ||
    router.pathname === '/buyer/marketplace' ||
    router.pathname.startsWith('/buyer') ||
    router.pathname.startsWith('/stores');

  const NoAuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  const CartDrawer = dynamic(() => import('../components/CartDrawer'), { ssr: false });

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <CartProvider>
        <Elements stripe={stripePromise}>
          <NoAuthProvider>
            <div className="min-h-screen text-white font-urbanist bg-black bg-[url('/background.png')] bg-cover bg-center bg-fixed">
              <Header />
              <div style={{ paddingTop: 80 }}>
                <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
                  <Component {...pageProps} />
                </main>
              </div>
              {isBuyerFacing && <CartDrawer />}
            </div>
          </NoAuthProvider>
        </Elements>
      </CartProvider>
    </SessionContextProvider>
  );
}
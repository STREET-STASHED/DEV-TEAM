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
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/auth-helpers-react';

type MyAppProps = AppProps & {
  pageProps: AppProps['pageProps'] & { initialSession?: Session };
};

export default function MyApp({ Component, pageProps }: MyAppProps) {
  const router = useRouter();

  const session = useSession();

  useEffect(() => {
    const unprotected = ['/', '/welcome', '/signup'];
    const onboarding = ['/onboarding/role', '/onboarding/details', '/onboarding/verify'];
    const currentPath = router.pathname;

    if (!session?.user && !unprotected.includes(currentPath)) {
      router.push('/welcome');
    }

    const userRole = pageProps.user?.role;
    const detailsComplete = pageProps.user?.detailsComplete;

    if (session?.user) {
      if (!userRole && !onboarding.includes(currentPath)) {
        router.push('/onboarding/role');
      } else if (userRole && !detailsComplete && !onboarding.includes(currentPath)) {
        router.push('/onboarding/details');
      }
    }
  }, [router, session]);

  const [supabaseClient] = React.useState(() => createBrowserSupabaseClient());

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
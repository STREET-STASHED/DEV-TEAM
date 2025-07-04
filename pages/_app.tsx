import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import dynamic from 'next/dynamic';
import React from 'react';

import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import Layout from '../components/Layout';

const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type MyAppProps = AppProps & {
  pageProps: AppProps['pageProps'] & { initialSession?: Session };
};

export default function MyApp({ Component, pageProps }: MyAppProps) {
  const router = useRouter();

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const isLoading = typeof session === 'undefined';

  useEffect(() => {
    const fetchUserAndSession = async () => {
      const { data: userData } = await supabaseClient.auth.getUser();
      if (userData?.user) {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        console.log('Supabase session:', sessionData.session);
        console.log('User ID:', userData.user.id);
        setSession(sessionData.session);
      } else {
        setSession(null);
      }
    };
    fetchUserAndSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!router.isReady || isLoading || typeof session === 'undefined') return;

    const runRedirectLogic = async () => {
      console.log('Running redirect logic...');

      const currentPath = router.pathname;
      const unprotected = ['/', '/welcome', '/signup'];
      const onboarding = ['/onboarding/role', '/onboarding/details', '/onboarding/verify'];

      if (!session?.user && !unprotected.includes(currentPath)) {
        await router.push('/welcome');
        return;
      }

      if (session?.user) {
        const { data: userProfile } = await supabaseClient
          .from('profiles')
          .select('role, details_complete')
          .eq('id', session.user.id)
          .single();

        if (!userProfile) {
          console.warn('User profile not found. Staying on current page.');
          return;
        }

        const role = userProfile?.role;
        const detailsComplete = userProfile?.details_complete;

        if (!role && currentPath !== '/onboarding/role') {
          await router.push('/onboarding/role');
          return;
        }

        if (role && !detailsComplete && currentPath !== '/onboarding/details') {
          await router.push('/onboarding/details');
          return;
        }

        if (role && detailsComplete) {
          const { data: verificationCheck } = await supabaseClient
            .from('profiles')
            .select('has_completed_onboarding, verification_complete')
            .eq('id', session.user.id)
            .single();

          const isVerified =
            verificationCheck?.has_completed_onboarding ||
            verificationCheck?.verification_complete;

          if (!isVerified && currentPath !== '/onboarding/verify') {
            await router.push('/onboarding/verify');
            return;
          }

          if (isVerified && onboarding.includes(currentPath) && currentPath !== `/${role}/dashboard`) {
            await router.push(`/${role}/dashboard`);
            return;
          }
        }
      }
    };

    runRedirectLogic();
  }, [router, session, isLoading]);

  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

  if (isLoading) {
    console.log('Waiting for session...');
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Elements>
  );
}
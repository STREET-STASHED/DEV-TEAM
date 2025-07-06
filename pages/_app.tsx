import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import dynamic from 'next/dynamic';
import React from 'react';

import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

import type { NextPage } from 'next';
import Layout from '../components/Layout';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};


export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const isLoading = typeof session === 'undefined';

  useEffect(() => {
    const fetchUserAndSession = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: sessionData } = await supabase.auth.getSession();
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <Elements stripe={stripePromise}>
      {getLayout(<Component {...pageProps} />)}
    </Elements>
  );
}
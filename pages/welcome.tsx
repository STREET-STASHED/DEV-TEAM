import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import supabaseBrowserClient from '@/lib/supabaseBrowserClient';
import { cookies } from 'next/headers';

export default function WelcomePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const init = async () => {
      console.log('Welcome page loaded');
      const {
        data: { session },
      } = await supabaseBrowserClient.auth.getSession();
      setSession(session);

      if (!session?.user.id) {
        console.log('No user session found');
        return;
      }

      const { data: userInfo, error } = await supabaseBrowserClient
        .from('users')
        .select('role, details_complete, verified')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !userInfo) {
        console.error('Error fetching user info:', error);
        return;
      }

      if (!userInfo.role) {
        console.log('Redirecting to role selection');
        return router.push('/onboarding/role');
      }

      if (!userInfo.details_complete) {
        console.log('Redirecting to details form');
        return router.push('/onboarding/details');
      }

      if (!userInfo.verified) {
        console.log('Redirecting to verification step');
        return router.push('/onboarding/verify');
      }

      const dashboardMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
      };

      console.log(`Redirecting to ${dashboardMap[userInfo.role] || '/'}`);
      router.push(dashboardMap[userInfo.role] || '/');
    };

    init();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti px-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-widest uppercase mb-6 drop-shadow-lg">
        Welcome to STREETSTASHED
      </h1>
      <p className="mb-10 text-lg text-yellow-300 max-w-xl">
        The future of fashion delivery. Tap in to browse the culture or become part of the movement.
      </p>
      <div className="flex flex-col md:flex-row gap-6">
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg transition"
        >
          🔍 Browse Drops
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="bg-white hover:bg-yellow-200 text-black font-bold py-3 px-8 rounded-full text-lg transition"
        >
          🚀 Join as Seller, Stylist or Driver
        </button>
      </div>
    </div>
  );
}
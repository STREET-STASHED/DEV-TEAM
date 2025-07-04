import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { getDashboardRedirect } from '@/lib/getDashboardRedirect';

const Hero = () => {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        setSession({ user } as Session);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, details_complete')
          .eq('id', user.id)
          .single();

        if (profile && profile.details_complete && !profileError) {
          router.push(getDashboardRedirect(profile.role));
        }
      }
    };

    fetchUserAndProfile();
  }, [router]);

  return (
    <section
      className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-4 py-20 bg-cover bg-center bg-[url('/background.png')] bg-no-repeat bg-fixed"
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-400">
          24/7 STREETWEAR DELIVERY
        </h1>
        <p className="text-white mt-4 max-w-2xl">
          {session
            ? "Welcome back. Your dashboard is one click away."
            : "Instant access to local streetwear, stylists, and exclusive drops. Delivered anytime, anywhere."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/buyer/marketplace"
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-200 transition text-center"
          >
            Browse Marketplace
          </Link>
          {!session ? (
            <Link
              href="/signup"
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold shadow hover:bg-yellow-500 transition text-center"
            >
              Become a Seller or Stylist
            </Link>
          ) : (
            <Link
              href="#"
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', user?.id)
                  .single();

                if (profile?.role) {
                  router.push(getDashboardRedirect(profile.role));
                }
              }}
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold shadow hover:bg-yellow-500 transition text-center"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
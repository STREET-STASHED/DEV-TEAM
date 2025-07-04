import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Layout from '../components/Layout';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WelcomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });
  }, []);

  return (
    <Layout>
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 py-12">
        <div className="max-w-2xl w-full bg-secondary/80 p-8 rounded-xl shadow-lg space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-primary tracking-tight">
            STREETSTASHED
          </h1>
          <p className="text-xl md:text-2xl text-secondary/70 max-w-2xl">
            Your 24/7 plug for streetwear, stylists, kicks & essentials — all delivered.
          </p>
          <p className="text-md text-secondary/50 mt-3">
            Shop the drip or join the movement — sell, style, or deliver.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
            <Link
              href="/buyer/marketplace"
              aria-label="Start shopping for streetwear"
              className="bg-primary text-secondary hover:bg-accent font-semibold py-4 px-8 rounded w-full sm:w-auto hover:scale-105 transition-transform"
            >
              🛍️ Start Shopping
            </Link>
            {!isLoading && (
              <button
                onClick={() => router.push('/signup')}
                className="border border-primary text-primary hover:bg-primary hover:text-secondary font-semibold py-4 px-8 rounded w-full sm:w-auto hover:scale-105 transition-transform"
              >
                ✍️ Join Us
              </button>
            )}
            <Link
              href="/login"
              aria-label="Login to your account"
              className="bg-secondary/90 text-primary hover:bg-secondary/70 font-semibold py-4 px-8 rounded w-full sm:w-auto hover:scale-105 transition-transform"
            >
              🔐 Login
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
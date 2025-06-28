import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

const Hero = () => {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        setSession(data.session);
      }
    );
  }, []);

  return (
    <section
      className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-4 py-20 bg-cover bg-center"
      style={{ backgroundImage: 'url(/your-background.jpg)' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-400">
          STREETSTASHED
        </h1>
        <p className="text-white mt-4 max-w-2xl">
          Your all-access pass to streetwear, stylists, and exclusive drops — delivered 24/7.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/buyer/marketplace">
            <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-200 transition">
              🛍️ Start Shopping
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold shadow hover:bg-yellow-500 transition">
              ✍️ Join the Platform
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
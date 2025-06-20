import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Hero from '@/components/Hero';
// import the Supabase client
import supabase from '@/lib/supabaseClient';
// import a function to get the user role
import getUserRole from '../lib/getUserRole';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const redirectUser = async () => {
      if (!session?.user?.email) return;

      const role = await getUserRole(session.user.email); // Fetch role from Supabase
      if (role === 'seller') router.push('/seller/dashboard');
      else if (role === 'stylist') router.push('/stylist/dashboard');
      else if (role === 'driver') router.push('/driver/dashboard');
      else router.push('/buyers/marketplace');
    };

    redirectUser();
  }, [session]);

  return (
    <>
      <Hero />
      {/* Additional homepage content like featured products, testimonials, or how-it-works sections can go here */}
    </>
  );
}

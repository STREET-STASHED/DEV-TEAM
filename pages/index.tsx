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

  if (!session) {
    return (
      <>
        <Hero />
        {/* Additional homepage content like featured products, testimonials, or how-it-works sections can go here */}
      </>
    );
  }

  useEffect(() => {
    if (!session) return;

    const redirectUser = async () => {
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from('users')
        .select('role, details_complete')
        .eq('email', session.user.email)
        .single();

      if (error || !data) {
        console.error('User data fetch error or user not found');
        return;
      }

      const { role, details_complete } = data;

      if (!role) {
        router.push('/onboarding/role');
      } else if (!details_complete) {
        router.push('/onboarding/details');
      } else {
        switch (role) {
          case 'seller':
            router.push('/seller/dashboard');
            break;
          case 'stylist':
            router.push('/stylist/dashboard');
            break;
          case 'driver':
            router.push('/driver/dashboard');
            break;
          default:
            router.push('/buyers/marketplace');
            break;
        }
      }
    };

    redirectUser();
  }, [session]);

  return null;
}

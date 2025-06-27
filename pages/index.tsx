import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getUserRole } from '@/lib/getUserRole';
import supabase from "@/lib/supabaseBrowserClient";

export default function IndexPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchUserAndRedirect = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("Fetched user:", user);

        if (!user) {
          router.push('/welcome');
          return;
        }

        setUser(user);

        const email = user.email;
        if (!email) {
          router.push('/welcome');
          return;
        }

        const roleData = await getUserRole(email);
        console.log("Role data:", roleData);

        if (!roleData || !roleData.role) {
          router.push('/onboarding/role');
          return;
        }

        if (!roleData.details_complete) {
          router.push('/onboarding/details');
          return;
        }

        if (!roleData.verified) {
          router.push('/onboarding/verify');
          return;
        }

        switch (roleData.role) {
          case 'seller':
            router.push('/seller/dashboard');
            return;
          case 'stylist':
            router.push('/stylist/dashboard');
            return;
          case 'driver':
            router.push('/driver/dashboard');
            return;
          default:
            router.push('/buyer/marketplace');
            return;
        }
      } catch (error) {
        console.error('Error in fetchUserAndRedirect:', error);
        router.push('/welcome');
      }
    };

    fetchUserAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Redirecting...</p>
      </div>
    </div>
  );
}

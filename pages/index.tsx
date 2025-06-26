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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUser(user);

      const email = user.email;
      if (!email) return;
      const roleData = await getUserRole(email);

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
          break;
        case 'stylist':
          router.push('/stylist/dashboard');
          break;
        case 'driver':
          router.push('/driver/dashboard');
          break;
        default:
          router.push('/buyer/marketplace');
      }
    };

    fetchUserAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg font-medium">
      Redirecting...
    </div>
  );
}

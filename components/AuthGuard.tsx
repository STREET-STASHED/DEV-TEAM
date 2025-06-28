

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        router.push('/signup');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role, details_complete, verification_complete')
        .eq('id', user.id)
        .single();

      if (!userData?.role) {
        router.push('/onboarding/role');
        return;
      }

      if (!userData.details_complete) {
        router.push('/onboarding/details');
        return;
      }

      if (!userData.verification_complete) {
        router.push('/onboarding/verify');
        return;
      }

      const role = userData.role;
      if (role === 'buyer') router.push('/buyer/dashboard');
      else if (role === 'seller') router.push('/seller/dashboard');
      else if (role === 'stylist') router.push('/stylist/dashboard');
      else if (role === 'driver') router.push('/driver/dashboard');
    };

    getUser();
  }, [router]);

  if (loading) return null;

  return <>{children}</>;
};

export default AuthGuard;


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getDashboardRedirect } from '@/lib/getDashboardRedirect';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!user || error) {
        router.push('/signup');
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, role, verified, details_complete')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        router.push('/signup');
        return;
      }

      const { role, verified, details_complete } = userProfile;

      if (!role || !verified || !details_complete) {
        router.push('/onboarding/role');
        return;
      }

      router.push(getDashboardRedirect(role.toLowerCase()));
    };

    verifyAndRedirect().finally(() => setLoading(false));
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}
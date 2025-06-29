

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
        console.error('No user or error fetching user:', error);
        router.push('/signup');
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, role, verified, details_complete')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        console.error('Error fetching user profile:', profileError);
        router.push('/signup');
        return;
      }

      const { role, verified, details_complete } = userProfile;

      // If onboarding is not complete, send them to the first step
      if (!role || !details_complete || !verified) {
        router.push('/onboarding/role');
        return;
      }

      // If onboarding is complete, redirect to role-based dashboard
      const dashboardPath = getDashboardRedirect(role?.toLowerCase?.() || '');
      if (!dashboardPath) {
        console.error('Could not determine dashboard redirect for role:', role);
        router.push('/signup');
        return;
      }
      router.push(dashboardPath);
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
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function useOnboardingRedirect() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!router.isReady) return;

    const isOnboardingPage = router.pathname.startsWith('/onboarding');
    if (!isOnboardingPage) return;

    const checkUserOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('role, details_complete, verified')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { role, details_complete, verified } = profile;

      // Logs (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.log('User:', user);
        console.log('Profile:', profile);
        console.log('Routing from:', router.pathname);
      }

      // Onboarding flow logic
      if (!role && router.pathname !== '/onboarding/role') {
        router.replace('/onboarding/role');
      } else if (role && !details_complete && router.pathname !== '/onboarding/details') {
        router.replace('/onboarding/details');
      } else if (role && details_complete && !verified && router.pathname !== '/onboarding/verify') {
        router.replace('/onboarding/verify');
      }
    };

    checkUserOnboarding();
  }, [router]);
}
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const useOnboardingRedirect = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/signup');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role, details_complete, verification_complete, onboarded')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) {
        console.error('Failed to fetch user onboarding status:', error);
        return;
      }

      const { role, details_complete, verification_complete, onboarded } = data;

      if (!role && router.pathname !== '/onboarding/role') {
        router.replace('/onboarding/role');
      } else if (!details_complete && router.pathname !== '/onboarding/details') {
        router.replace('/onboarding/details');
      } else if (!verification_complete && router.pathname !== '/onboarding/verify') {
        router.replace('/onboarding/verify');
      } else if (onboarded) {
        let targetPath = '/';
        switch (role) {
          case 'buyer':
            targetPath = '/buyer';
            break;
          case 'seller':
            targetPath = '/seller/dashboard';
            break;
          case 'stylist':
            targetPath = '/stylist/dashboard';
            break;
          case 'driver':
            targetPath = '/driver';
            break;
          case 'admin':
            targetPath = '/admin/dashboard';
            break;
        }
        if (router.pathname !== targetPath) {
          router.replace(targetPath);
        }
      }
    };

    checkOnboardingStatus();
  }, [router, supabase]);
};

export default useOnboardingRedirect;
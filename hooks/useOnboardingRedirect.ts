import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const useOnboardingRedirect = () => {
  const router = useRouter();

  const redirectUserBasedOnProfile = async () => {
    const supabase = createClientComponentClient();
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

    const { role, details_complete, verification_complete } = data;

    // Enforce strict onboarding flow on all onboarding pages
    if (!role) {
      router.replace('/onboarding/role');
      return;
    }

    if (!details_complete) {
      router.replace('/onboarding/details');
      return;
    }

    if (!verification_complete) {
      router.replace('/onboarding/verify');
      return;
    }

    if (role && details_complete && verification_complete) {
      // Onboarding complete: redirect to dashboard
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

  return { redirectUserBasedOnProfile };
};

export default useOnboardingRedirect;
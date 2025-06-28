import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../lib/useUser'; // assumes a custom user hook or use supabase directly
import supabase from '../lib/supabaseClient';

const useOnboardingRedirect = () => {
  const router = useRouter();
  const { user, loading } = useUser(); // or fetch session manually

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || loading) return;

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

      if (!role) {
        router.replace('/onboarding/role');
      } else if (!details_complete) {
        router.replace('/onboarding/details');
      } else if (!verification_complete) {
        router.replace('/onboarding/verify');
      } else if (onboarded) {
        switch (role) {
          case 'buyer':
            router.replace('/buyer');
            break;
          case 'seller':
            router.replace('/seller/dashboard');
            break;
          case 'stylist':
            router.replace('/stylist/dashboard');
            break;
          case 'driver':
            router.replace('/driver');
            break;
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          default:
            router.replace('/');
        }
      }
    };

    checkOnboardingStatus();
  }, [user, loading, router]);
};

export default useOnboardingRedirect;
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // If no profile or role exists, and user is anonymous, skip onboarding
      if (user.aud === 'anonymous' || error || !profile?.role) {
        // TODO: Once real auth is enabled, restore: router.push('/onboarding');
        router.push('/buyer/marketplace');
        return;
      }

      switch (profile.role) {
        case 'buyer':
          router.push('/buyer/marketplace');
          break;
        case 'seller':
          router.push('/seller/dashboard');
          break;
        case 'stylist':
          router.push('/stylist/dashboard');
          break;
        case 'driver':
          router.push('/driver/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/onboarding');
          break;
      }
    };

    checkUserRole();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4 animate-pulse">
        <img src="/logo.png" alt="StreetStashed Logo" className="w-24 h-24 mx-auto" />
        <p className="text-lg">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
}

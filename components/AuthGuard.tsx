import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Cookies from 'js-cookie';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const protectRoute = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('role, verified, details_complete')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        console.error('AuthGuard error fetching user:', error);
        router.push('/login');
        return;
      }

      const { role, verified, details_complete } = profile;

      // Set cookie for role
      Cookies.set('user-role', role, { expires: 7 });

      const currentPath = router.pathname;

      // Define dashboard path for the role
      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };

      const dashboardPath = redirectMap[role] || '/';

      // If missing role, send to role onboarding
      if (!role && !currentPath.includes('/onboarding/role')) {
        router.push('/onboarding/role');
        return;
      }

      // If role exists but no details
      if (role && !details_complete && !currentPath.includes('/onboarding/details')) {
        router.push('/onboarding/details');
        return;
      }

      // If role + details, but not verified
      if (role && details_complete && !verified && !currentPath.includes('/onboarding/verify')) {
        router.push('/onboarding/verify');
        return;
      }

      // If fully onboarded and still stuck in onboarding flow, send to dashboard
      if (
        role &&
        details_complete &&
        verified &&
        currentPath.startsWith('/onboarding')
      ) {
        router.push(dashboardPath);
        return;
      }

      setLoading(false);
    };

    protectRoute();
  }, [router]);

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return <>{children}</>;
};

export default AuthGuard;
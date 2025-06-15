import { useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;

      if (!role || profileError) {
        router.push('/onboarding');
        return;
      }

      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };

      router.push(redirectMap[role] || '/onboarding');
    };

    checkUserRole();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4 animate-pulse">
        <p className="text-lg">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
}

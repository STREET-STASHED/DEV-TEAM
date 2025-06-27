import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from "@/lib/supabaseBrowserClient";

export default function AuthGuard({ role, children }: { role: string, children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // supabase is already initialized from the import

  useEffect(() => {
    if (router.pathname === '/' || router.pathname === '/welcome') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error('Session error or user not found:', sessionError);
          await router.replace('/welcome');
          return;
        }

        const userId = session.user.id;

        const roleResponse = await fetch(`/api/get-role?id=${userId}`);
        if (!roleResponse.ok) {
          console.error('Error fetching user role:', await roleResponse.text());
          return;
        }

        interface RoleData {
          role: string;
          details_complete: boolean;
          verified: boolean;
        }

        const roleData: RoleData = await roleResponse.json();

        if (!roleData?.role) return router.replace('/onboarding/role');
        if (!roleData.details_complete) return router.replace('/onboarding/details');
        if (!roleData.verified) return router.replace('/onboarding/verify');

        if (roleData.role !== role) {
          console.warn(`Role mismatch. Expected: ${role}, Got: ${roleData.role}`);
          await router.replace('/not-authorized');
          return;
        }

        console.log('Authorized, loading finished');
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in auth guard:', err);
        await router.replace('/welcome');
      }
    };

    const timeout = setTimeout(() => {
      console.warn('AuthGuard timeout reached — ending loading state as fallback.');
      setLoading(false);
    }, 10000); // 10s fallback

    checkAuth();

    return () => clearTimeout(timeout);
  }, [role, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Checking authorization...</p>
      </div>
    );
  }
  return <>{children}</>
}
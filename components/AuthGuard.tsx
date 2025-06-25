import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'

export default function AuthGuard({ role, children }: { role: string, children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session?.user) {
          console.error('Session error or user not found:', sessionError);
          return router.push('/onboarding/details');
        }

        const userId = sessionData.session.user.id;

        const roleResponse = await fetch(`/api/get-role?id=${userId}`);
        if (!roleResponse.ok) {
          console.error('Error fetching user role:', await roleResponse.text());
          return router.push('/error');
        }

        const roleData = await roleResponse.json();

        if (!roleData.details_complete) {
          return router.push('/onboarding/details');
        }

        if (!roleData.role) {
          return router.push('/onboarding/role');
        }

        if (!roleData.verification_complete) {
          return router.push('/onboarding/verify');
        }

        if (roleData.role !== role) {
          console.warn(`Role mismatch. Expected: ${role}, Got: ${roleData.role}`);
          return router.push('/not-authorized');
        }

        if (
          roleData.details_complete &&
          roleData.role &&
          roleData.verification_complete &&
          roleData.role === role
        ) {
          // All checks passed, let the user proceed
          setLoading(false);
        } else {
          console.warn("Unhandled onboarding state");
          router.push('/onboarding/details');
        }
      } catch (err) {
        console.error('Unexpected error in auth guard:', err);
        router.push('/onboarding/details');
      }
    };

    checkAuth();
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
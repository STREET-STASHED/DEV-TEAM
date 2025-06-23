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
          return router.push('/onboarding');
        }

        const userId = sessionData.session.user.id;

        const roleResponse = await fetch(`/api/get-role?id=${userId}`);
        if (!roleResponse.ok) {
          console.error('Error fetching user role:', await roleResponse.text());
          return router.push('/error');
        }

        const roleData = await roleResponse.json();
        if (roleData.role !== role) {
          console.warn(`Role mismatch. Expected: ${role}, Got: ${roleData.role}`);
          return router.push('/not-authorized');
        }

        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in auth guard:', err);
        router.push('/onboarding');
      }
    };

    checkAuth();
  }, [role, router]);

  if (loading) return <p className="p-6">Checking auth...</p>
  return <>{children}</>
}
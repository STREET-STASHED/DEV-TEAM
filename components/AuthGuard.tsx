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
          return router.push('/login');
        }

        const userId = sessionData.session.user.id;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          console.error('Error fetching user role:', userError?.message);
          return router.push('/error');
        }

        if (userData.role !== role) {
          console.warn(`Role mismatch. Expected: ${role}, Got: ${userData.role}`);
          return router.push('/not-authorized');
        }

        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in auth guard:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [role, router]);

  if (loading) return <p className="p-6">Checking auth...</p>
  return <>{children}</>
}
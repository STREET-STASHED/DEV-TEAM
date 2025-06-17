import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'

export default function AuthGuard({ role, children }: { role: string, children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No session or session error:', sessionError);
        return router.push('/login');
      }

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError.message);
        return router.push('/error');
      }

      if (userData?.role !== role) {
        console.warn(`Role mismatch. Expected: ${role}, Got: ${userData?.role}`);
        return router.push('/not-authorized');
      }

      setLoading(false);
    };

    checkAuth();
  }, [role, router]);

  if (loading) return <p className="p-6">Checking auth...</p>
  return <>{children}</>
}
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
        return router.push('/login');
      }

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError || userData?.role !== role) {
        return router.push('/');
      }

      setLoading(false);
    };

    checkAuth();
  }, [role, router]);

  if (loading) return <p className="p-6">Checking auth...</p>
  return <>{children}</>
}
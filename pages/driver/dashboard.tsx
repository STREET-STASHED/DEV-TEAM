import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import AuthGuard from '@/components/AuthGuard';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setRole(profile?.role || null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <AuthGuard role="driver">
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl mb-4">Dashboard</h1>
        {user ? (
          <>
            <p>Welcome, <strong>{user.email}</strong>!</p>
            <p>Your role: <strong>{role}</strong></p>
          </>
        ) : (
          <p>Unable to load user data.</p>
        )}
      </div>
    </AuthGuard>
  );
};

export default Dashboard;

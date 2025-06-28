import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';

const Dashboard: FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user?.id) {
        console.error('Error retrieving authenticated user:', authError);
        setError('Error retrieving authenticated user.');
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role, has_completed_onboarding')
        .eq('id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        setError('Error fetching user role.');
        setRole(null);
      } else {
        if (userData && userData.has_completed_onboarding === false) {
          router.push('/onboarding/verify');
          return;
        }

        const roleRedirectMap: Record<string, string> = {
          seller: '/seller/dashboard',
          buyer: '/buyer/dashboard',
          stylist: '/stylist/dashboard',
          driver: '/driver/dashboard',
        };

        if (userData?.role && roleRedirectMap[userData.role]) {
          router.push(roleRedirectMap[userData.role]);
          return;
        }

        setRole(userData?.role || null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading || !userId || !role) return <p>Loading dashboard...</p>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <AuthGuard role={role || ''}>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-gray-600">Role: {role}</p>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
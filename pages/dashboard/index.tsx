import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

const Dashboard: FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user?.id) {
          console.error('Error retrieving authenticated user:', authError);
          setError('Authentication error. Please try logging in again.');
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role, has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (roleError || !userData) {
          console.error('Error fetching user data:', roleError);
          setError('Unable to retrieve user data.');
          setLoading(false);
          return;
        }

        if (userData.has_completed_onboarding === false) {
          router.push('/onboarding/verify');
          return;
        }

        const roleRedirectMap: Record<string, string> = {
          seller: '/seller/dashboard',
          buyer: '/buyer/dashboard',
          stylist: '/stylist/dashboard',
          driver: '/driver/dashboard',
        };

        if (userData.role && roleRedirectMap[userData.role]) {
          router.push(roleRedirectMap[userData.role]);
          return;
        } else {
          setError('Unrecognized user role. Please contact support.');
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return null;
};

export default Dashboard;
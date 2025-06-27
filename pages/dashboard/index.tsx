import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseBrowserClient';
import AuthGuard from '@/components/AuthGuard';
import SellerDashboard from '../seller/dashboard';
import BuyerDashboard from '../buyer/dashboard';
import StylistDashboard from '../stylist/dashboard';
import DriverDashboard from '../driver/dashboard';

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
        setRole(userData?.role || null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!userId) return <p>Loading dashboard...</p>;

  return (
    <AuthGuard role={role || ''}>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-gray-600">Role: {role}</p>

        {(() => {
          switch (role) {
            case 'seller':
              return <SellerDashboard userId={userId} />;
            case 'buyer':
              return <BuyerDashboard userId={userId} />;
            case 'stylist':
              return <StylistDashboard userId={userId} />;
            case 'driver':
              return <DriverDashboard userId={userId} />;
            default:
              return (
                <div className="bg-red-100 p-4 rounded text-red-800">
                  Your role is not recognized. Please contact support.
                </div>
              );
          }
        })()}
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
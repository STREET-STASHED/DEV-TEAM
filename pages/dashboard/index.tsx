import { useEffect, useState, type FC } from 'react';
import supabase from '../../lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import SellerDashboard from '../seller/dashboard';
import BuyerDashboard from '../buyer/dashboard';
import StylistDashboard from '../stylist/dashboard';
import DriverDashboard from '../driver/dashboard';

interface DashboardProps {
  userId: string;
}

const Dashboard: FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        console.error('No user found in auth session.');
      }

      if (user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (error) {
          console.error('Error fetching role:', error);
        }
        setRole(userData?.role || null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <AuthGuard role="admin">
      <div className="p-6 space-y-4">
        {user ? (
          <>
            <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
            <p className="text-gray-600">Role: {role}</p>

            {role === 'seller' && <SellerDashboard userId={user.id} />}
            {role === 'buyer' && <BuyerDashboard userId={user.id} />}
            {role === 'stylist' && <StylistDashboard userId={user.id} />}
            {role === 'driver' && <DriverDashboard userId={user.id} />}

            {!['seller', 'buyer', 'stylist', 'driver'].includes(role || '') && (
              <div className="bg-red-100 p-4 rounded text-red-800">
                Your role is not recognized. Please contact support.
              </div>
            )}
          </>
        ) : (
          <p>Unable to load user data.</p>
        )}
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
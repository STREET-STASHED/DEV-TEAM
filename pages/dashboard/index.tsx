import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import SellerDashboard from '../seller/dashboard';
import BuyerDashboard from '../buyer/dashboard';
import StylistDashboard from '../stylist/dashboard';
import DriverDashboard from '../driver/dashboard';

const Dashboard: FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user?.id) {
        console.error('Error retrieving authenticated user:', authError);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        setRole(null);
      } else {
        setRole(userData?.role || null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading || !userId) return <p>Loading dashboard...</p>;

  return (
    <AuthGuard role="admin">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-gray-600">Role: {role}</p>

        {role === 'seller' && <SellerDashboard userId={userId} />}
        {role === 'buyer' && <BuyerDashboard userId={userId} />}
        {role === 'stylist' && <StylistDashboard userId={userId} />}
        {role === 'driver' && <DriverDashboard userId={userId} />}

        {!['seller', 'buyer', 'stylist', 'driver'].includes(role || '') && (
          <div className="bg-red-100 p-4 rounded text-red-800">
            Your role is not recognized. Please contact support.
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
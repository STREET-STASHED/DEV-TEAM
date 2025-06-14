import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import AuthGuard from '@/components/AuthGuard';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <AuthGuard role="admin">
      <div className="p-6">
        {user ? (
          <>
            <h1 className="text-xl font-bold mb-2">Welcome to your Dashboard</h1>
            {role === 'seller' && (
              <p>Manage your products, track orders, and view performance analytics.</p>
            )}
            {role === 'buyer' && (
              <p>View your order history, track deliveries, and update your profile.</p>
            )}
            {role === 'stylist' && (
              <p>Manage your bookings, offer new style bundles, and connect with clients.</p>
            )}
            {role === 'driver' && (
              <p>View available deliveries, track completed orders, and manage payout info.</p>
            )}
            {!['seller', 'buyer', 'stylist', 'driver'].includes(role || '') && (
              <p>Your role is not recognized. Please contact support.</p>
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
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
      <div className="p-6 space-y-4">
        {user ? (
          <>
            <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
            <p className="text-gray-600">Role: {role}</p>

            {role === 'seller' && (
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-semibold text-lg mb-2">Seller Tools</h2>
                <ul className="list-disc pl-5">
                  <li>Upload and manage products</li>
                  <li>View and fulfill orders</li>
                  <li>Check sales analytics</li>
                </ul>
              </div>
            )}

            {role === 'buyer' && (
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-semibold text-lg mb-2">Buyer Dashboard</h2>
                <ul className="list-disc pl-5">
                  <li>Track orders and deliveries</li>
                  <li>Manage payment methods</li>
                  <li>Update personal profile</li>
                </ul>
              </div>
            )}

            {role === 'stylist' && (
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-semibold text-lg mb-2">Stylist Panel</h2>
                <ul className="list-disc pl-5">
                  <li>View and manage bookings</li>
                  <li>Create and update style bundles</li>
                  <li>Message clients</li>
                </ul>
              </div>
            )}

            {role === 'driver' && (
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-semibold text-lg mb-2">Driver Operations</h2>
                <ul className="list-disc pl-5">
                  <li>Accept and complete deliveries</li>
                  <li>View assigned delivery routes</li>
                  <li>Manage payout details</li>
                </ul>
              </div>
            )}

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
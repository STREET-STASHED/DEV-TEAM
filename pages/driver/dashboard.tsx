import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import AuthGuard from '@/components/AuthGuard';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error.message);
        }

        setRole(userData?.role || null);

        const { data: deliveryData, error: deliveryError } = await supabase
          .from('deliveries')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });

        if (deliveryError) console.error('Error fetching deliveries:', deliveryError);
        else {
          setDeliveries(deliveryData);
          const total = deliveryData
            .filter(d => d.status === 'delivered')
            .reduce((sum, d) => sum + (d.earnings || 0), 0);
          setEarnings(total);
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const markAsDelivered = async (deliveryId: string) => {
    const { error } = await supabase
      .from('deliveries')
      .update({ status: 'delivered' })
      .eq('id', deliveryId);

    if (error) {
      console.error('Error marking as delivered:', error.message);
    } else {
      setDeliveries(prev =>
        prev.map(d => d.id === deliveryId ? { ...d, status: 'delivered' } : d)
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <AuthGuard role="driver">
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Driver Dashboard</h1>
        <button
          className="mb-4 bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium mb-4">Your Deliveries</h2>
          <ul className="space-y-4">
            {deliveries.length === 0 ? (
              <p className="text-gray-500 text-sm">No deliveries assigned yet.</p>
            ) : (
              deliveries.map((delivery) => (
                <li key={delivery.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Order #{delivery.id}</p>
                    <p className="text-sm text-gray-600">Pickup: {delivery.pickup_location}</p>
                    <p className="text-sm text-gray-600">Dropoff: {delivery.dropoff_location}</p>
                    <p className="text-sm text-gray-500">Status: {delivery.status}</p>
                    <p className="text-sm text-gray-400">Created: {new Date(delivery.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={delivery.status === 'delivered'}
                    onClick={() => markAsDelivered(delivery.id)}
                  >
                    {delivery.status === 'delivered' ? 'Delivered' : 'Mark as Delivered'}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium mb-4">Earnings Summary</h2>
          <p className="text-lg">Today's Earnings: <span className="font-semibold">${earnings.toFixed(2)}</span></p>
          <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;

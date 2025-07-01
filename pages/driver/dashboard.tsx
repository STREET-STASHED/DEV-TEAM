import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Placeholder components and API function
const DeliveryList = ({ deliveries }: { deliveries: any[] }) => <div>Delivery List Placeholder</div>;
const EarningsChart = ({ earnings }: { earnings: any[] }) => <div>Earnings Chart Placeholder</div>;
const RouteMap = ({ route }: { route: any }) => <div>Route Map Placeholder</div>;
const fetchDriverData = async () => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('Failed to load user');

  const { data: deliveries, error: deliveryError } = await supabase
    .from('deliveries')
    .select('*')
    .eq('driver_id', user.id);

  const { data: earnings, error: earningsError } = await supabase
    .from('earnings')
    .select('*')
    .eq('driver_id', user.id);

  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('driver_id', user.id)
    .single();

  if (deliveryError || earningsError || routeError) {
    throw new Error('Failed to fetch driver data');
  }

  return { deliveries, earnings, route };
};

const DriverDashboard = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [route, setRoute] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        setLoading(true);
        const data = await fetchDriverData();
        setDeliveries(data.deliveries);
        setEarnings(data.earnings);
        setRoute(data.route);
      } catch (err) {
        setError('Failed to load driver data.');
      } finally {
        setLoading(false);
      }
    };

    loadDriverData();
  }, []);

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      <DeliveryList deliveries={deliveries} />
      <EarningsChart earnings={earnings} />
      <RouteMap route={route} />
    </div>
  );
};

export default DriverDashboard;

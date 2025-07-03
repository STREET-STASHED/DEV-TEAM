// File: /pages/driver/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';


const DeliveryList = ({ deliveries }: { deliveries: any[] }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Deliveries</h2>
    <ul className="list-disc list-inside">
      {deliveries.length > 0 ? deliveries.map((delivery, idx) => (
        <li key={idx}>
          {delivery.package_id} - {delivery.status} - {new Date(delivery.created_at).toLocaleDateString()}
        </li>
      )) : <li>No deliveries found.</li>}
    </ul>
  </div>
);

const EarningsChart = ({ earnings }: { earnings: any[] }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Earnings</h2>
    <ul className="list-disc list-inside">
      {earnings.length > 0 ? earnings.map((entry, idx) => (
        <li key={idx}>${entry.amount} on {new Date(entry.date).toLocaleDateString()}</li>
      )) : <li>No earnings data available.</li>}
    </ul>
  </div>
);

const DriverRatings = ({ ratings }: { ratings: any }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Driver Rating</h2>
    {ratings ? (
      <p>Average Rating: {ratings.average_rating} ({ratings.total_reviews} reviews)</p>
    ) : (
      <p>No ratings yet.</p>
    )}
  </div>
);

const fetchDriverData = async () => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('Failed to load user');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, details_complete, has_completed_onboarding, verification_complete')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'driver') {
    throw new Error('Access denied: Not a driver or profile not found.');
  }

  const { data: deliveries, error: deliveriesError } = await supabase
    .from('deliveries')
    .select('*')
    .eq('driver_id', user.id);

  const { data: earnings, error: earningsError } = await supabase
    .from('driver_earnings')
    .select('*')
    .eq('driver_id', user.id);

  const { data: ratings, error: ratingsError } = await supabase
    .from('driver_ratings')
    .select('*')
    .eq('driver_id', user.id)
    .single();

  if (deliveriesError || earningsError || ratingsError) {
    throw new Error('Failed to fetch driver data');
  }

  return { deliveries, earnings, ratings };
};

const DriverDashboard = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        setLoading(true);
        const data = await fetchDriverData();
        setDeliveries(data.deliveries);
        setEarnings(data.earnings);
        setRatings(data.ratings);
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
      <DriverRatings ratings={ratings} />
    </div>
  );
};

export default DriverDashboard;

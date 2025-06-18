import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';

interface DriverDashboardProps {
  userId: string;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ userId }) => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<number>(0);
  const [pastDeliveries, setPastDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const fetchDriverData = async () => {
      // Fetch upcoming deliveries
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', userId)
        .order('scheduled_time', { ascending: true });

      if (!deliveryError && deliveryData) {
        setDeliveries(deliveryData);
      }

      // Fetch earnings summary
      const { data: earningsData, error: earningsError } = await supabase
        .from('payouts')
        .select('amount')
        .eq('driver_id', userId);

      if (!earningsError && earningsData) {
        const total = earningsData.reduce((sum, row) => sum + row.amount, 0);
        setEarnings(total);
      }

      // Fetch past deliveries
      const { data: pastData, error: pastError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', userId)
        .lt('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: false });

      if (!pastError && pastData) {
        setPastDeliveries(pastData);
      }
    };

    if (userId) {
      fetchDriverData();
    }
  }, [userId]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Driver Dashboard</h1>
      <p><strong>User ID:</strong> {userId}</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>Upcoming Deliveries</h2>
        {deliveries.length > 0 ? (
          <ul>
            {deliveries.map((delivery, index) => (
              <li key={index}>
                {delivery.destination} - {new Date(delivery.scheduled_time).toLocaleString()} - Status: {delivery.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No deliveries assigned yet.</p>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Earnings Summary</h2>
        <p>${earnings.toFixed(2)} earned this week</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Past Deliveries</h2>
        {pastDeliveries.length > 0 ? (
          <ul>
            {pastDeliveries.map((delivery, index) => (
              <li key={index}>
                {delivery.destination} - {new Date(delivery.scheduled_time).toLocaleString()} - Status: {delivery.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No past deliveries.</p>
        )}
      </section>
    </div>
  );
};

export default DriverDashboard;

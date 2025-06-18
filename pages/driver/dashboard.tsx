import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';

const DriverDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<number>(0);
  const [pastDeliveries, setPastDeliveries] = useState<any[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);

  const fetchDriverData = async (userId: string) => {
    const { data: deliveryData, error: deliveryError } = await supabase
      .from('deliveries')
      .select('id, destination, pickup_location, scheduled_time, status, pay_estimate')
      .eq('driver_id', userId)
      .order('scheduled_time', { ascending: true });

    if (!deliveryError && deliveryData) {
      setDeliveries(deliveryData);
    }

    const { data: earningsData, error: earningsError } = await supabase
      .from('payouts')
      .select('amount')
      .eq('driver_id', userId);

    if (!earningsError && earningsData) {
      const total = earningsData.reduce((sum, row) => sum + row.amount, 0);
      setEarnings(total);
    }

    const { data: pastData, error: pastError } = await supabase
      .from('deliveries')
      .select('id, destination, pickup_location, scheduled_time, status, pay_estimate')
      .eq('driver_id', userId)
      .lt('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: false });

    if (!pastError && pastData) {
      setPastDeliveries(pastData);
    }

    const { data: availableData, error: availableError } = await supabase
      .from('deliveries')
      .select('id, destination, pickup_location, scheduled_time, status, pay_estimate')
      .is('driver_id', null)
      .gt('scheduled_time', new Date().toISOString());

    if (!availableError && availableData) {
      setAvailableDeliveries(availableData);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDriverData(user.id);
    }
  }, [user]);

  const handleAcceptDelivery = async (deliveryId: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('deliveries')
      .update({ driver_id: user.id })
      .eq('id', deliveryId);

    if (!error) {
      // Re-fetch data to update UI
      fetchDriverData(user.id);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Driver Dashboard</h1>
      {user && <p><strong>User ID:</strong> {user.id}</p>}

      <section style={{ marginTop: '2rem' }}>
        <h2>Available Deliveries</h2>
        {availableDeliveries.length > 0 ? (
          <ul>
            {availableDeliveries.map((delivery, index) => (
              <li key={index}>
                <div>
                  <strong>Pickup:</strong> {delivery.pickup_location} <br />
                  <strong>Dropoff:</strong> {delivery.destination} <br />
                  <strong>Scheduled:</strong> {new Date(delivery.scheduled_time).toLocaleString()} <br />
                  <strong>Pay:</strong> ${delivery.pay_estimate?.toFixed(2) ?? 'N/A'}
                </div>
                <button style={{ marginLeft: '1rem' }} onClick={() => handleAcceptDelivery(delivery.id)}>
                  Accept
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No available deliveries at the moment.</p>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Upcoming Deliveries</h2>
        {deliveries.length > 0 ? (
          <ul>
            {deliveries.map((delivery, index) => (
              <li key={index}>
                <div>
                  <strong>Pickup:</strong> {delivery.pickup_location} <br />
                  <strong>Dropoff:</strong> {delivery.destination} <br />
                  <strong>Scheduled:</strong> {new Date(delivery.scheduled_time).toLocaleString()} <br />
                  <strong>Status:</strong> {delivery.status}
                </div>
                <div>
                  <button
                    style={{ marginRight: '1rem' }}
                    onClick={async () => {
                      const { error } = await supabase
                        .from('deliveries')
                        .update({ status: 'picked_up' })
                        .eq('id', delivery.id);
                      if (!error && user?.id) fetchDriverData(user.id);
                    }}
                    disabled={delivery.status !== 'scheduled'}
                  >
                    Mark as Picked Up
                  </button>
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from('deliveries')
                        .update({ status: 'delivered' })
                        .eq('id', delivery.id);
                      if (!error && user?.id) fetchDriverData(user.id);
                    }}
                    disabled={delivery.status !== 'picked_up'}
                  >
                    Mark as Delivered
                  </button>
                </div>
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
                <div>
                  <strong>Pickup:</strong> {delivery.pickup_location} <br />
                  <strong>Dropoff:</strong> {delivery.destination} <br />
                  <strong>Scheduled:</strong> {new Date(delivery.scheduled_time).toLocaleString()} <br />
                  <strong>Status:</strong> {delivery.status}
                </div>
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

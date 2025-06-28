import { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';

interface Delivery {
  id: string;
  order_id: string;
  driver_id: string;
  status: string;
  destination: string;
  pickup_location: string;
  scheduled_time: string;
  pay_estimate?: number;
}

const DriverDashboard = ({ userId }: { userId: string }) => {
  const [assignedDeliveries, setAssignedDeliveries] = useState<Delivery[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [pastDeliveries, setPastDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    const fetchDriverData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.id) return;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('has_completed_onboarding')
        .eq('id', user.id)
        .single();

      if (!userData?.has_completed_onboarding) {
        window.location.href = '/onboarding/details';
        return;
      }

      const commonFields = 'id, order_id, driver_id, status, destination, pickup_location, scheduled_time, pay_estimate';

      const { data: assigned } = await supabase
        .from('deliveries')
        .select(commonFields)
        .eq('driver_id', user.id)
        .in('status', ['assigned', 'accepted'])
        .order('scheduled_time', { ascending: true })
        .returns<Delivery[]>();

      const { data: available } = await supabase
        .from('deliveries')
        .select(commonFields)
        .is('driver_id', null)
        .eq('status', 'open')
        .order('scheduled_time', { ascending: true })
        .returns<Delivery[]>();

      const { data: past } = await supabase
        .from('deliveries')
        .select(commonFields)
        .eq('driver_id', user.id)
        .eq('status', 'completed')
        .order('scheduled_time', { ascending: false })
        .returns<Delivery[]>();

      if (assigned) setAssignedDeliveries(assigned);
      if (available) setAvailableDeliveries(available);
      if (past) setPastDeliveries(past);
    };

    fetchDriverData();
  }, []);

  return (
    <div>
      <h1>Driver Dashboard</h1>
      <p>User ID: {userId}</p>

      <section>
        <h2>Assigned Deliveries</h2>
        {assignedDeliveries.length > 0 ? (
          <ul>
            {assignedDeliveries.map(delivery => (
              <li key={delivery.id}>
                Order ID: {delivery.order_id} | Destination: {delivery.destination} | Pickup: {delivery.pickup_location}
              </li>
            ))}
          </ul>
        ) : (
          <p>No assigned deliveries.</p>
        )}
      </section>

      <section>
        <h2>Available Deliveries</h2>
        {availableDeliveries.length > 0 ? (
          <ul>
            {availableDeliveries.map(delivery => (
              <li key={delivery.id}>
                Order ID: {delivery.order_id} | Destination: {delivery.destination} | Pickup: {delivery.pickup_location}
              </li>
            ))}
          </ul>
        ) : (
          <p>No available deliveries.</p>
        )}
      </section>

      <section>
        <h2>Past Deliveries</h2>
        {pastDeliveries.length > 0 ? (
          <ul>
            {pastDeliveries.map(delivery => (
              <li key={delivery.id}>
                Order ID: {delivery.order_id} | Destination: {delivery.destination} | Pickup: {delivery.pickup_location}
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

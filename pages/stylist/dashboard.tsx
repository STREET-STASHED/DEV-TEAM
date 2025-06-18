import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import AuthGuard from '@/components/AuthGuard';

interface StylistDashboardProps {
  userId: string;
}

interface Booking {
  id: string;
  client_name: string;
  date: string;
  status: string;
  event_type: string;
  outfit_request: string;
}

const StylistDashboard: React.FC<StylistDashboardProps> = ({ userId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // If userId is not passed, fetch it from Supabase auth
  useEffect(() => {
    const fetchUserId = async () => {
      if (!userId) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      }
    };
    fetchUserId();
  }, []);

  const [localUserId, setUserId] = useState(userId);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!localUserId) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('id, client_name, date, status, event_type, outfit_request')
        .eq('stylist_id', localUserId);

      if (error) {
        console.error('Error fetching bookings:', error.message);
      } else {
        setBookings(
          (data || []).map((booking: any) => ({
            id: booking.id,
            client_name: booking.client_name || 'N/A',
            date: booking.date || '',
            status: booking.status || 'pending',
            event_type: booking.event_type || 'Unknown',
            outfit_request: booking.outfit_request || 'None',
          }))
        );
      }
      setLoading(false);
    };

    fetchBookings();
  }, [localUserId]);

  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Failed to update booking status:', error.message);
      return;
    }

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <AuthGuard role="stylist">
      <div>
        <h1>Stylist Dashboard</h1>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id}>
                <p><strong>Client:</strong> {booking.client_name}</p>
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Event:</strong> {booking.event_type}</p>
                <p><strong>Request:</strong> {booking.outfit_request}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <button onClick={() => updateStatus(booking.id, 'accepted')}>Accept</button>
                <button onClick={() => updateStatus(booking.id, 'declined')}>Decline</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
};

export default StylistDashboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId: session.user.id,
    },
  };
};
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

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const Spinner = () => (
  <div role="status" aria-live="polite" style={{ padding: '1rem', textAlign: 'center' }}>
    <svg
      aria-hidden="true"
      className="animate-spin h-8 w-8 text-gray-600 mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

const StylistDashboard: React.FC<StylistDashboardProps> = ({ userId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Use userId from props directly; no need for separate localUserId state or fetching
  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('id, client_name, date, status, event_type, outfit_request')
        .eq('stylist_id', userId);

      if (error) {
        console.error('Error fetching bookings:', error.message);
        setBookings([]);
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
  }, [userId]);

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

  if (loading) return <Spinner />;

  return (
    <AuthGuard role="stylist">
      <div>
        <h1>Stylist Dashboard</h1>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id} style={{ marginBottom: '1.5rem' }}>
                <p><strong>Client:</strong> {booking.client_name}</p>
                <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                <p><strong>Event:</strong> {booking.event_type}</p>
                <p><strong>Request:</strong> {booking.outfit_request}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(booking.id, 'accepted')}
                      aria-label={`Accept booking for ${booking.client_name}`}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, 'declined')}
                      aria-label={`Decline booking for ${booking.client_name}`}
                    >
                      Decline
                    </button>
                  </>
                )}
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
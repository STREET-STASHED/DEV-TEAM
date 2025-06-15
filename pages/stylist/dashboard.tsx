import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import AuthGuard from '@/components/AuthGuard';
import React from 'react'

const StylistDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  const fetchBookings = async () => {
    const session = await supabase.auth.getSession()
    console.log('Session:', session)
    const stylist_id = session.data?.session?.user?.id

    if (!stylist_id) return

    const { data, error } = await supabase
      .from('bookings')
      .select('*, orders(*)') // Join related orders if exists
      .eq('stylist_id', stylist_id)

    if (!error) setBookings(data || [])
  }

  // Role guard: Ensure only authenticated stylists can access
  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }

      const { data: profileData } = await supabase
        .from('users')
        .select('role, avatar_url')
        .eq('id', currentUser.id)
        .single();

      setProfile(profileData);

      if (profileData?.role !== 'stylist') {
        window.location.href = '/unauthorized';
      }
    };

    checkRole();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (!error) fetchBookings();
  };

  useEffect(() => {
    fetchBookings()
  }, [])

  return (
    <AuthGuard role="stylist">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <img
            src={profile?.avatar_url || '/default-avatar.png'}
            alt="Profile"
            className="w-16 h-16 rounded-full border border-yellow-400"
          />
          <h1 className="text-xl sm:text-2xl font-bold">StreetStashed Stylist Suite</h1>
        </div>
        <h2 className="text-xl font-semibold">Incoming Bookings</h2>
        <button
          onClick={fetchBookings}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Reload Bookings
        </button>

        {bookings.length === 0 && (
          <p className="text-gray-500 italic">You have no upcoming bookings. They’ll appear here once confirmed.</p>
        )}

        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
          >
            <div className="flex-1">
              <p><strong>Client:</strong> {booking.client_name}</p>
              <p><strong>Event:</strong> {booking.event_type}</p>
              <p><strong>Budget:</strong> ${booking.budget}</p>
              <p><strong>Status:</strong> {booking.status || 'Pending'}</p>
              <p><strong>Time:</strong> {new Date(booking.time).toLocaleString()}</p>
              <p><strong>Notes:</strong> {booking.notes || '—'}</p>
              {booking.orders && (
                <div className="mt-2 text-sm text-gray-700">
                  <p><strong>Linked Order:</strong></p>
                  <p>Order ID: {booking.orders.id}</p>
                  <p>Order Total: ${booking.orders.order_total}</p>
                  <p>Status: {booking.orders.status}</p>
                </div>
              )}
              {booking.orders && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    {['Pending', 'Packed', 'Ready', 'Picked', 'Delivered'].map((step) => (
                      <span key={step}>{step}</span>
                    ))}
                  </div>
                  <div className="flex h-2 rounded overflow-hidden bg-gray-200 mt-1">
                    {['pending', 'packed', 'ready', 'picked_up', 'delivered'].map((statusKey, index) => (
                      <div
                        key={statusKey}
                        className={`flex-1 transition-all duration-300 ${
                          getProgressIndex(booking.orders.status) >= index ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Booked on: {new Date(booking.created_at).toLocaleString()}
              </p>
            </div>
            {booking.status === 'Pending' && (
              <div className="sm:w-48 flex flex-col gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => updateStatus(booking.id, 'Accepted')}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(booking.id, 'Rejected')}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AuthGuard>
  )
}

export default StylistDashboard

// Returns the index of the status in the order progress steps
function getProgressIndex(status: string): number {
  const steps = ['pending', 'packed', 'ready', 'picked_up', 'delivered'];
  return steps.indexOf(status);
}
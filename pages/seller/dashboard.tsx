import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';

interface SellerDashboardProps {
  userId: string;
}

// Progress helper for order status
const getProgress = (status: string) => {
  switch (status) {
    case 'pending': return 20;
    case 'packed': return 40;
    case 'ready_for_pickup': return 60;
    case 'picked_up': return 80;
    case 'delivered': return 100;
    default: return 0;
  }
};

const SellerDashboard: React.FC<SellerDashboardProps> = ({ userId }) => {
  const [services, setServices] = useState<Array<Record<string, any>>>([])
  const [bookings, setBookings] = useState<Array<Record<string, any>>>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalServices: 0,
    totalBookings: 0,
    statusCounts: {
      pending: 0,
      packed: 0,
      ready_for_pickup: 0,
      picked_up: 0,
      delivered: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const session = await supabase.auth.getSession().then(r => r.data.session);
      const currentUser = session?.user;
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', currentUser.id)
        .single();
      if (user?.role !== 'seller') {
        window.location.href = '/unauthorized';
      }
    };

    const fetchServices = async () => {
      const seller_id = userId;
      if (!seller_id) return;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller_id)
      if (!error) {
        setServices(data || []);
        setAnalytics(prev => ({ ...prev, totalServices: (data || []).length }));
      }
    };

    const fetchBookings = async () => {
      const seller_id = userId;
      if (!seller_id) return;
      const { data, error } = await supabase
        .from('bookings')
        .select('id, status, service_name, service_id, created_at')
        .eq('seller_id', seller_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch bookings:', error.message);
        return;
      }

      if (Array.isArray(data)) {
        setBookings(data);
        const statusCounts = {
          pending: 0,
          packed: 0,
          ready_for_pickup: 0,
          picked_up: 0,
          delivered: 0
        };
        type BookingStatus = 'pending' | 'packed' | 'ready_for_pickup' | 'picked_up' | 'delivered';
        data.forEach((booking) => {
          const status = (booking as { status?: string }).status;
          if (status && typeof status === 'string' && statusCounts.hasOwnProperty(status)) {
            statusCounts[status as BookingStatus]++;
          }
        });
        setAnalytics(prev => ({
          ...prev,
          totalBookings: data.length,
          statusCounts
        }));
      }
    };

    const init = async () => {
      await checkRole();
      await fetchServices();
      await fetchBookings();
      setLoading(false);

      // Setup real-time subscriptions
      const seller_id = userId;
      if (!seller_id) return;
      const serviceSubscription = supabase
        .channel('products_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products', filter: `seller_id=eq.${seller_id}` },
          payload => {
            fetchServices();
          }
        )
        .subscribe();
      const bookingSubscription = supabase
        .channel('bookings_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `seller_id=eq.${seller_id}` },
          payload => {
            fetchBookings();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(serviceSubscription);
        supabase.removeChannel(bookingSubscription);
      };
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update booking status handler
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
    if (error) {
      console.error('Failed to update booking status:', error.message);
      return;
    }
    // fetchBookings(); // Not needed because of real-time subscription
  };

  if (loading) return <div className="p-8 text-center">Loading seller dashboard...</div>;

  const profileImg = typeof window !== 'undefined' 
    ? sessionStorage.getItem('profile_image') || '/default-avatar.png'
    : '/default-avatar.png';

  return (
    <AuthGuard role="seller">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold">Seller Analytics</h2>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-gray-100 p-4 rounded shadow">
            <p><strong>Total Services:</strong> {analytics.totalServices}</p>
            <p><strong>Total Bookings:</strong> {analytics.totalBookings}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p><strong>Booking Status Counts:</strong></p>
            <ul className="list-disc list-inside">
              <li>Pending: {analytics.statusCounts.pending}</li>
              <li>Packed: {analytics.statusCounts.packed}</li>
              <li>Ready: {analytics.statusCounts.ready_for_pickup}</li>
              <li>Picked Up: {analytics.statusCounts.picked_up}</li>
              <li>Delivered: {analytics.statusCounts.delivered}</li>
            </ul>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">StreetStashed Seller Dashboard</h1>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Reload My Services
        </button>
        <h2 className="text-xl font-semibold">Seller Profile</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Profile Image:</p>
          <img
            src={profileImg}
            alt="Current profile"
            className="w-24 h-24 rounded-full border mt-2"
          />
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fileInput = (e.target as HTMLFormElement).elements.namedItem('avatar') as HTMLInputElement;
            const file = fileInput.files?.[0];
            if (!file) return;
            try {
              const session = await supabase.auth.getSession().then(r => r.data.session);
              const userId = session?.user.id;
              if (!userId) {
                alert("User not found. Please log in again.");
                return;
              }
              // Try uploading to avatars bucket
              const { data, error } = await supabase.storage
                .from('avatars')
                .upload(`users/${userId}/profile.png`, file, { upsert: true });
              if (!error) {
                const publicURL = supabase.storage
                  .from('avatars')
                  .getPublicUrl(`users/${userId}/profile.png`).data.publicUrl;
                // Update avatar_url in users table
                await supabase.from('users')
                  .update({ avatar_url: publicURL } as any)
                  .eq('id', userId);
                sessionStorage.setItem('profile_image', publicURL);
                alert("Profile image updated!");
              } else {
                console.error(error.message);
                alert("Failed to upload image.");
              }
            } catch (err: any) {
              console.error("Error uploading avatar:", err.message || err);
              alert("Error uploading profile image. Please try again later.");
            }
          }}
          className="space-y-4 mb-6"
        >
          <input type="file" name="avatar" accept="image/*" className="border p-2 w-full rounded" required />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">Upload Profile Image</button>
        </form>
        <h2 className="text-xl font-semibold">Upload New Product/Bundle</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const service_name = (form.elements.namedItem('service_name') as HTMLInputElement).value;
            const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value);
            const image_url = (form.elements.namedItem('image_url') as HTMLInputElement).value;
            const description = (form.elements.namedItem('description') as HTMLInputElement).value;
            const duration = (form.elements.namedItem('duration') as HTMLInputElement).value;
          const seller_id = userId;
          if (!seller_id) {
            alert("Seller ID not found. Please log in again.");
            return;
          }
          const { error } = await supabase
            .from('products')
            .insert([
              {
                name: service_name,
                price: price,
                image_url: image_url,
                seller_id: seller_id,
                status: 'active',
                description: description,
                duration: duration
              }
            ]);
          if (error) {
            console.error('Upload error:', error.message);
            setUploadMessage('Failed to upload product');
            return;
          }
          setUploadMessage('Product uploaded successfully');
          // refetch services
          const fetchServices = async () => {
            const seller_id = userId;
            if (!seller_id) return;
            const { data, error } = await supabase
              .from('products')
              .select('*')
              .eq('seller_id', seller_id)
            if (!error) {
              setServices(data || []);
              setAnalytics(prev => ({ ...prev, totalServices: (data || []).length }));
            }
          };
          fetchServices();
          form.reset();
          }}
          className="space-y-4 mb-6"
        >
          <input name="service_name" placeholder="Product Name" className="border p-2 w-full rounded" required />
          <input name="price" type="number" placeholder="Price" className="border p-2 w-full rounded" required />
          <input name="image_url" placeholder="Image URL" className="border p-2 w-full rounded" required />
          <input name="duration" placeholder="Duration (e.g. 1 hr)" className="border p-2 w-full rounded" required />
          <textarea name="description" placeholder="Description" className="border p-2 w-full rounded" rows={3}></textarea>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">Upload Product</button>
          {uploadMessage && <p className="text-sm italic">{uploadMessage}</p>}
        </form>
        <h2 className="text-xl font-semibold">Your Products</h2>
        {Array.isArray(services) && services.length === 0 ? (
          <p className="text-gray-500 italic">No products uploaded yet. Start by adding one above.</p>
        ) : (
          Array.isArray(services) &&
          services.map((service: any) => (
            <div key={service.id} className="border p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <img src={service.image_url} alt={service.name || service.service_name} className="w-full sm:w-48 h-48 object-cover rounded mb-2" />
                <p><strong>Name:</strong> {service.name || service.service_name}</p>
                <p><strong>Price:</strong> ${service.price}</p>
                <p><strong>Duration:</strong> {service.duration}</p>
                <p><strong>Status:</strong> {service.status}</p>
              </div>
            </div>
          ))
        )}
        <h2 className="text-xl font-semibold mt-8">Recent Bookings</h2>
        {Array.isArray(bookings) && bookings.length === 0 ? (
          <p className="text-gray-500 italic">No bookings found for your products yet.</p>
        ) : (
          Array.isArray(bookings) &&
          bookings.map((booking: any) => (
            <div key={booking.id} className="border p-4 rounded shadow mt-2 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Booked Product:</strong> {booking.product_name || booking.service_name || booking.service_id}</p>
                <p className="text-sm text-gray-500">Created: {new Date(booking.created_at).toLocaleString()}</p>
                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Pending</span>
                    <span>Packed</span>
                    <span>Ready</span>
                    <span>Picked</span>
                    <span>Delivered</span>
                  </div>
                  <div className="flex w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(booking.status) >= 20 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(booking.status) >= 40 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(booking.status) >= 60 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(booking.status) >= 80 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(booking.status) >= 100 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                  </div>
                </div>
                {/* Optional Tracking Field */}
                {booking.status !== 'delivered' && (
                  <input
                    type="text"
                    placeholder="Tracking or seller notes (optional)"
                    className="mt-2 border p-2 rounded w-full"
                    disabled
                  />
                )}
                {booking.status === 'pending' && (
                  <button
                    onClick={() => updateBookingStatus(String(booking.id), 'packed')}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Mark as Packed
                  </button>
                )}
                {booking.status === 'packed' && (
                  <button
                    onClick={() => updateBookingStatus(String(booking.id), 'ready_for_pickup')}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Mark as Ready for Pickup
                  </button>
                )}
                {booking.status === 'ready_for_pickup' && (
                  <button
                    onClick={() => updateBookingStatus(String(booking.id), 'picked_up')}
                    className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded"
                  >
                    Mark as Picked Up
                  </button>
                )}
                {booking.status === 'picked_up' && (
                  <button
                    onClick={() => updateBookingStatus(String(booking.id), 'delivered')}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AuthGuard>
  )
}

export default SellerDashboard;
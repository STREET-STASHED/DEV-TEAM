import { useRouter } from 'next/router';
import AuthGuard from '@/components/AuthGuard';
 
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [sellerApps, setSellerApps] = useState<any[]>([]);
  const [stylistApps, setStylistApps] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeStylists: 0,
    activeSellers: 0,
    activeBuyers: 0,
    totalOrders: 0,
    totalBookings: 0,
    activeDisputes: 0,
    monthlyOrders: 0,
    monthlyBookings: 0,
    topCities: {} as Record<string, number>,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/unauthorized');
      }
    };

    checkRole();
  }, [])

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: sellers } = await supabase
        .from('seller_applications')
        .select('*')
        .eq('status', 'pending');

      const { data: stylists } = await supabase
        .from('stylist_applications')
        .select('*')
        .eq('status', 'pending');

      setSellerApps(sellers || []);
      setStylistApps(stylists || []);
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      const [{ count: totalUsers }, { count: activeStylists }, { count: activeSellers }, { count: activeBuyers },
        { count: totalOrders }, { count: totalBookings }, { count: activeDisputes }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'stylist'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const { data: recentOrders } = await supabase
        .from('orders')
        .select('city')
        .gte('created_at', `${currentMonth}-01`);

      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('city')
        .gte('created_at', `${currentMonth}-01`);

      const topCities = [...(recentOrders || []), ...(recentBookings || [])]
        .reduce((acc, cur) => {
          acc[cur.city] = (acc[cur.city] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      setMetrics({
        totalUsers: totalUsers || 0,
        activeStylists: activeStylists || 0,
        activeSellers: activeSellers || 0,
        activeBuyers: activeBuyers || 0,
        totalOrders: totalOrders || 0,
        totalBookings: totalBookings || 0,
        activeDisputes: activeDisputes || 0,
        monthlyOrders: (recentOrders || []).length,
        monthlyBookings: (recentBookings || []).length,
        topCities,
      });

      const { data: fetchedOrders } = await supabase.from('orders').select('*');
      setOrdersList(fetchedOrders || []);
    };

    fetchMetrics();
  }, []);

  const handleUpdateStatus = async (id: number, role: 'seller' | 'stylist', status: 'approved' | 'rejected') => {
    const table = role === 'seller' ? 'seller_applications' : 'stylist_applications';
    const { data: appData } = await supabase.from(table).select('*').eq('id', id).single();

    if (!appData) return;

    // Update application status
    await supabase.from(table).update({ status }).eq('id', id);

    // If approved, insert into the corresponding role table
    if (status === 'approved') {
      if (role === 'seller') {
        await supabase.from('sellers').insert([
          {
            email: appData.email,
            brand_name: appData.brandName,
            city: appData.city,
            phone: appData.phone,
            instagram: appData.instagram,
            website: appData.website || '',
          },
        ]);
      } else if (role === 'stylist') {
        await supabase.from('stylists').insert([
          {
            email: appData.email,
            name: appData.name,
            city: appData.city,
            phone: appData.phone,
            instagram: appData.instagram,
            specialty: appData.specialty || '',
            portfolio_url: appData.portfolioUrl || '',
          },
        ]);
      }
    }

    // Refresh application lists
    const { data: updatedSellers } = await supabase
      .from('seller_applications')
      .select('*')
      .eq('status', 'pending');

    const { data: updatedStylists } = await supabase
      .from('stylist_applications')
      .select('*')
      .eq('status', 'pending');

    setSellerApps(updatedSellers || []);
    setStylistApps(updatedStylists || []);
  };

  return (
    <AuthGuard role="admin">
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        {user ? (
          <p>Welcome, {user.email}</p>
        ) : (
          <p>Loading admin info...</p>
        )}

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Platform Metrics (Live)</h2>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
            <ul>
              <li><strong>Total Users:</strong> {metrics.totalUsers}</li>
              <li><strong>Active Stylists:</strong> {metrics.activeStylists}</li>
              <li><strong>Active Sellers:</strong> {metrics.activeSellers}</li>
              <li><strong>Active Buyers:</strong> {metrics.activeBuyers}</li>
              <li><strong>Total Orders:</strong> {metrics.totalOrders}</li>
              <li><strong>Total Bookings:</strong> {metrics.totalBookings}</li>
              <li><strong>Active Disputes:</strong> {metrics.activeDisputes}</li>
              <li><strong>Monthly Orders:</strong> {metrics.monthlyOrders}</li>
              <li><strong>Monthly Bookings:</strong> {metrics.monthlyBookings}</li>
              <li><strong>Top Cities:</strong> {Object.entries(metrics.topCities).map(([city, count]) => `${city}: ${count}`).join(', ')}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold">All Orders</h2>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
            {metrics.totalOrders > 0 ? (
              <ul className="divide-y divide-gray-200">
                {ordersList.map((order: any) => (
                  <li key={order.id} className="py-2">
                    <div><strong>Product:</strong> {order.product_name}</div>
                    <div><strong>Price:</strong> ${order.price}</div>
                    <div><strong>Status:</strong> {order.status}</div>
                    <div><strong>Buyer ID:</strong> {order.buyer_id}</div>
                    <div><strong>Seller ID:</strong> {order.seller_id}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders available.</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Admin Tools</h2>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
            <ul>
              <li>✅ View sample user records</li>
              <li>✅ Approve seller/stylist applications</li>
              <li>✅ Monitor mock disputes</li>
              <li>✅ Payout management dashboard</li>
              <li>✅ View payout history</li>
              <li>🛠 Manually assign roles to users (coming soon)</li>
              <li>🛠 Suspend or reinstate user accounts (coming soon)</li>
              <li>🛠 View all transactions (coming soon)</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Pending Seller Applications</h2>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
            <ul>
              {sellerApps.length > 0 ? (
                sellerApps.map((app: any) => (
                  <li key={app.id} className="mb-4">
                    <div className="font-semibold">{app.brandName}</div>
                    <div>{app.email} ({app.city})</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleUpdateStatus(app.id, 'seller', 'approved')} className="px-4 py-2 bg-green-600 text-white rounded">
                        Approve
                      </button>
                      <button onClick={() => handleUpdateStatus(app.id, 'seller', 'rejected')} className="px-4 py-2 bg-red-600 text-white rounded">
                        Reject
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li>No pending seller applications.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Pending Stylist Applications</h2>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
            <ul>
              {stylistApps.length > 0 ? (
                stylistApps.map((app: any) => (
                  <li key={app.id} className="mb-4">
                    <div className="font-semibold">{app.name}</div>
                    <div>{app.email} ({app.city})</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleUpdateStatus(app.id, 'stylist', 'approved')} className="px-4 py-2 bg-green-600 text-white rounded">
                        Approve
                      </button>
                      <button onClick={() => handleUpdateStatus(app.id, 'stylist', 'rejected')} className="px-4 py-2 bg-red-600 text-white rounded">
                        Reject
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li>No pending stylist applications.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

export default AdminDashboard

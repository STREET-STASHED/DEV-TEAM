import { useRouter } from 'next/router';
import AuthGuard from '@/components/AuthGuard';

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js'

type Metrics = {
  totalUsers: number;
  activeStylists: number;
  activeSellers: number;
  activeBuyers: number;
  totalOrders: number;
  totalBookings: number;
  monthlyOrders: number;
  monthlyBookings: number;
  topCities: Record<string, number>;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null)
  const [sellerApps, setSellerApps] = useState<any[]>([]);
  const [stylistApps, setStylistApps] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeStylists: 0,
    activeSellers: 0,
    activeBuyers: 0,
    totalOrders: 0,
    totalBookings: 0,
    monthlyOrders: 0,
    monthlyBookings: 0,
    topCities: {},
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } = {} } = await supabase.auth.getUser();
        setUser(user ?? null);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { session } = {} } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          router.push('/login');
          return;
        }
        // Check role from 'users' table (assuming that's the correct table with 'role' column)
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!profile || !profile.role || profile.role !== 'admin') {
          router.push('/unauthorized');
        }
      } catch (err) {
        router.push('/unauthorized');
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: sellers = [] } = await supabase
          .from('sellers')
          .select('*')
          .eq('status', 'pending');
        const { data: stylists = [] } = await supabase
          .from('stylist_applications')
          .select('*')
          .eq('status', 'pending');
        setSellerApps(sellers ?? []);
        setStylistApps(stylists ?? []);
      } catch (err) {
        setSellerApps([]);
        setStylistApps([]);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [
          { count: totalUsers = 0 } = {},
          { count: activeStylists = 0 } = {},
          { count: activeSellers = 0 } = {},
          { count: activeBuyers = 0 } = {},
          { count: totalOrders = 0 } = {},
          { count: totalBookings = 0 } = {},
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'stylist'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
        ]);

        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        // Adjusted: Remove 'city' from select if not present in orders/bookings schema
        // You may want to aggregate by another field, e.g., shipping_city, stylist_city, etc.
        // Here, we just fetch recent orders/bookings for monthly counts, and skip topCities if not available
        const { data: recentOrders = [] } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', `${currentMonth}-01`);

        const { data: recentBookings = [] } = await supabase
          .from('bookings')
          .select('*')
          .gte('created_at', `${currentMonth}-01`);

        // If you have a city field in orders or bookings, you can aggregate here. Otherwise, leave as empty object.
        let topCities: Record<string, number> = {};
        // Example: if orders have shipping_city and bookings have city, you can aggregate:
        // const topCities = [...(recentOrders || []), ...(recentBookings || [])]
        //   .reduce((acc, cur) => {
        //     const city = cur?.city || cur?.shipping_city;
        //     if (city) {
        //       acc[city] = (acc[city] || 0) + 1;
        //     }
        //     return acc;
        //   }, {} as Record<string, number>);

        setMetrics({
          totalUsers: totalUsers || 0,
          activeStylists: activeStylists || 0,
          activeSellers: activeSellers || 0,
          activeBuyers: activeBuyers || 0,
          totalOrders: totalOrders || 0,
          totalBookings: totalBookings || 0,
          monthlyOrders: recentOrders?.length ?? 0,
          monthlyBookings: recentBookings?.length ?? 0,
          topCities,
        });

        const { data: fetchedOrders = [] } = await supabase.from('orders').select('*');
        setOrdersList(fetchedOrders ?? []);
      } catch (err) {
        setMetrics({
          totalUsers: 0,
          activeStylists: 0,
          activeSellers: 0,
          activeBuyers: 0,
          totalOrders: 0,
          totalBookings: 0,
          monthlyOrders: 0,
          monthlyBookings: 0,
          topCities: {},
        });
        setOrdersList([]);
      }
    };
    fetchMetrics();
  }, []);

  const handleUpdateStatus = async (id: number, role: 'seller' | 'stylist', status: 'approved' | 'rejected') => {
    const table = role === 'seller' ? 'sellers' : 'stylist_applications';
    try {
      const { data: appData } = await supabase.from(table).select('*').eq('id', String(id)).single();
      if (!appData) return;

      // Update application status
      // Only update 'status' if it exists in the table schema
      if (table === 'sellers' || table === 'stylist_applications') {
        // @ts-expect-error: 'status' may exist in the dynamic table schema
                await supabase.from(table).update({ status }).eq('id', id);
      }

      // If approved, insert into the corresponding role table
      if (status === 'approved') {
        if (role === 'seller') {
          // Type guard: only access seller fields if present
          if ('store_name' in appData) {
            const sellerInsert: any = {
              store_name: appData.store_name ?? '',
              city: 'city' in appData && typeof appData.city === 'string' ? appData.city ?? '' : '',
              phone: ('phone' in appData && typeof appData.phone === 'string') ? appData.phone ?? '' : '',
              instagram: ('instagram' in appData && typeof appData.instagram === 'string') ? appData.instagram ?? '' : '',
              // website: appData.website ?? '', // Removed because 'website' does not exist on appData type
              created_at: appData.created_at ?? new Date().toISOString(),
              logo_url: appData.logo_url ?? '',
              id: appData.id ?? crypto.randomUUID(),
              status: 'approved'
            };
            if ('user_id' in appData) {
              sellerInsert.user_id = appData.user_id ?? '';
            }
            await supabase.from('sellers').insert([sellerInsert]);
          }
        } else if (role === 'stylist') {
          const stylistInsert = {
            email: 'email' in appData && typeof appData.email === 'string' ? appData.email : '',
            name: 'name' in appData && typeof appData.name === 'string' ? appData.name : '',
            city: 'city' in appData && typeof appData.city === 'string' ? appData.city ?? '' : '',
            phone: 'phone' in appData && typeof appData.phone === 'string' ? appData.phone ?? '' : '',
            instagram: 'instagram' in appData ? (appData as any).instagram ?? '' : '',
            specialty: 'specialty' in appData ? (appData as any).specialty ?? '' : '',
            portfolio_url: 'portfolio_url' in appData ? (appData as any).portfolio_url ?? '' : '',
            created_at: appData?.created_at ?? new Date().toISOString(),
            logo_url: 'logo_url' in appData ? (appData as any).logo_url ?? '' : '',
            id: appData?.id ?? crypto.randomUUID(),
            status: 'approved'
          };
          await supabase.from('stylists').insert([stylistInsert]);
        }
      }

      // Refresh application lists
      const { data: updatedSellers = [] } = await supabase
        .from('sellers')
        .select('*')
        .eq('status', 'pending');
      const { data: updatedStylists = [] } = await supabase
        .from('stylist_applications')
        .select('*')
        .eq('status', 'pending');
      setSellerApps(updatedSellers ?? []);
      setStylistApps(updatedStylists ?? []);
    } catch (err) {
      // handle error
    }
  };

  return (
    <AuthGuard role="admin">
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        {user ? (
          <p>Welcome, {user?.email ?? ''}</p>
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
                {(ordersList ?? []).map((order) => (
                  <li key={order?.id} className="py-2">
                    <div><strong>Product:</strong> {order?.product_name ?? ''}</div>
                    <div><strong>Price:</strong> ${order?.price ?? ''}</div>
                    <div><strong>Status:</strong> {order?.status ?? ''}</div>
                    <div><strong>Buyer ID:</strong> {order?.buyer_id ?? ''}</div>
                    <div><strong>Seller ID:</strong> {order?.seller_id ?? ''}</div>
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
              {(sellerApps ?? []).length > 0 ? (
                (sellerApps ?? []).map((app) => (
                  <li key={app?.id} className="mb-4">
                    <div className="font-semibold">{app?.brand_name ?? ''}</div>
                    <div>{app?.email ?? ''} ({app?.city ?? ''})</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleUpdateStatus(app?.id, 'seller', 'approved')} className="px-4 py-2 bg-green-600 text-white rounded">
                        Approve
                      </button>
                      <button onClick={() => handleUpdateStatus(app?.id, 'seller', 'rejected')} className="px-4 py-2 bg-red-600 text-white rounded">
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
              {(stylistApps ?? []).length > 0 ? (
                (stylistApps ?? []).map((app) => (
                  <li key={app?.id} className="mb-4">
                    <div className="font-semibold">{app?.name ?? ''}</div>
                    <div>{app?.email ?? ''} ({app?.city ?? ''})</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleUpdateStatus(app?.id, 'stylist', 'approved')} className="px-4 py-2 bg-green-600 text-white rounded">
                        Approve
                      </button>
                      <button onClick={() => handleUpdateStatus(app?.id, 'stylist', 'rejected')} className="px-4 py-2 bg-red-600 text-white rounded">
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

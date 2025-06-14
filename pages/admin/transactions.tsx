import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminTransactionsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, buyer_id, seller_id')
        .order('created_at', { ascending: false });

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, buyer_id, stylist_id')
        .order('created_at', { ascending: false });

      setOrders(orderData || []);
      setBookings(bookingData || []);
    };

    fetchData();
  }, []);

  type PayoutInfo = {
    total: number;
    count: number;
  };

  const sellerPayouts: Record<string, PayoutInfo> = orders.reduce((acc, order) => {
    if (!acc[order.seller_id]) {
      acc[order.seller_id] = { total: 0, count: 0 };
    }
    acc[order.seller_id].total += Number(order.price || 0);
    acc[order.seller_id].count += 1;
    return acc;
  }, {} as Record<string, PayoutInfo>);

  return (
    <>
      <Head>
        <title>Admin Transactions</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Transactions</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">All Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4 text-left">Product</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Buyer ID</th>
                  <th className="py-2 px-4 text-left">Seller ID</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 px-4">{order.product_name}</td>
                    <td className="py-2 px-4">${order.price}</td>
                    <td className="py-2 px-4">{order.buyer_id}</td>
                    <td className="py-2 px-4">{order.seller_id}</td>
                    <td className="py-2 px-4">{order.status}</td>
                    <td className="py-2 px-4">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">All Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4 text-left">Event</th>
                  <th className="py-2 px-4 text-left">Budget</th>
                  <th className="py-2 px-4 text-left">Buyer ID</th>
                  <th className="py-2 px-4 text-left">Stylist ID</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="py-2 px-4">{booking.event_type}</td>
                    <td className="py-2 px-4">${booking.budget}</td>
                    <td className="py-2 px-4">{booking.buyer_id}</td>
                    <td className="py-2 px-4">{booking.stylist_id}</td>
                    <td className="py-2 px-4">{booking.status}</td>
                    <td className="py-2 px-4">{new Date(booking.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      {/* --- Payout Management Section --- */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">Payout Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left">Seller ID</th>
                <th className="py-2 px-4 text-left">Total Orders</th>
                <th className="py-2 px-4 text-left">Total Earned</th>
                <th className="py-2 px-4 text-left">Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sellerPayouts).map(([sellerId, info]) => (
                <tr key={sellerId} className="border-b">
                  <td className="py-2 px-4">{sellerId}</td>
                  <td className="py-2 px-4">{info.count}</td>
                  <td className="py-2 px-4">${info.total.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    {info.total > 0 ? (
                      <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="text-gray-500">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Payout History Section --- */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left">User ID</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Method</th>
                <th className="py-2 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-2 px-4">{order.seller_id}</td>
                  <td className="py-2 px-4">${Number(order.price || 0).toFixed(2)}</td>
                  <td className="py-2 px-4">Pending</td>
                  <td className="py-2 px-4">Manual</td>
                  <td className="py-2 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </>
  );
}
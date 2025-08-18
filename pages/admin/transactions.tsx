import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Head from 'next/head';
import type { Database } from '@/lib/supabase/database.types';

type OrderRow = Database['public']['Tables']['orders']['Row'];

export default function AdminTransactions() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('load orders failed', error);
        return;
      }
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

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
                  <th className="py-2 px-4 text-left">Order Name</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  <th className="py-2 px-4 text-left">Buyer ID</th>
                  <th className="py-2 px-4 text-left">Seller ID</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 px-4">{order.name || 'N/A'}</td>
                    <td className="py-2 px-4">${order.total || 0}</td>
                    <td className="py-2 px-4">{order.buyer_id || 'N/A'}</td>
                    <td className="py-2 px-4">{order.seller_id || 'N/A'}</td>
                    <td className="py-2 px-4">{order.status || 'N/A'}</td>
                    <td className="py-2 px-4">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                    </td>
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
                {Object.entries(
                  rows.reduce((acc, order) => {
                    const sellerId = order.seller_id;
                    if (!sellerId) return acc;
                    if (!acc[sellerId]) {
                      acc[sellerId] = { total: 0, count: 0 };
                    }
                    acc[sellerId].total += Number(order.total || 0);
                    acc[sellerId].count += 1;
                    return acc;
                  }, {} as Record<string, { total: number; count: number }>)
                ).map(([sellerId, info]) => (
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
                {rows.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 px-4">{order.seller_id || 'N/A'}</td>
                    <td className="py-2 px-4">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-4">Pending</td>
                    <td className="py-2 px-4">Manual</td>
                    <td className="py-2 px-4">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </td>
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

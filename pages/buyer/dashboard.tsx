import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import OrderProgressBar from '@/components/OrderProgressBar';

const Dashboard: React.FC = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orders, setOrders] = useState<Array<{ id: string; status?: string; total_price?: number; created_at?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profile) return;

        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total_price, created_at')
          .eq('buyer_id', profile.id);

        if (error) throw error;

        setOrders(
          (data || []).map(order => ({
            id: order.id,
            status: order.status ?? undefined,
            total_price: order.total_price,
            created_at: order.created_at,
          }))
        );
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-black">Welcome to the StreetStashed Buyer Hub</h1>

      <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-4 border-b pb-2">Track Your Most Recent Orders</h2>
      {loading ? (
        <p className="text-center text-gray-500 italic">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 italic text-center">You haven't placed any orders yet. Start shopping to see them here!</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition rounded-lg p-6 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold">
                Order ID: <span className="font-normal">{order.id}</span>
              </p>
              <p className={`text-sm sm:text-base font-medium italic ${order.status === 'delivered' ? 'text-green-600' : 'text-yellow-600'}`}>
                Status: {order.status}
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                Total Price: ${order.total_price?.toFixed(2) ?? 'N/A'}
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                Ordered At: {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
              </p>
              <div className="mt-4">
                <OrderProgressBar status={(order?.status ?? 'pending').toLowerCase().replace(/ /g, '_')} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;

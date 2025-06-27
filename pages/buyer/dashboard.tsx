import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import supabase from '@/lib/ssupabaseClient';
import OrderProgressBar from '@/components/OrderProgressBar';

interface BuyerDashboardProps {
  userId: string;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Array<{ id: string; status?: string; total_price?: number; created_at?: string }>>([])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total_price, created_at')
          .eq('buyer_id', userId);

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
        if (err instanceof Error) {
          console.error('Error fetching orders:', err.message);
        } else {
          console.error('Unknown error fetching orders:', err);
        }
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-black">Welcome to the StreetStashed Buyer Hub</h1>

      <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-4 border-b pb-2">Track Your Most Recent Orders</h2>
      {orders.length === 0 ? (
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
              <p className="text-sm sm:text-base text-gray-600 italic">
                Status: {order.status}
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                Total Price: ${order.total_price?.toFixed(2) ?? 'N/A'}
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                Ordered At: {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
              </p>
              <div className="mt-2">
                <OrderProgressBar status={(order?.status ?? 'pending').toLowerCase().replace(/ /g, '_')} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default BuyerDashboard

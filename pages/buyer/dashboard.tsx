import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import OrderProgressBar from '@/components/OrderProgressBar';

interface BuyerDashboardProps {
  userId: string;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Array<{ id: string; status?: string }>>([])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('orders')
        .select('id, status')
        .eq('buyer_id', userId);

      if (error) {
        console.error('Error fetching orders:', error.message);
        return;
      }

      setOrders(
        (data || []).map(order => ({
          id: order.id,
          status: order.status === null ? undefined : order.status,
        }))
      );
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

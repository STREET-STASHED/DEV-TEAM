import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import OrderProgressBar from '@/components/OrderProgressBar';

const BuyerDashboard = ({ userId }: { userId: string }) => {
  const [orders, setOrders] = useState<Array<{ id: string; status?: string }>>([])

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status')
        .eq('buyer_id', userId);

      if (error) {
        console.error('Error fetching orders:', error.message)
        return
      }

      setOrders(
        (data || []).map(order => ({
          id: order.id,
          status: order.status === null ? undefined : order.status,
        }))
      )
    }

    fetchOrders()
  }, [userId])

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-wide mb-6 text-center">StreetStashed Buyer Hub</h1>

      <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-4 border-b pb-2">Your Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 italic">You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border hover:shadow-lg transition rounded-lg p-4 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
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

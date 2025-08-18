import { supabase } from '@/lib/supabase/client'
import OrderProgressBar from '@/components/OrderProgressBar'

type Order = {
  id: string
  status?: string
  total_price?: number
  created_at?: string
}

async function getOrders(): Promise<Order[]> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total, created_at')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return (data || []).map((order) => ({
    id: order.id,
    status: order.status ?? undefined,
    total_price: order.total ?? undefined,
    created_at: order.created_at ?? undefined,
  }))
}

export async function BuyerDashboardContent() {
  const orders = await getOrders()

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't placed any orders yet. Start shopping to see them here!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition rounded-lg p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        >
          <div className="flex-1">
            <p className="text-sm sm:text-base font-semibold">
              Order ID: <span className="font-normal">{order.id}</span>
            </p>
            <p
              className={`text-sm sm:text-base font-medium italic ${
                order.status === 'delivered' ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              Status: {order.status}
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              Total Price: ${order.total_price?.toFixed(2) ?? 'N/A'}
            </p>
            <p className="text-sm sm:text-base text-gray-500">
              Ordered At:{' '}
              {order.created_at
                ? new Date(order.created_at).toLocaleString()
                : 'N/A'}
            </p>
            <div className="mt-4">
              <OrderProgressBar
                status={(order?.status ?? 'pending')
                  .toLowerCase()
                  .replace(/ /g, '_')}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

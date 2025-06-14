import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import OrderProgressBar from '@/components/OrderProgressBar';

const BuyerDashboard = () => {
  const [user, setUser] = useState<any>(null)

  const mockOrders = [
    { id: 'ORD-4001', product: 'Hoodie Drop 1', status: 'Delivered' },
    { id: 'ORD-4002', product: 'Sneaker Pack', status: 'Processing' },
    { id: 'ORD-4003', product: 'Stashed Beanie', status: 'Out for Delivery' },
  ]

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

      const currentUser = session?.user;
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profile?.role !== 'buyer') {
        window.location.href = '/unauthorized';
      }
    };

    checkRole();
  }, []);

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-wide mb-6 text-center">StreetStashed Buyer Hub</h1>
      {user ? (
        <p>Welcome, {user.email}!</p>
      ) : (
        <p>Loading user info...</p>
      )}

      <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-4 border-b pb-2">Your Recent Orders</h2>
      {mockOrders.length === 0 ? (
        <p className="text-gray-500 italic">You haven't placed any orders yet.</p>
      ) : (
        mockOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border hover:shadow-lg transition rounded-lg p-4 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold">
                Order ID: <span className="font-normal">{order.id}</span>
              </p>
              <p className="text-sm sm:text-base font-semibold">
                Product: <span className="font-normal">{order.product}</span>
              </p>
              <p className="text-sm sm:text-base text-gray-600 italic">
                Status: {order.status}
              </p>
              <div className="mt-2">
                <OrderProgressBar status={order.status.toLowerCase().replace(/ /g, '_')} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default BuyerDashboard

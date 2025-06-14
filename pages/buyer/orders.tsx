

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error loading orders:', error);
      else setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border rounded p-4">
              <p className="font-semibold">Order ID: {order.id}</p>
              <p>Total: ${order.total}</p>
              <p>Status: {order.status || 'Pending'}</p>
              <p className="text-sm text-gray-500">
                Placed: {new Date(order.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
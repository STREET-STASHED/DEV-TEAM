// pages/buyer/orders.tsx
import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
      } else {
        setOrders(
          (data || []).map((order: any) => ({
            id: Number(order.id),
            total: Number(order.total) || 0,
            status: order.status ?? 'Pending',
            created_at: order.created_at ?? '',
          }))
        );
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>No Orders Found</h1>
        <Link href="/stores">
          <button style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Shop Now
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Your Orders</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map(order => (
          <li key={order.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
            <p><strong>Order #{order.id}</strong></p>
            <p>Total: ${order.total.toFixed(2)}</p>
            <p>Status: {order.status || 'Pending'}</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
            <Link href={`/buyer/${order.id}`}>
              <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                View Details
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory;
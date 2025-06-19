import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';

interface CheckoutFormProps {
  items: CartItem[];
  name: string;
  email: string;
  totalAmount: number;
  mode?: 'buyNow' | 'cart';
}

export default function CheckoutForm({ items, name, email, totalAmount, mode = 'buyNow' }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'cart' ? '/api/orders' : '/api/checkout';
      const payload = mode === 'cart'
        ? { items, name, email, total: totalAmount }
        : { items: [{ ...items[0], quantity: 1 }], name, email, totalAmount };
      const { data } = await axios.post(endpoint, payload);

      if (data.success) {
        setSuccess(true);
      } else {
        throw new Error(data.message || 'Payment failed on server');
      }

      if (mode === 'cart' && data.orderId) {
        clearCart();
        router.push(`/order/${data.orderId}`);
        return;
      }
    } catch (err: any) {
      console.error('Full payment error object:', JSON.stringify(err, null, 2));
      const errorResponse = err?.response?.data;
      const message = errorResponse?.error || errorResponse?.message || err?.message || 'An unexpected error occurred';
      setError(`Payment failed: ${message}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Checkout</h2>

      {mode === 'buyNow' ? (
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading ? 'Processing…' : 'Buy Now'}
        </button>
      ) : (
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading ? 'Placing Order…' : 'Place Order'}
        </button>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '1rem' }}>Payment successful!</p>}
    </form>
  );
}
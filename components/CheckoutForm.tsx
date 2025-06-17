import { useState } from 'react';
import axios from 'axios';

interface CheckoutFormProps {
  items: any[];
  name: string;
  email: string;
  totalAmount: number;
  mode?: 'buyNow' | 'cart';
}

export default function CheckoutForm({ items, name, email, totalAmount, mode = 'buyNow' }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/checkout', {
        items,
        name,
        email,
        totalAmount,
      });

      if (data.success) {
        setSuccess(true);
      } else {
        throw new Error(data.message || 'Payment failed on server');
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
          type="button"
          onClick={() => alert('Added to cart!')} // Replace with real addToCart handler
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Add to Cart
        </button>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '1rem' }}>Payment successful!</p>}
    </form>
  );
}
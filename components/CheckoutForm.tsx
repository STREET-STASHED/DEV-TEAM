import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';
import supabase from '../lib/supabaseBrowserClient';

interface CheckoutFormProps {
  items: CartItem[];
  totalAmount: number;
  mode?: 'buyNow' | 'cart' | 'buyer';
}

export default function CheckoutForm({ items, totalAmount, mode = 'buyNow' }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      let guestId = null;
      let buyerId = null;
      let isGuest = false;

      if (session && session.user) {
        buyerId = session.user.id;
      } else {
        isGuest = true;
        guestId = localStorage.getItem("guest_id");
        if (!guestId) {
          guestId = crypto.randomUUID();
          localStorage.setItem("guest_id", guestId);
        }
      }

      const endpoint = mode === 'cart' ? '/api/orders' : '/api/checkout';
      const payload = (mode === 'cart' || mode === 'buyer')
        ? { items, ...form, total: totalAmount, guest_id: guestId, buyer_id: buyerId, is_guest: isGuest }
        : { items: [{ ...items[0], quantity: 1 }], ...form, totalAmount, guest_id: guestId, buyer_id: buyerId, is_guest: isGuest };

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
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem', border: '2px solid black', borderRadius: '10px', backgroundColor: '#111', color: '#fff' }}>
      <h2 style={{ color: '#FFD700' }}>Secure Checkout</h2>

      <input name="firstName" placeholder="First Name" onChange={handleChange} value={form.firstName} required style={inputStyle} />
      <input name="lastName" placeholder="Last Name" onChange={handleChange} value={form.lastName} required style={inputStyle} />
      <input name="email" type="email" placeholder="Email Address" onChange={handleChange} value={form.email} required style={inputStyle} />
      <input name="address" placeholder="Shipping Address" onChange={handleChange} value={form.address} required style={inputStyle} />
      <input name="city" placeholder="City" onChange={handleChange} value={form.city} required style={inputStyle} />
      <input name="state" placeholder="State" onChange={handleChange} value={form.state} required style={inputStyle} />
      <input name="zip" placeholder="Zip Code" onChange={handleChange} value={form.zip} required style={inputStyle} />

      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <strong>Order Total:</strong> ${totalAmount.toFixed(2)}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#FFD700',
          color: '#000',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        {loading ? 'Processing...' : mode === 'buyNow' ? 'Buy Now' : mode === 'buyer' ? 'Checkout as Buyer' : 'Place Order'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '1rem' }}>Payment successful!</p>}
    </form>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.5rem',
  marginBottom: '0.75rem',
  borderRadius: '5px',
  border: '1px solid #ccc',
};
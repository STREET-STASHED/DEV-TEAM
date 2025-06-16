import { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';

interface CheckoutFormProps {
  items: any[];
  name: string;
  email: string;
}

export default function CheckoutForm({ items, name, email }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/create-payment-intent', {
        items,
        name,
        email
      });

      const clientSecret = response.data.clientSecret;

      if (!stripe || !elements) return;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name, email }
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        setSuccess(true);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'An unexpected error occurred';
      console.error('Full payment error:', err);
      setError(`Payment failed: ${message}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Checkout</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="card-element">Card Details</label>
        <CardElement id="card-element" options={{ hidePostalCode: true }} />
      </div>

      <button type="submit" disabled={!stripe || loading} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px' }}>
        {loading ? 'Processing…' : 'Pay Now'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '1rem' }}>Payment successful!</p>}
    </form>
  );
}
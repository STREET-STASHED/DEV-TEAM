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
    } catch (err) {
      console.error('Payment error', err);
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <CardElement options={{ hidePostalCode: true }} />
      <button type="submit" disabled={!stripe || loading} style={{ marginTop: '20px' }}>
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Payment successful!</p>}
    </form>
  );
}
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
  mode?: 'buyNow' | 'cart';
}

export default function CheckoutForm({ items, name, email, mode = 'buyNow' }: CheckoutFormProps) {
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
      if (!stripe || !elements) {
        throw new Error('Stripe not initialized');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card Element not found');
      }

      const paymentMethodRes = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name, email },
      });

      if (paymentMethodRes.error) {
        throw new Error(paymentMethodRes.error.message || 'Payment method creation failed');
      }

      const { data } = await axios.post('/api/paymentIntents.create', {
        paymentMethodId: paymentMethodRes.paymentMethod.id,
        items,
        name,
        email
      });

      if (data.requiresAction) {
        const confirmResult = await stripe.confirmCardPayment(data.paymentIntentClientSecret);
        if (confirmResult.error) {
          throw new Error(confirmResult.error.message || '3D Secure confirmation failed');
        }

        if (confirmResult.paymentIntent.status !== 'succeeded') {
          throw new Error('Payment not completed after confirmation');
        }

        setSuccess(true);
      } else if (data.success) {
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
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="card-element">Card Details</label>
        <CardElement id="card-element" options={{ hidePostalCode: true }} />
      </div>

      {mode === 'buyNow' ? (
        <button
          type="submit"
          disabled={!stripe || loading}
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
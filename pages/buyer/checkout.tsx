import type { CartContextType } from '@/context/CartContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CheckoutForm from '@/components/CheckoutForm';

const CheckoutPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const context = useCart() as CartContextType;
  const cart = context?.cart || [];

  const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <ul className="space-y-2 mb-4">
        {cart.map((item, index) => (
          <li key={index} className="flex justify-between border-b pb-2">
            <span>{item.name}</span>
            <span>${item.price?.toFixed(2)} x {item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="border-t pt-4 mb-4">
        <p className="text-lg font-medium">
          Total Items: <span className="font-normal">{totalQuantity}</span>
        </p>
        <p className="text-lg font-medium">
          Total Cost: <span className="font-normal">${totalPrice.toFixed(2)}</span>
        </p>
      </div>

      <input
        className="w-full p-2 mb-2 border rounded"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 border rounded"
        placeholder="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <CheckoutForm items={cart} name={name} email={email} totalAmount={totalPrice} />
    </main>
  );
};

export default CheckoutPage;
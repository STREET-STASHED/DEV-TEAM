import type { CartContextType } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { useState } from 'react';

const CheckoutPage = () => {
  const context = useCart() as CartContextType;
  const cart = context?.cart || [];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          items: cart,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order placed successfully!');
        router.push('/buyer/dashboard');
      } else {
        alert('Failed to place order.');
        console.error('Order error:', data);
      }
    } catch (error) {
      alert('Checkout failed. Try again.');
      console.error(error);
    }
  };

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

      <button
        onClick={handleCheckout}
        className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
      >
        Place Order
      </button>
    </main>
  );
};

export default CheckoutPage;
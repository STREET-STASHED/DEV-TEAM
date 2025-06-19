import { useCart, CartItem } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import CheckoutForm from '@/components/CheckoutForm';

const CheckoutPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const { items, totalCount: totalQuantity, totalPrice } = useCart();

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <ul className="space-y-2 mb-4">
              {items.map((item: CartItem, index: number) => (
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

            <CheckoutForm items={items} name={name} email={email} totalAmount={totalPrice} />
          </div>
        </>
      )}
    </main>
  );
};

export default CheckoutPage;
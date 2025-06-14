import React from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';

const CartDrawer: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, decreaseQuantity, isCartOpen, toggleCart } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Your Cart</h2>
        <button onClick={toggleCart} className="text-red-500 hover:text-red-700">Close</button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div>
            {cartItems.map((item, index) => (
              <div key={index} className="mb-4 border-b pb-4">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)}</p>
                <div className="flex items-center mt-2 gap-2">
                  <button
                    onClick={() => decreaseQuantity(item.name)}
                    className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.name, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.name)}
                    className="ml-auto text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              className="mt-6 w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              onClick={async () => {
                try {
                  const res = await fetch('/api/checkout-session', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ items: cartItems }),
                  });

                  const data = await res.json();

                  if (data.url) {
                    router.push(data.url);
                  } else {
                    console.error('Checkout session failed:', data);
                  }
                } catch (error) {
                  console.error('Error creating checkout session:', error);
                }
              }}
            >
              Checkout
            </button>
            <button
              className="mt-3 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
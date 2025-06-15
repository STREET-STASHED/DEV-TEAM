import React from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';

const CartDrawer: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, decreaseQuantity, isCartOpen, toggleCart } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed top-0 right-0 w-full sm:w-96 h-full bg-black text-yellow-400 shadow-lg z-50">
      <div className="flex justify-between items-center p-4 border-b border-yellow-400">
        <h2 className="text-lg font-bold font-graffiti">Your Stash</h2>
        <button onClick={toggleCart} className="text-red-500 hover:text-red-700">Close</button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
        {cartItems.length === 0 ? (
          <p className="text-center italic">Nothing stashed yet.</p>
        ) : (
          <div>
            {cartItems.map((item, index) => (
              <div key={index} className="rounded-lg border border-yellow-400 p-4 bg-gray-900 mb-4">
                <p className="font-semibold text-lg text-yellow-200 font-graffiti">{item.name}</p>
                <p className="text-sm text-yellow-300">Price: ${item.price.toFixed(2)}</p>
                <div className="flex items-center mt-2 gap-2">
                  <button
                    onClick={() => decreaseQuantity(item.name)}
                    className="px-2 py-1 bg-yellow-400 text-black text-sm rounded hover:bg-yellow-300"
                  >
                    -
                  </button>
                  <span className="px-4 font-mono text-yellow-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.name, item.quantity + 1)}
                    className="px-2 py-1 bg-yellow-400 text-black text-sm rounded hover:bg-yellow-300"
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
            <div className="mt-4 font-bold text-right text-xl text-yellow-100 font-mono">
              Total: ${total.toFixed(2)}
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <button
                className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300 font-bold"
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
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
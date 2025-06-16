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
                <p className="text-sm text-yellow-200">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
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
            <div className="mt-4 flex justify-between items-center border-t border-yellow-400 pt-4">
              <span className="text-yellow-300 font-semibold text-lg">Total</span>
              <span className="text-yellow-100 font-bold text-xl font-mono">${total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-2">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-md shadow hover:bg-green-600 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cartItems.length === 0}
                onClick={async () => {
                  if (cartItems.length === 0) {
                    alert('Cart is empty.');
                    return;
                  }

                  try {
                    console.log('Sending cartItems:', cartItems);
                    const res = await fetch('/api/checkout-session', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        items: cartItems.map(item => ({
                          name: item.name,
                          price: item.price,
                          quantity: item.quantity,
                        })),
                      }),
                    });

                    const data = await res.json();
                    console.log('Received response:', data);

                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      console.error('Checkout session failed or URL not found:', data);
                      alert('Checkout failed. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error creating checkout session:', error);
                    alert('An error occurred. Please try again.');
                  }
                }}
              >
                Buy Now
              </button>
              <button
                className="bg-yellow-400 text-black py-2 px-4 rounded-md shadow hover:bg-yellow-300 font-bold transition"
                onClick={toggleCart}
              >
                Keep Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
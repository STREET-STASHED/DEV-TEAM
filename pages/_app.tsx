import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Image from 'next/image';
import Link from 'next/link';
import { CartProvider } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';

const NoAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function CartDrawer() {
  const { cartItems, removeFromCart } = useCart();
  const router = useRouter();

  if (!router.pathname.startsWith('/buyer')) {
    return null;
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed bottom-0 right-0 m-4 p-4 bg-yellow-500 text-black rounded shadow-lg z-50 max-w-xs w-full">
      <p className="font-bold">🛒 Cart ({cartItems.length})</p>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {cartItems.map((item, index) => (
            <li key={index} className="text-sm flex justify-between items-center">
              <span>{item.name} x{item.quantity} (${item.price * item.quantity})</span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {cartItems.length > 0 && (
        <div className="mt-4 text-right font-bold text-sm">
          Total: ${total.toFixed(2)}
        </div>
      )}
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <NoAuthProvider>
        <div className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/background.png')" }}>
          <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
            <Component {...pageProps} />
          </main>
          <CartDrawer />
        </div>
      </NoAuthProvider>
    </CartProvider>
  );
}

export default MyApp;
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import supabase from '../lib/supabaseBrowserClient';
import { useRouter } from 'next/router';
import { CartProvider } from '../context/CartContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../components/Header';
import dynamic from 'next/dynamic';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const NoAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isBuyerFacing =
    router.pathname === '/' ||
    router.pathname === '/welcome' ||
    router.pathname === '/buyer/marketplace' ||
    router.pathname.startsWith('/buyer') ||
    router.pathname.startsWith('/stores');

  // Dynamic import CartDrawer client-side for SSR safety
  const CartDrawer = typeof window !== "undefined"
    ? require('next/dynamic')(() => import('../components/CartDrawer'), { ssr: false })
    : () => null;

  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <NoAuthProvider>
          <div
            className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/background.png')" }}
          >
            {/* Premium header always visible */}
            <Header />
            {/* Prevent content being hidden by fixed header */}
            <div style={{ paddingTop: 80 }}>
              <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
                <Component {...pageProps} />
              </main>
            </div>
            {/* CartDrawer only for buyer/visitor-facing pages */}
            {isBuyerFacing && <CartDrawer />}
          </div>
        </NoAuthProvider>
      </Elements>
    </CartProvider>
  );
}

export default MyApp;
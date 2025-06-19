import '../styles/globals.css';
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CartProvider } from '../context/CartContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const NoAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps & { pageProps: { session: Session | null } }) {
  const router = useRouter();
  const isBuyerFacing =
    !router.pathname.includes('/seller') &&
    !router.pathname.includes('/stylist') &&
    !router.pathname.includes('/driver');

  // Dynamic import CartDrawer client-side for SSR safety
  const CartDrawer = typeof window !== "undefined"
    ? require('next/dynamic')(() => import('../components/CartDrawer'), { ssr: false })
    : () => null;

  return (
    <SessionProvider session={session}>
      <CartProvider>
        <Elements stripe={stripePromise}>
          <NoAuthProvider>
            <div
              className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center bg-fixed"
              style={{ backgroundImage: "url('/background.png')" }}
            >
              <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
                <Component {...pageProps} />
              </main>
              {/* Always render CartDrawer client-side inside CartProvider */}
              {isBuyerFacing && <CartDrawer />}
            </div>
          </NoAuthProvider>
        </Elements>
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;
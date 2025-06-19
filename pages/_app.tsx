import '../styles/globals.css';
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CartProvider } from '../context/CartContext';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('../components/CartDrawer'), { ssr: false });
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

  return (
    <SessionProvider session={session}>
      <Elements stripe={stripePromise}>
        <CartProvider>
          <NoAuthProvider>
            <div
              className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center bg-fixed"
              style={{ backgroundImage: "url('/background.png')" }}
            >
              <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
                <Component {...pageProps} />
              </main>
              {isBuyerFacing && <CartDrawer />}
            </div>
          </NoAuthProvider>
        </CartProvider>
      </Elements>
    </SessionProvider>
  );
}

export default MyApp;
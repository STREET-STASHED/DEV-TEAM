import { useRouter } from 'next/router';
import { CartProvider } from '@/context/CartContext';
import NoAuthProvider from '@/context/NoAuthProvider';
import CartDrawer from '@/components/CartDrawer';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isBuyerRoute = router.pathname.startsWith('/buyer');

  return (
    <NoAuthProvider>
      <CartProvider>
        <div className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center">
          <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
            <Component {...pageProps} />
          </main>
          {isBuyerRoute && <CartDrawer />}
        </div>
      </CartProvider>
    </NoAuthProvider>
  );
}

export default MyApp;
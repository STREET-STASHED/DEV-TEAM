import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { CartProvider } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';

const NoAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isBuyerFacing =
    !router.pathname.includes('/seller') &&
    !router.pathname.includes('/stylist') &&
    !router.pathname.includes('/driver');

  return (
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
  );
}

export default MyApp;
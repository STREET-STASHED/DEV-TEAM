import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';
import { CartProvider } from '../context/CartContext';
import CartDrawer from './CartDrawer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const hideHeaderFooter = ['/signup', '/onboarding/role', '/onboarding/details', '/onboarding/verify'].includes(router.pathname);
  const isBuyerFacing = router.pathname.startsWith('/marketplace') || router.pathname === '/';

  const MainContent = (
    <main className="flex-grow px-6 py-10 flex flex-col gap-8 max-w-6xl mx-auto w-full transition-all duration-300 ease-in-out shadow-lg rounded-lg bg-secondary/80 z-10">
      {children}
    </main>
  );

  return (
    <>
      <Head>
        <title>StreetStashed</title>
        <meta name="description" content="Streetwear Delivered. Culture Curated." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-secondary text-primary flex flex-col relative font-sans">
        <div className="absolute inset-0 bg-graffiti bg-cover bg-center bg-fixed z-[-1]" />
        {!hideHeaderFooter && <Header />}
        <div style={{ paddingTop: 80 }}>
          {isBuyerFacing ? (
            <CartProvider>
              {MainContent}
              <CartDrawer />
            </CartProvider>
          ) : (
            MainContent
          )}
        </div>
        {!hideHeaderFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout;

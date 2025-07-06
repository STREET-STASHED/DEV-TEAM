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
  const isBuyerFacing =
    router.pathname.startsWith('/buyer') ||
    router.pathname.startsWith('/stores') ||
    router.pathname === '/';

  const MainContent = (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10 transition-all duration-300 ease-in-out bg-secondary/80 z-10">
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
      <CartProvider>
        <div className="min-h-screen bg-secondary text-primary flex flex-col relative font-sans">
          <div className="absolute inset-0 bg-graffiti bg-cover bg-center bg-fixed z-[-1]" />
          {!hideHeaderFooter && <Header />}
          {MainContent}
          <CartDrawer />
          {!hideHeaderFooter && <Footer />}
        </div>
      </CartProvider>
    </>
  );
};

export default Layout;

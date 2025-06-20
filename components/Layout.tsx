import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>StreetStashed</title>
        <meta name="description" content="Streetwear Delivered. Culture Curated." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-black text-gold font-urbanist flex flex-col relative">
        <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center opacity-10 pointer-events-none z-0" />
        <Header />
        <main className="flex-grow px-4 py-6 max-w-6xl mx-auto w-full transition-all duration-300 ease-in-out shadow-lg rounded-lg bg-black/80 z-10">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;

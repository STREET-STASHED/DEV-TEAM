import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { CartProvider } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <div className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/background.png')" }}>
        {/*
        <header className="flex items-center justify-between px-6 py-4 border-b border-yellow-400 shadow-lg backdrop-blur-md bg-black/70">
          <Link href="/" passHref>
            <a className="flex items-center space-x-3">
              <Image
                src="/STREETSTASHED LOGO.PNG"
                alt="StreetStashed Logo"
                width={50}
                height={50}
                className="rounded-full hover:opacity-90 transition-opacity"
              />
              <span className="text-yellow-400 text-xl font-urbanist tracking-wide">STREETSTASHED</span>
            </a>
          </Link>
        </header>
        */}
        <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </CartProvider>
  );
}

export default MyApp;
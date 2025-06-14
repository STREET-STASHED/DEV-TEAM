import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { CartProvider } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-graffiti-dark text-gold font-sans bg-cover bg-center" style={{ backgroundImage: "url('/graffiti-texture.jpg')" }}>
        <header className="flex items-center justify-between px-6 py-4 border-b border-gold shadow-lg backdrop-blur-md bg-black/70">
          <Link href="/" passHref>
            <a>
              <Image
                src="/logo.png"
                alt="StreetStashed Logo"
                width={80}
                height={80}
                className="rounded-full hover:opacity-90 transition-opacity"
              />
            </a>
          </Link>
          <h1 className="text-2xl font-bold tracking-wide">StreetStashed</h1>
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <Component {...pageProps} />
        </main>
      </div>
    </CartProvider>
  );
}

export default MyApp;
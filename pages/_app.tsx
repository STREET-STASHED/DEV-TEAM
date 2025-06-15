import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Image from 'next/image';
import Link from 'next/link';

const NoAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NoAuthProvider>
      <div className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/background.png')" }}>
        <main className="px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </NoAuthProvider>
  );
}

export default MyApp;
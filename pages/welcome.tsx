import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gray-50 dark:bg-black px-4 py-12">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-black dark:text-white tracking-tight">
        STREETSTASHED
      </h1>
      {/* Optional Logo */}
      {/* <img src="/logo.png" alt="StreetStashed Logo" className="w-20 h-20 mb-4" /> */}
      <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 max-w-2xl">
        Your 24/7 plug for streetwear, stylists, kicks & essentials — all delivered.
      </p>
      <p className="text-md text-gray-600 dark:text-gray-400 mt-3">
        Shop the drip or join the movement — sell, style, or deliver.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 z-50">
        <Link href="/buyer/marketplace" passHref>
          <a
            aria-label="Start shopping for streetwear"
            className="bg-black text-white font-semibold py-4 px-8 rounded hover:bg-gray-800 w-full sm:w-auto hover:scale-105 transition-transform"
          >
            🛍️ Start Shopping
          </a>
        </Link>
        <Link href="/signup" passHref>
          <a
            aria-label="Join the StreetStashed platform"
            className="bg-gray-100 text-black border border-black font-semibold py-4 px-8 rounded hover:bg-gray-200 w-full sm:w-auto hover:scale-105 transition-transform"
          >
            ✍️ Join the Platform
          </a>
        </Link>
      </div>
    </div>
  );
}
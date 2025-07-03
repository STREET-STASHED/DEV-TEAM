import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-black px-4 py-12">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-white tracking-tight">
        STREETSTASHED
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
        Your 24/7 plug for streetwear, stylists, kicks & essentials — all delivered.
      </p>
      <p className="text-md text-gray-400 mt-3">
        Shop the drip or join the movement — sell, style, or deliver.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
        <Link
          href="/buyer/marketplace"
          aria-label="Start shopping for streetwear"
          className="bg-white text-black font-semibold py-4 px-8 rounded hover:bg-gray-200 w-full sm:w-auto hover:scale-105 transition-transform"
        >
          🛍️ Start Shopping
        </Link>
        <Link
          href="/signup"
          aria-label="Join the StreetStashed platform"
          className="border border-white text-white font-semibold py-4 px-8 rounded hover:bg-white hover:text-black w-full sm:w-auto hover:scale-105 transition-transform"
        >
          ✍️ Join the Platform
        </Link>
        <Link
          href="/login"
          aria-label="Login to your account"
          className="bg-blue-600 text-white font-semibold py-4 px-8 rounded hover:bg-blue-700 w-full sm:w-auto hover:scale-105 transition-transform"
        >
          🔐 Login
        </Link>
      </div>
    </div>
  );
}
import { useRouter } from 'next/router';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-black">
        STREETSTASHED
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-xl">
        The plug for streetwear, stylists, kicks, and culture — delivered 24/7.
      </p>
      <p className="text-md text-gray-600 mt-4">
        Browse the drip or tap in to sell, style, or deliver.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 z-50 relative">
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className="bg-black text-white font-semibold py-4 px-8 rounded hover:bg-gray-800 transition w-full sm:w-auto hover:scale-105 transition-transform"
        >
          🛍️ Start Shopping
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="bg-white text-black border border-black font-semibold py-4 px-8 rounded hover:bg-gray-200 transition w-full sm:w-auto hover:scale-105 transition-transform"
        >
          ✍️ Join the Platform
        </button>
      </div>
    </div>
  );
}
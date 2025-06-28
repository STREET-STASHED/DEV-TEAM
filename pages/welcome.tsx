import { useRouter } from 'next/router';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gray-50 px-4 py-12">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-black tracking-tight">
        STREETSTASHED
      </h1>
      <p className="text-xl md:text-2xl text-gray-800 max-w-2xl">
        Your 24/7 plug for streetwear, stylists, kicks & essentials — all delivered.
      </p>
      <p className="text-md text-gray-600 mt-3">
        Shop the drip or join the movement — sell, style, or deliver.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 z-50">
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className="bg-black text-white font-semibold py-4 px-8 rounded hover:bg-gray-800 transition w-full sm:w-auto hover:scale-105 transition-transform"
        >
          🛍️ Start Shopping
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="bg-gray-100 text-black border border-black font-semibold py-4 px-8 rounded hover:bg-gray-200 transition w-full sm:w-auto hover:scale-105 transition-transform"
        >
          ✍️ Join the Platform
        </button>
      </div>
    </div>
  );
}
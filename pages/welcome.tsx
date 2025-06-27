import { useRouter } from 'next/router';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-black">
        Welcome to STREETSTASHED
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-xl">
        The future of fashion delivery. Tap in to browse the culture or become part of the movement.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 z-50 relative">
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className="bg-black text-white font-semibold py-3 px-6 rounded hover:bg-gray-900 transition w-full sm:w-auto hover:scale-105 transition-transform"
        >
          🔍 Browse Drops
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="bg-white text-black border border-black font-semibold py-3 px-6 rounded hover:bg-gray-100 transition w-full sm:w-auto hover:scale-105 transition-transform"
        >
          🚀 Join as Seller, Stylist or Driver
        </button>
      </div>
    </div>
  );
}
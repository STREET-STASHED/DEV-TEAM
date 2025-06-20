import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      router.push(`/${storedRole}/dashboard`);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti px-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-widest uppercase mb-6 drop-shadow-lg">
        Welcome to STREETSTASHED
      </h1>
      <p className="mb-10 text-lg text-yellow-300 max-w-xl">
        The future of fashion delivery. Tap in to browse the culture or become part of the movement.
      </p>
      <div className="flex flex-col md:flex-row gap-6">
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg transition"
        >
          🔍 Browse Drops
        </button>
        <button
          onClick={() => router.push('/onboarding/details')}
          className="bg-white hover:bg-yellow-200 text-black font-bold py-3 px-8 rounded-full text-lg transition"
        >
          🚀 Join as Seller, Stylist or Driver
        </button>
      </div>
    </div>
  );
}
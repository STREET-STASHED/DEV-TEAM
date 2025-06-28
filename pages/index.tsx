import { useRouter } from 'next/router';
import supabase from "@/lib/supabaseClient";

export default function IndexPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-extrabold mb-6">StreetStashed</h1>
        <p className="text-lg text-gray-300 mb-8">
          The future of fashion delivery. Browse exclusive drops, or sign up as a seller, stylist, or driver.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300 transition"
            onClick={() => router.push('/signup')}
          >
            Join Us
          </button>
          <button
            className="px-8 py-3 border border-white text-white rounded hover:bg-white hover:text-black transition"
            onClick={() => router.push('/buyer/marketplace')}
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}

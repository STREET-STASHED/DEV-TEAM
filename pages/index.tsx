import { useRouter } from 'next/router';
import supabase from "@/lib/supabaseClient";

export default function IndexPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to StreetStashed</h1>
        <p className="text-lg text-gray-700 mb-6">
          The future of fashion delivery. Tap in to browse the culture or become a seller, stylist, or driver.
        </p>
        <div className="flex flex-col items-center gap-4">
          <button
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            onClick={() => router.push('/signup')}
          >
            Join Us
          </button>
          <button
            className="px-6 py-2 bg-white text-black border border-black rounded hover:bg-gray-100"
            onClick={() => router.push('/start')}
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}

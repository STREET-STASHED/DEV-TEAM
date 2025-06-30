import { useRouter } from 'next/router';
import supabase from "@/lib/supabaseClient";

export default function IndexPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-white mb-4">STREETSTASHED</h1>
        <p className="text-lg text-gray-300 mb-6">
          Your 24/7 plug for streetwear, stylists, kicks & essentials — all delivered.
        </p>
        <p className="text-sm text-gray-400 mb-10">
          Shop the drip or join the movement — sell, style, or deliver.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            className="px-8 py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
            onClick={() => router.push('/buyer/marketplace')}
          >
            🛍️ Start Shopping
          </button>
          <button
            className="px-8 py-3 border border-white text-white font-semibold rounded hover:bg-white hover:text-black transition"
            onClick={() => router.push('/signup')}
          >
            ✍️ Join the Platform
          </button>
        </div>
      </div>
    </div>
  );
}

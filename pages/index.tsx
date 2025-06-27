import { useRouter } from 'next/router';
import supabase from "@/lib/ssupabaseClient";

export default function IndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to StreetStashed</h1>
        <p className="text-lg text-gray-700">
          The future of fashion delivery. Tap in to browse the culture or become a seller, stylist, or driver.
        </p>
      </div>
    </div>
  );
}

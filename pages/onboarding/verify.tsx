

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function VerifyStep() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Mark as verified
    await supabase.from('users').update({ verified: true }).eq('id', user.id);

    // Fetch user role
    const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (error || !data?.role) {
      setLoading(false);
      return;
    }

    const redirectMap: Record<string, string> = {
      buyer: '/buyer/marketplace',
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
    };

    router.push(redirectMap[data.role] || '/');
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold">Final Step: Verify & Launch</h2>
      <p className="text-gray-700">
        You're almost ready to go! We'll use this step to collect documents or verify your ID in the future.
      </p>
      <p className="text-gray-700">For now, click below to continue and start using the platform.</p>
      <button
        onClick={handleContinue}
        disabled={loading}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded w-full"
      >
        {loading ? 'Processing...' : 'Continue to Dashboard'}
      </button>
    </div>
  );
}
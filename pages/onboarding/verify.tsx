

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
    <div>
      <h2>Verification Step</h2>
      <p>We'll use this page to collect documents or verify your ID in the future.</p>
      <p>For now, click below to continue onboarding.</p>
      <button onClick={handleContinue} disabled={loading}>
        {loading ? 'Processing...' : 'Continue'}
      </button>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function VerifyStep() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding/details');
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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';

export default function VerifyStep() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error fetching user:', userError);
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ verified: true })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user as verified:', updateError);
        setLoading(false);
        return;
      }

      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('role, details_complete')
        .eq('id', user.id)
        .single();

      if (userFetchError || !userData?.role || !userData?.details_complete) {
        console.error('User is missing role or details:', userFetchError);
        setLoading(false);
        return;
      }

      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
      };

      router.push(redirectMap[userData.role] || '/');
    } catch (err) {
      console.error('Unexpected error in verification:', err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-black text-white shadow rounded-lg">
      <h2 className="text-3xl font-bold">You're All Set</h2>
      <p className="text-white">
        We’ve saved your info and set everything up. Click below to launch your dashboard and start earning.
      </p>
      <button
        onClick={handleContinue}
        disabled={loading}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded w-full"
      >
        {loading ? 'Finishing up...' : 'Go to Dashboard'}
      </button>
    </div>
  );
}
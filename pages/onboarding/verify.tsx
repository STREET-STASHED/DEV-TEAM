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

      const { data: roleData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (roleError || !roleData?.role) {
        console.error('Error fetching user role:', roleError);
        setLoading(false);
        return;
      }

      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
      };

      router.push(redirectMap[roleData.role] || '/');
    } catch (err) {
      console.error('Unexpected error in verification:', err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold">Final Step: Verify & Launch</h2>
      <p className="text-gray-700">
        You're almost ready to go! This step will soon allow us to collect documents or verify your ID.
      </p>
      <p className="text-gray-700">For now, click below to finish setup and start using the platform.</p>
      <button
        onClick={handleContinue}
        disabled={loading}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded w-full"
      >
        {loading ? 'Processing...' : 'Finish & Launch'}
      </button>
    </div>
  );
}
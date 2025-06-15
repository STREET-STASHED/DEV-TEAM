import { useRouter } from 'next/router';
import { useState } from 'react';
import supabase from '../lib/supabaseClient';

const OnboardingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  const selectRole = async (role: string) => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        alert('User not logged in');
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      const { error: updateError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (updateError) {
        alert('Failed to update role');
        console.error(updateError.message);
        return;
      }

      // Redirect to correct dashboard
      const roleRedirectMap: { [key: string]: string } = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
      };

      router.push(roleRedirectMap[role] || '/');
    } catch (err) {
      console.error('Unexpected error in selectRole:', err);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-cover bg-center text-yellow-400 font-graffiti px-4 sm:px-8" style={{ backgroundImage: "url('/background.png')" }}>
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold text-center">Welcome to STREETSTASHED</h1>
        <p className="text-yellow-300 text-center text-lg">Pick your role to unlock your lane in the culture.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 w-full max-w-md">
        <button
          onClick={() => selectRole('buyer')}
          className="bg-yellow-400 text-black py-3 rounded-lg font-bold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          🛍️ I'm a Buyer
        </button>
        <button
          onClick={() => selectRole('seller')}
          className="bg-yellow-400 text-black py-3 rounded-lg font-bold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          🏪 I'm a Seller
        </button>
        <button
          onClick={() => selectRole('stylist')}
          className="bg-yellow-400 text-black py-3 rounded-lg font-bold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          💅 I'm a Stylist
        </button>
        <button
          onClick={() => selectRole('driver')}
          className="bg-yellow-400 text-black py-3 rounded-lg font-bold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          🚗 I'm a Driver
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
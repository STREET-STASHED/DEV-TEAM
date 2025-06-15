import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';

const OnboardingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
      }
    };
    checkSession();
  }, []);

  const selectRole = async (role: string) => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      alert('User not logged in');
      return;
    }
  
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, role });

    if (error) {
      alert('Failed to update role');
      setLoading(false);
      return;
    }

    // Redirect to correct dashboard
    switch (role) {
      case 'buyer':
        router.push('/buyer/marketplace');
        break;
      case 'seller':
        router.push('/seller/dashboard');
        break;
      case 'stylist':
        router.push('/stylist/dashboard');
        break;
      case 'driver':
        router.push('/driver/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-cover bg-center text-yellow-400 font-graffiti px-4 sm:px-8" style={{ backgroundImage: "url('/background.png')" }}>
      <div className="flex flex-col items-center space-y-4">
        <img src="/logo.png" alt="StreetStashed Logo" className="w-20 h-20" />
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
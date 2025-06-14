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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to StreetStashed</h1>
      <p className="mb-4 text-gray-600">Choose your role to get started:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => selectRole('buyer')}
          className="bg-black text-white py-3 rounded"
          disabled={loading}
        >
          I'm a Buyer
        </button>
        <button
          onClick={() => selectRole('seller')}
          className="bg-black text-white py-3 rounded"
          disabled={loading}
        >
          I'm a Seller
        </button>
        <button
          onClick={() => selectRole('stylist')}
          className="bg-black text-white py-3 rounded"
          disabled={loading}
        >
          I'm a Stylist
        </button>
        <button
          onClick={() => selectRole('driver')}
          className="bg-black text-white py-3 rounded"
          disabled={loading}
        >
          I'm a Driver
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
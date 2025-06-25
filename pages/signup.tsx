import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (router.query.isSignUp === 'true') setIsSignUp(true);
    else if (router.query.isSignUp === 'false') setIsSignUp(false);
  }, [router.query.isSignUp]);

  const handleRedirectAfterLogin = async (userId: string | undefined) => {
    if (!userId) {
      router.replace('/onboarding');
      return;
    }

    const { data: userInfo, error: userErr } = await supabase
      .from('users')
      .select('role, details_complete, verified')
      .eq('id', userId)
      .single();

    if (userErr || !userInfo) {
      console.error('User fetch error:', userErr);
      router.replace('/onboarding/details');
      return;
    }

    if (!userInfo.details_complete) return router.replace('/onboarding/details');
    if (!userInfo.role) return router.replace('/onboarding/role');
    if (!userInfo.verified) return router.replace('/onboarding/verify');

    const roleRedirectMap: Record<string, string> = {
      seller: '/seller/dashboard',
      stylist: '/stylist/dashboard',
      driver: '/driver/dashboard',
      buyer: '/buyer/marketplace',
    };

    return router.replace(roleRedirectMap[userInfo.role] || '/onboarding/details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { signIn } = await import('next-auth/react');
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!signInRes || signInRes.error) {
        throw new Error(signInRes?.error || 'Authentication failed');
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      await handleRedirectAfterLogin(userId);
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || 'There was an issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url(/graffiti-bg.png)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-black bg-opacity-85 p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-yellow-500 flex flex-col items-center space-y-4"
      >
        <img src="/logo.png" alt="StreetStashed Logo" className="h-14 mb-2" />
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-4 text-center drop-shadow">
          {isSignUp ? 'Create your StreetStashed account' : 'Login to StreetStashed'}
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg mb-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg mb-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition duration-200 disabled:opacity-50 shadow-lg"
          disabled={loading}
        >
          {loading ? (isSignUp ? 'Creating account...' : 'Logging in...') : (isSignUp ? 'Create Account' : 'Login')}
        </button>

        <p className="mt-2 text-center text-sm text-white font-medium">
          {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-yellow-400 underline hover:text-yellow-300 transition"
            disabled={loading}
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  );
}
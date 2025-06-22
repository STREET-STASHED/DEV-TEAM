import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  // This unified component handles both login and sign-up flows depending on isSignUp state
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ensure signup mode is set from query param
  useEffect(() => {
    if (router.query.isSignUp !== 'false') {
      setIsSignUp(true);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      let authRes;

      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {},
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            alert('User already registered. Please log in instead.');
            setIsSignUp(false);
            setLoading(false);
            return;
          }
          throw signUpError;
        }

        if (!signUpData.user) throw new Error('User creation failed');

        const { data: existingUsers, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', signUpData.user.id);

        if (fetchError) throw new Error('Could not check for existing user.');

        if (!existingUsers || existingUsers.length === 0) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              id: signUpData.user.id,
              email: signUpData.user.email,
              role: null,
              details_complete: false,
              verified: false
            }]);
          if (insertError) throw new Error('User creation failed in DB.');
        }

        // After signup, begin onboarding step-by-step
        const userId = signUpData.user.id;

        router.replace('/onboarding/details');
        setLoading(false);
        return;
      } else {
        const { signIn } = await import('next-auth/react');
        const signInRes = await signIn('credentials', {
          email,
          password,
          callbackUrl: `/auth/callback?role=unknown`
        });
        if (!signInRes || signInRes.error) {
          throw new Error(signInRes?.error || 'Login failed');
        }
        const session = await supabase.auth.getSession();
        const userId = session.data.session?.user.id;

        if (!userId) {
          throw new Error('Failed to fetch user ID from session.');
        }
      }

      // Fetch the user's role from the users table for robust redirect
      // Ensure userId is defined for both sign up and login flows
      let userId: string | undefined;
      if (isSignUp) {
        // userId is already set in sign up flow above
        // (see: const userId = signUpData.user.id;)
        // But we need to move it to a higher scope
        // So, move the declaration above
        // Already handled above, so do nothing here
        // userId will be set below for login
      } else {
        const session = await supabase.auth.getSession();
        userId = session.data.session?.user.id;
        if (!userId) {
          throw new Error('Failed to fetch user ID from session.');
        }
      }
      if (isSignUp) {
        // userId was set above in sign up flow
        userId = (await supabase.auth.getSession()).data.session?.user.id;
      }

      let dbRole;
      try {
        const { data: userRow, error: dbErr } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (dbErr || !userRow || !userRow.role) {
          throw new Error('User role not found. Redirecting to onboarding.');
        }

        dbRole = userRow.role;
        console.log('Fetched user role from DB:', dbRole);
      } catch (err) {
        console.error('Role fetch error:', err);
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
        return router.replace('/onboarding/details');
      }

      if (!userInfo.details_complete) {
        return router.replace('/onboarding/details');
      }

      if (!userInfo.role) {
        return router.replace('/onboarding/role');
      }

      if (!userInfo.verified) {
        return router.replace('/onboarding/verify');
      }

      const roleRedirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
      };

      if (userInfo.role in roleRedirectMap) {
        return router.replace(roleRedirectMap[userInfo.role]);
      }

      router.replace('/onboarding/details');
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
        {/* Optional: Logo */}
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

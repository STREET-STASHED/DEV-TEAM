import { useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import { signIn } from 'next-auth/react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // Toggle for signup/login
  const router = useRouter();
  const redirectToDetails = '/onboarding/details';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let authResponse;

      if (isSignUp) {
        // Sign up new user
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              created_from: 'web',
            },
          },
        });

        if (authResponse.error) {
          throw authResponse.error;
        }

        const user = authResponse.data?.user;
        if (user && user.id) {
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            role: null,
            details_complete: false,
            verified: false,
          });
          // After signup, go directly to role selection first
          router.push('/onboarding/role');
        }
      } else {
        // Sign in existing user
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
        if (userId) {
          const { data: userData } = await supabase
            .from('users')
            .select('details_complete, role, verified')
            .eq('id', userId)
            .single();

          if (!userData?.role) {
            router.push('/onboarding/role');
          } else if (!userData?.details_complete) {
            router.push('/onboarding/details');
          } else if (!userData?.verified) {
            router.push('/onboarding/verify');
          } else {
            router.push('/buyer'); // default dashboard
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || 'There was an issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-black/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-yellow-400"
      >
        <h1 className="text-3xl font-extrabold text-center text-yellow-400">
          {isSignUp ? 'Create Account' : 'Login'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-gray-900 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-gray-900 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>

        <p
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-center cursor-pointer hover:underline text-yellow-400"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </p>
      </form>
    </div>
  );
};

export default Signup;
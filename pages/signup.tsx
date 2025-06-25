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

        const userId = authResponse.data?.user?.id;
        if (userId) {
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
          router.push('/onboarding/role');
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
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#111] p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-2">
          {isSignUp ? 'Create Account' : 'Login'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 bg-gray-800 rounded text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 bg-gray-800 rounded text-white"
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
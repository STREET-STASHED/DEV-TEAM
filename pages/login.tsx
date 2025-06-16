import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let authRes;
      if (isSignUp) {
        authRes = await supabase.auth.signUp({ email, password });

        if (authRes.error) throw authRes.error;

        const selectedRole = prompt('What is your role? (buyer, seller, stylist, driver)');
        if (!selectedRole) throw new Error('Role is required');

        // Note: The /api/set-role endpoint should store the `role` in your Supabase `users` table mapped by `email`.
        const roleRes = await fetch('/api/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: selectedRole }),
        });

        if (!roleRes.ok) throw new Error('Failed to set role');
      } else {
        authRes = await supabase.auth.signInWithPassword({ email, password });
        if (authRes.error) throw authRes.error;
      }

      // fetch user role after auth
      const res = await fetch('/api/get-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Failed to fetch role');

      const data = await res.json();
      const role = data.role;

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
          router.push('/onboarding');
          break;
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('There was an issue. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded shadow-md">
        <h1 className="text-2xl mb-4 font-bold text-center">Login to StreetStashed</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 text-black rounded"
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 text-black rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-bold py-2 px-4 rounded hover:bg-yellow-400"
        >
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        <p className="mt-4 text-center text-sm">
          {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-yellow-400 underline"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  );
}

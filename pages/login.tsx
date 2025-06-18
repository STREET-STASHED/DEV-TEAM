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
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let authRes;
      if (isSignUp) {
        // Attempt sign-up with metadata
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } }
        });
        if (signUpError) {
          // If user already registered, fall back to login
          if (signUpError.status === 400 && signUpError.message.includes('already registered')) {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
            if (loginError) throw loginError;
            authRes = { data: { user: loginData.user }, error: null };
          } else {
            throw signUpError;
          }
        } else {
          console.log('Supabase returned user_metadata:', signUpData.user?.user_metadata);
          authRes = { data: { user: signUpData.user }, error: null };
        }
      } else {
        authRes = await supabase.auth.signInWithPassword({ email, password });
        if (authRes.error) throw authRes.error;
      }

      const res = await fetch('/api/get-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: authRes.data.user?.id, email }),
      });

      if (!res.ok) {
        console.error('Get role failed:', await res.text());
        throw new Error('Failed to fetch role');
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Failed to parse role response:', jsonErr);
        throw new Error('Invalid role response');
      }

      const userRole = data.role;
      if (!userRole) {
        console.error('Role missing in response:', data);
        throw new Error('No role assigned to this user');
      }

      const userId = authRes.data.user?.id;

      if (!userId) {
        throw new Error('User ID missing after login');
      }

      switch (userRole) {
        case 'buyer':
          router.push(`/buyer/dashboard?userId=${userId}`);
          break;
        case 'seller':
          router.push(`/seller/dashboard?userId=${userId}`);
          break;
        case 'stylist':
          router.push(`/stylist/dashboard?userId=${userId}`);
          break;
        case 'driver':
          router.push(`/driver/dashboard?userId=${userId}`);
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
        {isSignUp && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 mb-4 text-black rounded"
            required
          >
            <option value="">Select your role</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="stylist">Stylist</option>
            <option value="driver">Driver</option>
          </select>
        )}
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

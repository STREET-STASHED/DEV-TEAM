import { useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      setMessage('Login failed. Please try again.');
    } else {
      setMessage('Magic link sent! Check your email to log in.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md text-center"
      >
        <img
          src="/logo.png"
          alt="StreetStashed Logo"
          className="w-20 h-20 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-2">Welcome to StreetStashed</h1>
        <p className="text-sm text-gray-400 mb-6">Login to access the drop</p>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-700 bg-black rounded mb-4 text-white placeholder-gray-500"
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded transition duration-200"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
        {message && (
          <p className="mt-4 text-sm text-yellow-400">{message}</p>
        )}
      </form>
    </div>
  );
   }

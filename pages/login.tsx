// pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.error('Login error:', error?.message);
      setError(error?.message || 'Login failed');
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError.message);
      setError('Failed to fetch profile');
      return;
    }

    try {
      const redirectResponse = await fetch('/functions/v1/handle-redirect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.session?.access_token}`
        },
        body: JSON.stringify({ user_id: data.user.id })
      });

      const redirectData = await redirectResponse.json();
      if (redirectData.redirectTo) {
        await router.replace(redirectData.redirectTo);
        if (redirectData.redirectTo === '/onboarding') {
          router.reload(); // Optional to reload fresh state
        }
      } else {
        await router.replace('/onboarding'); // Fallback
      }
    } catch (redirectError) {
      console.error('[ROUTING FALLBACK ERROR]', redirectError);
      await router.replace('/onboarding');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded"
      >
        Login
      </button>
      {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
    </form>
  );
}
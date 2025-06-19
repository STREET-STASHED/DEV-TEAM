import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      let authRes;

      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'buyer' }, // default role to buyer
          },
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

        // Only insert if user row does not exist
        const { data: existingUsers, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', signUpData.user.id);

        if (fetchError) {
          console.error('Failed to check user existence:', fetchError);
          throw new Error('Could not check for existing user.');
        }

        if (!existingUsers || existingUsers.length === 0) {
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([{ id: signUpData.user.id, email: signUpData.user.email, role: 'buyer' }]);
          if (insertError) {
            if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
              alert('User already exists. Please log in.');
              setIsSignUp(false);
              setLoading(false);
              return;
            }
            console.error('Failed to insert user:', insertError);
            throw new Error('User database creation failed');
          }
        }

        authRes = { data: { user: signUpData.user }, error: null };
      } else {
        authRes = await supabase.auth.signInWithPassword({ email, password });
        if (authRes.error) throw authRes.error;
      }

      const userId = authRes.data.user?.id;
      if (!userId) throw new Error('Missing user ID');

      const roleFromMetadata = authRes.data.user?.user_metadata?.role || 'buyer';

      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/onboarding',
        stylist: '/onboarding',
        driver: '/onboarding',
      };

      router.push(`${redirectMap[roleFromMetadata] || '/onboarding'}?userId=${userId}`);
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || 'There was an issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl mb-4 font-bold text-center">Login to StreetStashed</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 text-black rounded"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 text-black rounded"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign Up' : 'Login')}
        </button>
        <p className="mt-4 text-center text-sm">
          {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-yellow-400 underline"
            disabled={loading}
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  );
}

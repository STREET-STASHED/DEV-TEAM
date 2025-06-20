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

      // Fetch the user's role from the users table for robust redirect
      let dbRole = 'buyer';
      try {
        const { data: userRow, error: dbErr } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (dbErr) throw dbErr;
        if (userRow && userRow.role) dbRole = userRow.role;
      } catch (err) {
        console.warn('Could not fetch role from DB, falling back to metadata:', err);
        dbRole = authRes.data.user?.user_metadata?.role || 'buyer';
      }

      const redirectMap: Record<string, string> = {
        buyer: '/buyer/marketplace',
        seller: '/seller/dashboard',
        stylist: '/stylist/dashboard',
        driver: '/driver/dashboard',
      };

      // Redirect robustly based on role
      if (dbRole === 'buyer' || dbRole === 'visitor') {
        // Buyers and visitors go to the marketplace
        router.replace('/buyer/marketplace');
      } else if (redirectMap[dbRole]) {
        // All other roles go to their dashboard
        router.replace(redirectMap[dbRole]);
      } else {
        // If no role found, go to onboarding to finish setup
        router.replace('/onboarding');
      }
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
      style={{ backgroundImage: 'url(/bg/paint-splatter.jpg)' }} // update path as needed
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

import { useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseBrowserClient';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // Toggle for signup/login
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              created_from: 'web',
              email_confirmed_at: new Date().toISOString(),
            },
          },
        });

        if (authResponse.error) {
          throw authResponse.error;
        }

        const user = authResponse.data?.user ?? authResponse.data?.session?.user;
        if (!user?.id) {
          console.error('Signup succeeded but no user ID returned');
          setErrorMessage('Signup issue. Please try again.');
          setLoading(false);
          return;
        }

        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          role: null,
          details_complete: false,
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          is_anonymous: false,
          onboarded: false
        });

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !signInData.session) {
          setErrorMessage(signInError?.message || 'Authentication failed');
          setLoading(false);
          return;
        }

        router.push('/onboarding/role');
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !signInData.session) {
          setErrorMessage(signInError?.message || 'Authentication failed');
          setLoading(false);
          return;
        }

        const userId = signInData.session.user.id;

        const { data: userData } = await supabase
          .from('users')
          .select('is_details_complete, role, is_verified')
          .eq('id', userId)
          .maybeSingle();

        if (!userData) {
          router.push('/onboarding/role');
          setLoading(false);
          return;
        }

        if (!userData?.role) {
          router.push('/onboarding/role');
        } else if (!userData?.is_details_complete) {
          router.push('/onboarding/details');
        } else if (!userData?.is_verified) {
          router.push('/onboarding/verify');
        } else {
          switch (userData.role) {
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
              router.push('/buyer/marketplace');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setLoading(false);
      setErrorMessage(error.message || 'There was an issue. Please try again.');
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

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}

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
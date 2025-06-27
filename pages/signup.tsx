import { useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';
import Cookies from 'js-cookie';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // Toggle for signup/login
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();

  const handleRedirect = (userData: any) => {
    if (userData?.role) {
      Cookies.set('user-role', userData.role, { expires: 7 });
    }
    if (!userData?.role) {
      router.push('/onboarding/role');
    } else if (!userData.details_complete) {
      router.push('/onboarding/details');
    } else if (!userData.onboarded) {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email.includes('@') || email.length < 5) {
      setErrorMessage('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        try {
          const authResponse = await supabase.auth.signUp({
            email,
            password,
          });

          const { user, session } = authResponse.data;
          const error = authResponse.error;

          if (error) {
            console.error('Signup error:', error.message);
            setErrorMessage('Signup failed. Please try again.');
            setInitError('Something went wrong during signup. Please refresh and try again.');
            setLoading(false);
            return;
          }

          if (!user) {
            console.warn("Signup succeeded but no user returned — possibly due to email confirmation being required.");
            setErrorMessage("Check your email to confirm your account.");
            setLoading(false);
            return;
          }

          try {
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                email: user.email,
                role: null,
                details_complete: false,
                verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                onboarded: false,
              });

            if (upsertError) {
              console.error("Upsert error:", upsertError);
              setErrorMessage('There was an issue saving your information. Please try again.');
              setInitError('Something went wrong during signup. Please refresh and try again.');
              setLoading(false);
              return;
            }
          } catch (upsertCatchError) {
            console.error("Upsert exception:", upsertCatchError);
            setInitError('Something went wrong during signup. Please refresh and try again.');
            setLoading(false);
            return;
          }

          router.replace('/onboarding/role');
        } catch (signUpCatchError) {
          console.error("Signup exception:", signUpCatchError);
          setInitError('Something went wrong during signup. Please refresh and try again.');
          setLoading(false);
          return;
        }
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

        try {
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('details_complete, role, verified, onboarded')
            .eq('id', userId)
            .maybeSingle();

          if (fetchError) throw fetchError;

          handleRedirect(userData);

          if (userData?.role) {
            Cookies.set('user-role', userData.role, { expires: 7 });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setErrorMessage('Could not load user profile. Please try again.');
        }

        setLoading(false);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setLoading(false);
      setErrorMessage(error.message || 'There was an issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 font-semibold">{initError}</p>
      </div>
    );
  }

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

export default AuthScreen;
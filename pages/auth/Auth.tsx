import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

const validateEmail = (email: string): boolean => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export default function AuthComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-up');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!validatePassword(password)) {
        throw new Error('Password must be at least 6 characters long');
      }

      const trimmedEmail = email.trim().toLowerCase();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            role: 'buyer',
            full_name: null,
            has_completed_onboarding: false,
            details_complete: false,
            onboarding_step: 'role',
            verified: false
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        router.push('/onboarding/role');
      } else {
        setMessage('Success! Please check your email for the confirmation link.');
        setView('sign-in');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!validateEmail(normalizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      if (!validatePassword(password)) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) throw error;

      if (data.session || data.user) {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={view === 'sign-up' ? handleSignUp : handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? (view === 'sign-up' ? 'Signing up...' : 'Signing in...') : (view === 'sign-up' ? 'Sign Up' : 'Sign In')}
      </button>
      <p>
        {view === 'sign-up' ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setView('sign-in')}>Sign in</button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button type="button" onClick={() => setView('sign-up')}>Sign up</button>
          </>
        )}
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </form>
  );
}
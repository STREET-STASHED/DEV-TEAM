'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient, AuthError } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type AuthMode = 'signin' | 'signup';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { email, password, confirmPassword, fullName } = formData;
    if (!email || !password || (mode === 'signup' && (password !== confirmPassword || !fullName))) {
      setError('Please fill out all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined'
              ? `${window.location.origin}/auth/verify-email`
              : undefined,
            data: { full_name: fullName }
          }
        });
        if (signUpError) throw signUpError;
        // Navigate based on whether session exists
        if (data.user && data.session) {
          router.push('/onboarding/role');
        } else {
          router.push('/auth/verify-email');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        router.push('/onboarding/role');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{mode === 'signin' ? 'Welcome Back' : 'Create an Account'}</h2>
        <p>
          {mode === 'signin'
            ? 'Sign in to access your account'
            : 'Sign up to get started with our platform'}
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {mode === 'signin' && (
            <div className="forgot-password">
              <Link href="/auth/reset-password"><a>Forgot password?</a></Link>
            </div>
          )}
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading
              ? (mode === 'signin' ? 'Signing In...' : 'Creating Account...')
              : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            {mode === 'signin'
              ? "Don't have an account? "
              : "Already have an account? "}
            <button type="button" className="link-button" onClick={toggleMode}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
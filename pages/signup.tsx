import { useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import { signIn } from 'next-auth/react';

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [isSignUp, setIsSignUp] = useState(true); // Toggle for signup/login
const router = useRouter();
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    let authResponse;

    if (isSignUp) {
      // Sign up new user
      authResponse = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // You can extend this with other user metadata
            created_from: 'web',
          },
        },
      });

      if (authResponse.error) {
        throw authResponse.error;
      }

      const userId = authResponse.data?.user?.id;
      if (userId) {
        router.push('/onboarding/role');
      }
    } else {
      // Sign in existing user
      const { signIn } = await import('next-auth/react');
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!signInRes || signInRes.error) {
        throw new Error(signInRes?.error || 'Authentication failed');
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        router.push('/onboarding/role');
      }
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    alert(error.message || 'There was an issue. Please try again.');
  } finally {
    setLoading(false);
  }
};
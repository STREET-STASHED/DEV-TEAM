// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '../../hooks/useSupabase';

export default function AuthCallback() {
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash or query parameters
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        if (!hash && !code) {
          throw new Error('No code or hash found in URL');
        }
        
        // Exchange the code for a session
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          // Redirect to dashboard or home page after successful authentication
          if (data.session) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        router.push('/auth?error=callback_error');
      }
    };
    
    // Only run the callback handler if we have a code in the URL
    if (router.query.code) {
      handleAuthCallback();
    }
  }, [router.query.code, router, supabase.auth]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Processing authentication...</p>
    </div>
  );
}
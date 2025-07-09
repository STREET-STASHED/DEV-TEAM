import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/router'
import OnboardingFlow from '../components/OnboardingFlow.tsx'
import AuthForm from '../components/Auth.tsx'
import { SupabaseProvider } from '../context/SupabaseContext.tsx'


const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function MyAppWrapper({ Component, pageProps }: AppProps) {
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <AuthForm />
  }

  const isOnboardingPage = router.pathname.startsWith('/onboarding');

  return (
    <>
      {isOnboardingPage ? (
        <OnboardingFlow />
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <SupabaseProvider>
      <MyAppWrapper {...props} />
    </SupabaseProvider>
  )
}
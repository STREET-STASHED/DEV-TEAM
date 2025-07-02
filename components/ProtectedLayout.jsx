

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createBrowserClient } from '@supabase/ssr'
import { useOnboarding } from '../hooks/useOnboarding'

export default function ProtectedLayout({ children, supabaseClient }) {
  const router = useRouter()
  const supabase = supabaseClient || createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { checkOnboardingStatus } = useOnboarding()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        router.push('/login')
        return
      }

      checkUserOnboarding()
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null)
          checkUserOnboarding()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          router.push('/login')
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router.pathname])

  async function checkUserOnboarding() {
    if (!user) return

    try {
      const isOnboardingComplete = await checkOnboardingStatus()

      if (!isOnboardingComplete && router.pathname !== '/onboarding') {
        router.push('/onboarding')
        return
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
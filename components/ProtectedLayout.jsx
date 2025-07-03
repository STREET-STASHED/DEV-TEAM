import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { createBrowserClient } from '@supabase/ssr'
import { useOnboarding } from '../hooks/useOnboarding'

export default function ProtectedLayout({ children, supabaseClient }) {
  const router = useRouter()
  const supabase = useMemo(() => {
    return supabaseClient || createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }, [supabaseClient])

  const { checkOnboardingStatus } = useOnboarding()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const publicRoutes = ['/', '/welcome', '/marketplace', '/stores', '/stylist-booking']
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        if (!router.pathname.startsWith('/login') && !publicRoutes.includes(router.pathname)) {
          router.push(`/login?redirectedFrom=${router.pathname}`)
        }
        return
      }

      checkUserOnboarding(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null)
          checkUserOnboarding(session?.user || null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          if (!router.pathname.startsWith('/login') && !publicRoutes.includes(router.pathname)) {
            router.push('/login')
          }
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router.pathname])

  async function checkUserOnboarding(currentUser) {
    if (!currentUser) return

    try {
      const isOnboardingComplete = await checkOnboardingStatus()

      const { data, error } = await supabase
        .from('profiles')
        .select('role, onboarding_step')
        .eq('id', currentUser.id)
        .single()

      if (!data || error) {
        console.error('Error fetching role/onboarding_step:', error)
        return
      }

      const { role, onboarding_step } = data

      if (!isOnboardingComplete) {
        if (onboarding_step === 'role') {
          router.push('/onboarding/role')
        } else if (onboarding_step === 'details') {
          router.push('/onboarding/details')
        } else if (onboarding_step === 'verify') {
          router.push('/onboarding/verify')
        } else {
          router.push('/onboarding/role')
        }
        return
      }

      setIsLoading(false)

      if (!role || typeof role !== 'string') {
        console.warn('Invalid or missing role; redirecting to generic dashboard')
        router.push('/dashboard')
        return
      }

      if (router.pathname === '/dashboard' || router.pathname === '/') {
        switch (role) {
          case 'buyer':
            router.push('/buyer/dashboard')
            break
          case 'seller':
            router.push('/seller/dashboard')
            break
          case 'stylist':
            router.push('/stylist/dashboard')
            break
          case 'driver':
            router.push('/driver/dashboard')
            break
          default:
            router.push('/dashboard')
        }
      }
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
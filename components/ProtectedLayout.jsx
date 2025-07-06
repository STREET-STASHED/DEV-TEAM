import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedLayout({ children, supabaseClient }) {
  const router = useRouter()
  const supabaseInstance = supabaseClient || supabase

  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const publicRoutes = ['/', '/welcome', '/marketplace', '/stores', '/stylist-booking', '/onboarding/details', '/onboarding/role', '/onboarding/verify']

    const fetchUserAndRedirect = async () => {
      const { data: { user } } = await supabaseInstance.auth.getUser()
      setUser(user)

      if (!user) {
        if (!router.pathname.startsWith('/login') && !publicRoutes.includes(router.pathname)) {
          router.push(`/login?redirectedFrom=${router.pathname}`)
        }
        return
      }

      const { data, error } = await supabaseInstance
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!data || error) {
        console.error('Error fetching role from profiles table:', error)
        return
      }

      const { role } = data
      setIsLoading(false)

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
    }

    fetchUserAndRedirect()

    const { data: { subscription } } = supabaseInstance.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          await fetchUserAndRedirect()
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
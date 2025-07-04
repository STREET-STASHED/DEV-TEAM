import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { createBrowserClient } from '@supabase/ssr'

export default function ProtectedLayout({ children, supabaseClient }) {
  const router = useRouter()
  const supabase = useMemo(() => {
    return supabaseClient || createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }, [supabaseClient])

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

      const { data, error } = await supabase
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

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null)
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
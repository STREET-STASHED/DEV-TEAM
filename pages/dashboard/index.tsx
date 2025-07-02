import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createBrowserClient } from '@supabase/ssr'

export default function DashboardIndexRedirect() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return router.push('/login')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role

      switch (role) {
        case 'buyer':
          router.push('/dashboard/buyer')
          break
        case 'seller':
          router.push('/dashboard/seller')
          break
        case 'stylist':
          router.push('/dashboard/stylist')
          break
        case 'driver':
          router.push('/dashboard/driver')
          break
        case 'agent':
          router.push('/dashboard/agent')
          break
        default:
          router.push('/dashboard/general')
      }
    }

    redirectToRoleDashboard()
  }, [router, supabase])

  return null
}
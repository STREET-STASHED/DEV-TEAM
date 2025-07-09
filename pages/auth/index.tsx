import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useUser } from '../../lib/useUser' // make sure this is correctly imported

export default function AuthRedirect() {
  const router = useRouter()
  const userData = useUser()
  const user = userData?.user || null
  const isLoading = userData?.isLoading || false

  useEffect(() => {
    if (isLoading) return

    const handleRedirect = async () => {
      if (!user) {
        await router.replace('/auth')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, has_completed_onboarding, onboarding_step')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        console.error('Error fetching profile:', error)
        router.replace('/auth')
        return
      }

      if (!profile.has_completed_onboarding) {
        router.replace(`/onboarding/${profile.onboarding_step || 'role'}`)
      } else {
        if (profile.role === 'buyer') {
          router.replace('/marketplace')
        } else {
          router.replace(`/dashboard/${profile.role}`)
        }
      }
    }

    handleRedirect()
  }, [userData, router])

  return <p>Redirecting...</p>
}
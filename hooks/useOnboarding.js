

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useOnboarding() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitOnboarding = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No active session found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/onboarding-flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete onboarding')
      }

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('details_complete, has_completed_onboarding, onboarded')
        .single()

      if (error) throw error

      return !!(data && (data.has_completed_onboarding || data.onboarded))
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    submitOnboarding,
    checkOnboardingStatus,
    loading,
    error
  }
}
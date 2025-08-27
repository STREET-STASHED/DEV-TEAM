'use client'

import { createSupabaseBrowser } from '@/app/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.user) {
        console.error('Login error:', error?.message)
        setError(error?.message || 'Login failed')
        return
      }

      const { error: profileError } = await supabase.from('profiles')
        .select('has_completed_onboarding')
        .eq('user_id', data.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError.message)
        setError('Failed to fetch profile')
        return
      }

      try {
        const redirectResponse = await fetch('/functions/v1/handle-redirect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session?.access_token}`,
          },
          body: JSON.stringify({ user_id: data.user.id }),
        })

        const redirectData = await redirectResponse.json()
        if (redirectData.redirectTo) {
          router.replace(redirectData.redirectTo)
          if (redirectData.redirectTo === '/onboarding') {
            router.refresh() // Use refresh instead of reload for App Router
          }
        } else {
          router.replace('/onboarding') // Fallback
        }
      } catch (redirectError) {
        console.error('[ROUTING FALLBACK ERROR]', redirectError)
        router.replace('/onboarding')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:z-10 sm:text-sm transition-all duration-200"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:z-10 sm:text-sm transition-all duration-200"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-error-500/20 border border-error-500/30 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-error-400">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-ink-black bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-card hover:shadow-hover transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink-black mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </div>
    </form>
  )
}

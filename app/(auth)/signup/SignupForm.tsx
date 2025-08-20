'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type Role = 'buyer' | 'seller' | 'stylist' | 'driver'

const roleOptions = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Shop for fashion and discover unique streetwear',
    icon: '🛍️',
    color: 'from-blue-500 to-blue-600'
  },
  {
    value: 'seller',
    label: 'Seller',
    description: 'Sell your products and grow your business',
    icon: '🏪',
    color: 'from-green-500 to-green-600'
  },
  {
    value: 'stylist',
    label: 'Stylist',
    description: 'Create curated collections and style clients',
    icon: '👔',
    color: 'from-purple-500 to-purple-600'
  },
  {
    value: 'driver',
    label: 'Driver (Stasher)',
    description: 'Deliver orders and earn money',
    icon: '🚚',
    color: 'from-orange-500 to-orange-600'
  }
]

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email || !password || !name || !role || !username) {
      setError('Please fill in all fields before signing up.')
      setLoading(false)
      return
    }

    const payload = {
      email,
      password,
      userData: {
        full_name: name,
        role,
        username,
      },
    }

    console.log('[SIGNUP SUBMIT]', payload)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      let result
      try {
        result = await response.json()
      } catch (jsonErr) {
        console.error('Failed to parse JSON:', jsonErr)
        setError('Unexpected server response. Please try again.')
        setLoading(false)
        return
      }

      if (![200, 201].includes(response.status)) {
        console.error('[SIGNUP ERROR]', result)
        setError(result?.error || 'Signup failed.')
        setLoading(false)
        return
      }

      console.log('[SIGNUP SUCCESS]', result)

      // Auto-login after successful signup
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[AUTO-LOGIN ERROR]', error)
        setError(error.message || 'Login failed. Redirecting to onboarding...')
        await router.push('/onboarding')
        return
      }

      // Login successful, fetch session and redirect
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.access_token || !session.user?.id) {
        console.warn('[SESSION INVALID] Redirecting to onboarding.')
        await router.replace('/onboarding')
        return
      }

      const _access_token = session.access_token
      const _user_id = session.user.id

      // Redirect based on role
      switch (role) {
        case 'buyer':
          await router.push('/buyer/dashboard')
          break
        case 'seller':
          await router.push('/seller-dashboard')
          break
        case 'stylist':
          await router.push('/stylist/dashboard')
          break
        case 'driver':
          await router.push('/driver-dashboard')
          break
        default:
          await router.push('/onboarding')
      }

    } catch (error) {
      console.error('[SIGNUP ERROR]', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:z-10 sm:text-sm transition-all duration-200"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:z-10 sm:text-sm transition-all duration-200"
            placeholder="Choose a username"
          />
        </div>

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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:z-10 sm:text-sm transition-all duration-200"
            placeholder="Create a password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-3">
            I want to join as
          </label>
          <div className="grid grid-cols-1 gap-3">
            {roleOptions.map((option) => (
              <div
                key={option.value}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                  role === option.value
                    ? 'border-brand-400 bg-brand-500/10 shadow-lg'
                    : 'border-ink-600 bg-ink-800 hover:border-ink-500 hover:bg-ink-700'
                }`}
                onClick={() => setRole(option.value as Role)}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value as Role)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-ink-300">{option.description}</div>
                  </div>
                  {role === option.value && (
                    <div className="w-5 h-5 bg-brand-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-ink-black rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-ink-black bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-card hover:shadow-hover transform hover:scale-105"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink-black mr-2"></div>
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>
      </div>
    </form>
  )
}

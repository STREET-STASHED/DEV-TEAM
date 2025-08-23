'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTestAuth } from '@/context/TestAuthContext'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('test123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useTestAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/')
      } else {
        setError('Invalid credentials')
      }
    } catch (_err) {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (testEmail: string) => {
    setEmail(testEmail)
    setPassword('test123')
    setIsLoading(true)
    setError('')

    try {
      const success = await login(testEmail, 'test123')
      if (success) {
        router.push('/')
      } else {
        setError('Quick login failed')
      }
    } catch (_err) {
      setError('Quick login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Test Authentication
          </h2>
          <p className="mt-2 text-sm text-ink-400">
            Login with test accounts to test all features
          </p>
        </div>

        {/* Quick Login Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => quickLogin('buyer@test.com')}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            🛍️ Login as Buyer (Test Marketplace)
          </button>
          
          <button
            onClick={() => quickLogin('stylist@test.com')}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            👗 Login as Stylist (Test AI & AR)
          </button>
          
          <button
            onClick={() => quickLogin('driver@test.com')}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            🚚 Login as Driver (Test Delivery)
          </button>
        </div>

        <div className="text-center">
          <span className="text-ink-400 text-sm">or</span>
        </div>

        {/* Manual Login Form */}
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Enter test email"
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Password (test123)"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Test Account Info */}
        <div className="mt-8 p-4 bg-ink-800 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-3">Test Accounts</h3>
          <div className="space-y-2 text-sm text-ink-300">
            <div><strong>Buyer:</strong> buyer@test.com / test123</div>
            <div><strong>Stylist:</strong> stylist@test.com / test123</div>
            <div><strong>Driver:</strong> driver@test.com / test123</div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Use our test authentication endpoint
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || 'test@example.com',
          password: password || 'test123',
          role: role
        }),
      })

      if (response.ok) {
        setSuccess('Test login successful! You can now use the AI Stylist.')
        // Redirect to AI Stylist after a short delay
        setTimeout(() => {
          router.push('/ai-stylist')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
      }
    } catch (_error) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Test Authentication</h1>
          <p className="text-ink-300">Quick login to test the AI Stylist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">
              Password (optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="test123"
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="buyer">Buyer</option>
              <option value="stylist">Stylist</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-ink-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Logging in...' : 'Test Login'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-ink-400">
            This is a test page for development purposes.
          </p>
          <button
            onClick={() => router.push('/ai-stylist')}
            className="mt-2 text-purple-400 hover:text-purple-300 underline"
          >
            Go to AI Stylist directly
          </button>
        </div>
      </div>
    </div>
  )
}

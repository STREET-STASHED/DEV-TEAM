'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Role = 'buyer' | 'seller' | 'stylist' | 'driver'

const roleOptions = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Shop for fashion and discover unique streetwear',
    icon: '🛍️',
    color: 'from-blue-500 to-blue-600',
    benefits: ['Exclusive drops', 'Early access', 'Reward points', 'Social features']
  },
  {
    value: 'seller',
    label: 'Seller',
    description: 'Sell your products and grow your business',
    icon: '🏪',
    color: 'from-green-500 to-green-600',
    benefits: ['0% commission', 'Analytics dashboard', 'Marketing tools', 'Customer insights']
  },
  {
    value: 'stylist',
    label: 'Stylist',
    description: 'Create curated collections and style clients',
    icon: '👔',
    color: 'from-purple-500 to-purple-600',
    benefits: ['Commission earnings', 'Client management', 'Portfolio showcase', 'Booking system']
  },
  {
    value: 'driver',
    label: 'Driver (Stasher)',
    description: 'Deliver orders and earn money',
    icon: '🚚',
    color: 'from-orange-500 to-orange-600',
    benefits: ['Flexible hours', 'Instant payouts', 'Performance bonuses', 'Route optimization']
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

      // Auto-login after successful signup using existing client

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
    <div className="min-h-screen bg-gradient-to-br from-ink-black to-ink-900 py-20 px-8">
      <div className="w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            Join the Revolution
          </h1>
          <p className="text-xl text-ink-300 max-w-4xl mx-auto">
            StreetStashed isn't just a marketplace - it's a social commerce platform where fashion meets community, 
            creativity earns rewards, and every interaction builds your influence.
          </p>
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
          <div className="bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-2xl p-8 border border-brand-400/30">
            <h3 className="text-xl font-bold text-white mb-3">Viral Challenges</h3>
            <p className="text-ink-300 text-base">Participate in trending challenges, win prizes, and build your following</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-8 border border-purple-400/30">
            <h3 className="text-xl font-bold text-white mb-3">Rewards System</h3>
            <p className="text-ink-300 text-base">Earn points for every action, unlock exclusive perks and cash rewards</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-8 border border-green-400/30">
            <h3 className="text-xl font-bold text-white mb-3">Social Commerce</h3>
            <p className="text-ink-300 text-base">Share your style, discover trends, and connect with fashion enthusiasts</p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-ink-800/50 rounded-2xl p-12 mb-24 border border-ink-700">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-4">Join 50,000+ Fashion Enthusiasts</h3>
            <p className="text-ink-300 text-lg">See what others are saying about StreetStashed</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            <div className="bg-ink-700 rounded-xl p-10 min-h-[280px] w-full md:w-80 flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-6">
                  <span className="text-white font-semibold text-3xl">4.9/5</span>
                </div>
                <p className="text-ink-200 text-lg mb-4 leading-relaxed">"The viral challenges are addictive! I've won over $500 in prizes already."</p>
              </div>
              <p className="text-brand-400 text-base font-medium">- Sarah M., Fashion Influencer</p>
            </div>
            <div className="bg-ink-700 rounded-xl p-10 min-h-[280px] w-full md:w-80 flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-6">
                  <span className="text-white font-semibold text-3xl">4.9/5</span>
                </div>
                <p className="text-ink-200 text-lg mb-4 leading-relaxed">"As a seller, the analytics and marketing tools are game-changing."</p>
              </div>
              <p className="text-brand-400 text-base font-medium">- Mike R., Streetwear Brand Owner</p>
            </div>
            <div className="bg-ink-700 rounded-xl p-10 min-h-[280px] w-full md:w-80 flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-6">
                  <span className="text-white font-semibold text-3xl">4.9/5</span>
                </div>
                <p className="text-ink-200 text-lg mb-4 leading-relaxed">"The social features make shopping so much fun and engaging!"</p>
              </div>
              <p className="text-brand-400 text-base font-medium">- Alex K., Style Blogger</p>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-ink-900 rounded-2xl p-20 border border-ink-700 shadow-2xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Path</h2>
            <p className="text-ink-300 text-lg">Select your role and unlock exclusive benefits</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Role Selection */}
            <div className="space-y-8">
              <label className="block text-2xl font-semibold text-white mb-8 text-center">
                I want to join as
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`relative cursor-pointer rounded-xl border-2 p-8 transition-all duration-300 transform hover:scale-105 ${
                      role === option.value
                        ? 'border-brand-400 bg-gradient-to-br from-brand-500/20 to-brand-600/20 shadow-lg shadow-brand-500/25'
                        : 'border-ink-600 bg-ink-800 hover:border-ink-500 hover:bg-ink-700'
                    }`}
                    style={{ aspectRatio: '1 / 1' }}
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
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="font-bold text-white text-xl mb-4">{option.label}</div>
                        <div className="text-ink-300 text-sm mb-6 leading-relaxed">{option.description}</div>
                      </div>
                      <div className="space-y-3">
                        {option.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center text-xs text-brand-300">
                            <div className="w-2 h-2 bg-brand-400 rounded-full mr-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label htmlFor="name" className="block text-lg font-semibold text-white mb-3">
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
                  className="w-full px-6 py-4 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 text-lg"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-lg font-semibold text-white mb-3">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 text-lg"
                  placeholder="Choose a unique username"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label htmlFor="email" className="block text-lg font-semibold text-white mb-3">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 text-lg"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-lg font-semibold text-white mb-3">
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
                  className="w-full px-6 py-4 border border-ink-600 bg-ink-800 placeholder-ink-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 text-lg"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-error-500/20 border border-error-500/30 rounded-lg p-4">
                <p className="text-error-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
                              <button
                  type="submit"
                  disabled={loading || !role}
                  className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-ink-black py-4 px-6 rounded-xl font-bold text-lg hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-500/25"
                >
                  {loading ? 'Creating Your Account...' : 'Launch Your Fashion Journey'}
                </button>
            </div>

            {/* Additional Benefits */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-8 text-base text-ink-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-brand-400 rounded-full mr-2"></div>
                  Instant access to viral challenges
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-brand-400 rounded-full mr-2"></div>
                  500 bonus points on signup
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-brand-400 rounded-full mr-2"></div>
                  Exclusive member benefits
                </div>
              </div>
              
              <div className="text-center text-sm text-ink-400">
                <p>Already have an account? <a href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</a></p>
              </div>
            </div>
          </form>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-ink-400 text-sm">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-brand-400 hover:text-brand-300">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-brand-400 hover:text-brand-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

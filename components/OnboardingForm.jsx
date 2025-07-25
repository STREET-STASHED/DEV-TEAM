import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { useOnboarding } from '../hooks/useOnboarding'

export default function OnboardingForm({ supabaseClient }) {
  const router = useRouter()
  const { submitOnboarding, loading, error } = useOnboarding()
  
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'buyer',
    license_number: '',
    verification_url: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) fetchProfile(user.id)
    }

    if (!['/', '/auth'].includes(router.pathname)) {
      getUser()
    }
  }, [router.pathname])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          role: data.role || 'buyer',
          license_number: data.license_number || '',
          verification_url: data.verification_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const result = await submitOnboarding(formData)
      alert('Profile updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  if (!user) return <div>Please sign in to complete your profile</div>

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className="grid grid-cols-2 gap-2">
            {['buyer', 'seller', 'agent'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setFormData({ ...formData, role: r })}
                className={`p-2 border rounded text-center capitalize ${
                  formData.role === r ? 'bg-black text-white border-black' : 'border-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {formData.role === 'agent' && (
          <>
            <div className="mb-4">
              <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input
                id="license_number"
                name="license_number"
                type="text"
                value={formData.license_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="verification_url" className="block text-sm font-medium text-gray-700 mb-1">Verification Document</label>
              <input
                id="verification_url"
                name="verification_url"
                type="text"
                value={formData.verification_url}
                onChange={handleChange}
                placeholder="Upload verification document"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Complete Onboarding'}
        </button>
      </form>
    </div>
  )
}
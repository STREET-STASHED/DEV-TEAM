import ProtectedLayout from '../../components/ProtectedLayout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createBrowserClient } from '@supabase/ssr'
import { useOnboarding } from '../../hooks/useOnboarding'

export default function Details() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { submitOnboarding, loading, error } = useOnboarding()
  
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    license_number: '',
    verification_url: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        alert('Session expired. Please log in again.')
        router.push('/signup')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch profile', error)
        return
      }

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          role: data.role || 'buyer',
          license_number: data.license_number || '',
          verification_url: data.verification_url || ''
        })
      }
    }

    getUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await submitOnboarding(formData)
      router.push('/onboarding/verify')
    } catch (err: any) {
      console.error('Onboarding failed:', err.message)
    }
  }

  if (!user) {
    return <div className="text-white p-4">Please log in to complete your profile.</div>
  }

  return (
    <ProtectedLayout supabaseClient={supabase}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-opacity-50 px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Complete Your Profile</h1>
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded mb-4">{error}</div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-xl space-y-6"
        >
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="driver">Driver</option>
            <option value="stylist">Stylist</option>
          </select>

          {(formData.role === 'driver' || formData.role === 'stylist') && (
            <>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                placeholder="License Number"
                required={formData.role === 'driver'}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
              />
              <input
                type="text"
                name="verification_url"
                value={formData.verification_url}
                onChange={handleChange}
                placeholder="Verification URL"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded text-white font-semibold"
          >
            {loading ? 'Saving...' : 'Continue to Verification'}
          </button>
        </form>
      </div>
    </ProtectedLayout>
  )
}

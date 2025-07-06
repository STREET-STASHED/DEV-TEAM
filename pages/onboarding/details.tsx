import ProtectedLayout from '../../components/ProtectedLayout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createBrowserClient } from '@supabase/ssr'

export default function Details() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    license_number: '',
    verification_url: '',
    brand_name: '',
    brand_website: '',
    industry: '',
    company_size: '',
    brand_description: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        alert('Session expired. Please log in again.')
        router.push('/Auth')
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
          verification_url: data.verification_url || '',
          brand_name: data.brand_name || '',
          brand_website: data.brand_website || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          brand_description: data.brand_description || '',
          primary_contact_name: data.primary_contact_name || '',
          primary_contact_email: data.primary_contact_email || '',
          primary_contact_phone: data.primary_contact_phone || ''
        })

        if (data.onboarding_step && data.onboarding_step !== 'details') {
          router.push(`/onboarding/${data.onboarding_step}`)
        }
      }
    }

    getUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Session expired. Please log in again.')
        router.push('/Auth')
        return
      }

      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: formData.full_name,
        role: formData.role,
        license_number: formData.license_number,
        verification_url: formData.verification_url,
        brand_name: formData.brand_name,
        brand_website: formData.brand_website,
        industry: formData.industry,
        company_size: formData.company_size,
        brand_description: formData.brand_description,
        primary_contact_name: formData.primary_contact_name,
        primary_contact_email: formData.primary_contact_email,
        primary_contact_phone: formData.primary_contact_phone,
        details_complete: true,
        has_completed_onboarding: true,
        onboarding_step: 'verify'
      })

      await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          role: formData.role
        }
      })

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
        <h1 className="text-2xl font-bold text-white mb-6">Complete Your Brand Profile</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-xl space-y-6"
        >
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Your Full Name"
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

          <input
            type="text"
            name="brand_name"
            value={formData.brand_name}
            onChange={handleChange}
            placeholder="Brand Name"
            required
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          />

          <input
            type="url"
            name="brand_website"
            value={formData.brand_website}
            onChange={handleChange}
            placeholder="Brand Website"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          />

          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="Industry"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          />

          <select
            name="company_size"
            value={formData.company_size}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="">Select Company Size</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>

          <textarea
            name="brand_description"
            value={formData.brand_description}
            onChange={handleChange}
            placeholder="Brand Description"
            rows={4}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded resize-none"
          />

          <input
            type="text"
            name="primary_contact_name"
            value={formData.primary_contact_name}
            onChange={handleChange}
            placeholder="Primary Contact Name"
            required
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          />

          <input
            type="email"
            name="primary_contact_email"
            value={formData.primary_contact_email}
            onChange={handleChange}
            placeholder="Primary Contact Email"
            required
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          />

          <input
            type="tel"
            name="primary_contact_phone"
            value={formData.primary_contact_phone}
            onChange={handleChange}
            placeholder="Primary Contact Phone"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded text-white font-semibold"
          >
            Continue to Verification
          </button>
        </form>
      </div>
    </ProtectedLayout>
  )
}

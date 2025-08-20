'use client'

import { useState } from 'react'


interface GuestUser {
  email: string
  fullName: string
  phone?: string
}

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
}

interface GuestCheckoutFormProps {
  onGuestCheckout: (_guestData: GuestUser, _address: Address) => Promise<void>
  onSwitchToSignup: () => void
  loading?: boolean
}

export function GuestCheckoutForm({ onGuestCheckout, onSwitchToSignup, loading = false }: GuestCheckoutFormProps) {
  const [guestData, setGuestData] = useState<GuestUser>({
    email: '',
    fullName: '',
    phone: ''
  })
  
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!guestData.email) newErrors.email = 'Email is required'
    if (!guestData.fullName) newErrors.fullName = 'Full name is required'
    if (!address.street) newErrors.street = 'Street address is required'
    if (!address.city) newErrors.city = 'City is required'
    if (!address.state) newErrors.state = 'State is required'
    if (!address.zipCode) newErrors.zipCode = 'ZIP code is required'
    
    // Basic email validation
    if (guestData.email && !/\S+@\S+\.\S+/.test(guestData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await onGuestCheckout(guestData, address)
    } catch (error) {
      console.error('Guest checkout error:', error)
    }
  }

  const handleInputChange = (field: keyof GuestUser, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Guest Checkout</h3>
        <p className="text-ink-300 text-sm">
          Complete your purchase without creating an account. You can always sign up later to track orders and save preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Guest Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white border-b border-ink-700 pb-2">Your Information</h4>
          
          <div>
            <label htmlFor="guest-email" className="block text-sm font-medium text-white mb-1">
              Email Address *
            </label>
            <input
              id="guest-email"
              type="email"
              value={guestData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
                errors.email ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-error-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium text-white mb-1">
              Full Name *
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
                errors.fullName ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-error-400 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="guest-phone" className="block text-sm font-medium text-white mb-1">
              Phone Number (Optional)
            </label>
            <input
              id="guest-phone"
              type="tel"
              value={guestData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-ink-600 rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white border-b border-ink-700 pb-2">Shipping Address</h4>
          
          <div>
            <label htmlFor="guest-street" className="block text-sm font-medium text-white mb-1">
              Street Address *
            </label>
            <input
              id="guest-street"
              type="text"
              value={address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
                errors.street ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="123 Main Street"
            />
            {errors.street && <p className="text-error-400 text-sm mt-1">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest-city" className="block text-sm font-medium text-white mb-1">
                City *
              </label>
              <input
                id="guest-city"
                type="text"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
                  errors.city ? 'border-error-500' : 'border-ink-600'
                }`}
                placeholder="Pittsburgh"
              />
              {errors.city && <p className="text-error-400 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="guest-state" className="block text-sm font-medium text-white mb-1">
                State *
              </label>
              <input
                id="guest-state"
                type="text"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
                  errors.state ? 'border-error-500' : 'border-ink-600'
                }`}
                placeholder="PA"
              />
              {errors.state && <p className="text-error-400 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="guest-zip" className="block text-sm font-medium text-white mb-1">
              ZIP Code *
            </label>
            <input
              id="guest-zip"
              type="text"
              value={address.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
                errors.zipCode ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="15201"
            />
            {errors.zipCode && <p className="text-error-400 text-sm mt-1">{errors.zipCode}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-ink-black py-3 px-4 rounded-lg font-medium hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
          
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="w-full bg-ink-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-ink-700 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all duration-200"
          >
            Create Account & Save 10%
          </button>
        </div>

        <div className="text-center text-sm text-ink-400">
          <p>Creating an account gives you order tracking, faster checkout, and exclusive discounts!</p>
        </div>
      </form>
    </div>
  )
}

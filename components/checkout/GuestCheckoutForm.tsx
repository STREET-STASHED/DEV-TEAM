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
    <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 shadow-2xl">
      {/* Guest Checkout Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-brand-400">G</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Guest Checkout</h3>
            <p className="text-ink-300">Complete your purchase without creating an account</p>
          </div>
        </div>
        
        <div className="bg-ink-800/50 rounded-xl p-4 border border-ink-600">
          <div className="flex items-center space-x-2 text-sm text-ink-300">
            <div className="w-2 h-2 bg-brand-400 rounded-full"></div>
            <span>You can always sign up later to track orders and save preferences</span>
          </div>
        </div>
      </div>

      {/* Benefits of Creating Account */}
      <div className="mb-8 bg-gradient-to-r from-brand-500/10 to-purple-500/10 rounded-xl p-6 border border-brand-400/20">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-lg mr-2 text-brand-400">★</span>
          Create Account & Unlock Premium Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-ink-200">Save 10% on your first order</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-ink-200">Earn reward points instantly</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-ink-200">Access to viral challenges</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-ink-200">Exclusive member drops</span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="mt-4 w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Create Account & Save 10%
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white border-b border-ink-700 pb-2 flex items-center">
            <span className="text-lg mr-2 text-brand-400">●</span>
            Your Information
          </h4>
          
          <div>
            <label htmlFor="guest-email" className="block text-sm font-semibold text-white mb-2">
              Email Address *
            </label>
            <input
              id="guest-email"
              type="email"
              value={guestData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 ${
                errors.email ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-error-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="guest-name" className="block text-sm font-semibold text-white mb-2">
              Full Name *
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 ${
                errors.fullName ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-error-400 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="guest-phone" className="block text-sm font-semibold text-white mb-2">
              Phone Number (Optional)
            </label>
            <input
              id="guest-phone"
              type="tel"
              value={guestData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-ink-600 rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200"
              placeholder="(555) 123-4567"
            />
            <p className="text-xs text-ink-400 mt-1">For delivery updates and order tracking</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white border-b border-ink-700 pb-2 flex items-center">
            <span className="text-lg mr-2 text-brand-400">●</span>
            Shipping Address
          </h4>
          
          <div>
            <label htmlFor="guest-street" className="block text-sm font-semibold text-white mb-2">
              Street Address *
            </label>
            <input
              id="guest-street"
              type="text"
              value={address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 ${
                errors.street ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="123 Main Street"
            />
            {errors.street && <p className="text-error-400 text-sm mt-1">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest-city" className="block text-sm font-semibold text-white mb-2">
                City *
              </label>
              <input
                id="guest-city"
                type="text"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 ${
                  errors.city ? 'border-error-500' : 'border-ink-600'
                }`}
                placeholder="Pittsburgh"
              />
              {errors.city && <p className="text-error-400 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="guest-state" className="block text-sm font-semibold text-white mb-2">
                State *
              </label>
              <input
                id="guest-state"
                type="text"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 ${
                  errors.state ? 'border-error-500' : 'border-ink-600'
                }`}
                placeholder="PA"
              />
              {errors.state && <p className="text-error-400 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="guest-zip" className="block text-sm font-semibold text-white mb-2">
              ZIP Code *
            </label>
            <input
              id="guest-zip"
              type="text"
              value={address.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all duration-200 ${
                errors.zipCode ? 'border-error-500' : 'border-ink-600'
              }`}
              placeholder="15201"
            />
            {errors.zipCode && <p className="text-error-400 text-sm mt-1">{errors.zipCode}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-ink-600 to-ink-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-ink-700 hover:to-ink-800 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-3 pt-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-ink-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-brand-400 rounded-full mr-2"></div>
              Secure checkout
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-brand-400 rounded-full mr-2"></div>
              Fast delivery
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-brand-400 rounded-full mr-2"></div>
              Order tracking
            </div>
          </div>
          
          <div className="text-center text-sm text-ink-400">
            <p>Creating an account gives you order tracking, faster checkout, and exclusive discounts!</p>
          </div>
        </div>
      </form>
    </div>
  )
}

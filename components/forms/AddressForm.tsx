'use client'

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
}

interface AddressFormProps {
  _address: Address
  onChange: (_address: Address) => void
  title?: string
}

export function AddressForm({ _address, onChange, title }: AddressFormProps) {
  const handleChange = (field: keyof Address, value: string) => {
    onChange({
      ..._address,
      [field]: value
    })
  }

  return (
    <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-white mb-2">
            Street Address
          </label>
          <input
            id="street"
            type="text"
            value={_address.street}
            onChange={(e) => handleChange('street', e.target.value)}
            className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            placeholder="Enter street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
              City
            </label>
            <input
              id="city"
              type="text"
              value={_address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="City"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-white mb-2">
              State
            </label>
            <input
              id="state"
              type="text"
              value={_address.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="State"
            />
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-white mb-2">
              ZIP Code
            </label>
            <input
              id="zipCode"
              type="text"
              value={_address.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="ZIP Code"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { compareCommissionScenarios } from '@/lib/commissionConfig'

interface PackageItem {
  id: string
  name: string
  price: number
  category: string
  outfitDay: string
}

interface ClientInfo {
  name: string
  email: string
  phone?: string
  style: string[]
  budget: 'low' | 'medium' | 'high'
  sizes: string[]
  notes: string
}

export default function CreateCurationPackagePage() {
  const [packageType, setPackageType] = useState<'trip' | 'work_week' | 'special_event' | 'seasonal' | 'custom'>('trip')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [serviceFee, setServiceFee] = useState(150)
  const [items, setItems] = useState<PackageItem[]>([])
  const [newItem, setNewItem] = useState({ name: '', price: 0, category: 'clothing', outfitDay: '' })
  const [outfitDays, setOutfitDays] = useState<string[]>(['Day 1'])
  
  const [client, setClient] = useState<ClientInfo>({
    name: '',
    email: '',
    phone: '',
    style: [],
    budget: 'medium',
    sizes: [],
    notes: ''
  })

  const [step, setStep] = useState(1) // 1: Package Info, 2: Client Info, 3: Items, 4: Review

  const packageTypes = [
    { 
      id: 'trip', 
      name: 'Trip Package', 
      description: 'Complete wardrobe for business trips, vacations, or travel',
      icon: '✈️',
      defaultDuration: '5 days',
      defaultFee: 200
    },
    { 
      id: 'work_week', 
      name: 'Work Week', 
      description: 'Professional wardrobe for new jobs or important work weeks',
      icon: '💼',
      defaultDuration: '1 week',
      defaultFee: 150
    },
    { 
      id: 'special_event', 
      name: 'Special Event', 
      description: 'Weddings, parties, conferences, and special occasions',
      icon: '🎉',
      defaultDuration: '3 days',
      defaultFee: 120
    },
    { 
      id: 'seasonal', 
      name: 'Seasonal', 
      description: 'Complete wardrobe refresh for new season',
      icon: '🍂',
      defaultDuration: '2 weeks',
      defaultFee: 250
    },
    { 
      id: 'custom', 
      name: 'Custom Package', 
      description: 'Fully customized curation service',
      icon: '✨',
      defaultDuration: 'Custom',
      defaultFee: 180
    }
  ]

  const styleOptions = [
    'Business Casual', 'Professional', 'Minimalist', 'Trendy', 'Classic',
    'Romantic', 'Edgy', 'Bohemian', 'Sporty', 'Elegant', 'Street Style'
  ]

  const addOutfitDay = () => {
    const newDay = `Day ${outfitDays.length + 1}`
    setOutfitDays([...outfitDays, newDay])
  }

  const removeOutfitDay = (dayToRemove: string) => {
    setOutfitDays(outfitDays.filter(day => day !== dayToRemove))
    setItems(items.filter(item => item.outfitDay !== dayToRemove))
  }

  const addItem = () => {
    if (newItem.name && newItem.price > 0 && newItem.outfitDay) {
      setItems([...items, {
        id: Date.now().toString(),
        name: newItem.name,
        price: newItem.price,
        category: newItem.category,
        outfitDay: newItem.outfitDay
      }])
      setNewItem({ name: '', price: 0, category: 'clothing', outfitDay: '' })
    }
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const calculatePackagePricing = () => {
    const totalItemValue = items.reduce((sum, item) => sum + item.price, 0)
    const totalPackageValue = totalItemValue + serviceFee
    const scenarios = compareCommissionScenarios(totalPackageValue, 0) // 0% markup since service fee is separate
    
    return {
      totalItemValue,
      serviceFee,
      totalPackageValue,
      commission: totalPackageValue * 0.18, // 18% pilot rate
      netEarnings: totalPackageValue * 0.82, // 82% after commission
      scenarios
    }
  }

  const pricing = calculatePackagePricing()

  const handlePackageTypeChange = (type: typeof packageType) => {
    const typeInfo = packageTypes.find(t => t.id === type)
    setPackageType(type)
    if (typeInfo) {
      setDuration(typeInfo.defaultDuration)
      setServiceFee(typeInfo.defaultFee)
      
      // Set default outfit days based on package type
      if (type === 'work_week') {
        setOutfitDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
      } else if (type === 'trip') {
        setOutfitDays(['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'])
      } else if (type === 'special_event') {
        setOutfitDays(['Event Day', 'Pre-Event', 'After Party'])
      } else {
        setOutfitDays(['Day 1'])
      }
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Package Information</h2>
              
              {/* Package Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-ink-300 mb-3">Package Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packageTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handlePackageTypeChange(type.id as typeof packageType)}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        packageType === type.id
                          ? 'border-brand-600 bg-brand-600/10'
                          : 'border-ink-600 hover:border-ink-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-white font-medium mb-1">{type.name}</div>
                      <div className="text-ink-400 text-sm">{type.description}</div>
                      <div className="text-brand-400 text-xs mt-2">
                        {type.defaultDuration} • ${type.defaultFee} service fee
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Package Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Paris Business Trip - 5 Days"
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 5 days, 1 week"
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the package, occasion, and styling goals..."
                  rows={3}
                  className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Service Fee ($)</label>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    min="0"
                    step="10"
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                  <p className="text-ink-400 text-xs mt-1">Your styling and curation fee</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={client.name}
                    onChange={(e) => setClient({...client, name: e.target.value})}
                    placeholder="Client full name"
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={client.email}
                    onChange={(e) => setClient({...client, email: e.target.value})}
                    placeholder="client@email.com"
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={client.phone}
                    onChange={(e) => setClient({...client, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Budget</label>
                  <select
                    value={client.budget}
                    onChange={(e) => setClient({...client, budget: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="low">Low ($50-150 per item)</option>
                    <option value="medium">Medium ($150-300 per item)</option>
                    <option value="high">High ($300+ per item)</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-ink-300 mb-2">Style Preferences</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {styleOptions.map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        const newStyles = client.style.includes(style)
                          ? client.style.filter(s => s !== style)
                          : [...client.style, style]
                        setClient({...client, style: newStyles})
                      }}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        client.style.includes(style)
                          ? 'bg-brand-600 text-ink-black'
                          : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-ink-300 mb-2">Sizes</label>
                <input
                  type="text"
                  value={client.sizes.join(', ')}
                  onChange={(e) => setClient({...client, sizes: e.target.value.split(', ').filter(s => s.trim())})}
                  placeholder="e.g., S, M, 8, 10"
                  className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-300 mb-2">Additional Notes</label>
                <textarea
                  value={client.notes}
                  onChange={(e) => setClient({...client, notes: e.target.value})}
                  placeholder="Any special requirements, preferences, or notes about the client..."
                  rows={3}
                  className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Outfit Planning</h2>
              
              {/* Outfit Days Management */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-ink-300">Outfit Days</label>
                  <button
                    onClick={addOutfitDay}
                    className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-ink-black text-sm rounded transition-colors"
                  >
                    Add Day
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                                      {outfitDays.map((day) => (
                    <div key={day} className="flex items-center space-x-1 bg-ink-700 rounded px-2 py-1">
                      <span className="text-ink-300 text-sm">{day}</span>
                      {outfitDays.length > 1 && (
                        <button
                          onClick={() => removeOutfitDay(day)}
                          className="text-error-400 hover:text-error-300 text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Items */}
              <div className="bg-ink-700/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Add Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Item name"
                    className="px-3 py-2 bg-ink-800 border border-ink-600 rounded text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                    placeholder="Price"
                    min="0"
                    step="5"
                    className="px-3 py-2 bg-ink-800 border border-ink-600 rounded text-white placeholder-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="px-3 py-2 bg-ink-800 border border-ink-600 rounded text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="clothing">Clothing</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="bags">Bags</option>
                  </select>
                  <select
                    value={newItem.outfitDay}
                    onChange={(e) => setNewItem({...newItem, outfitDay: e.target.value})}
                    className="px-3 py-2 bg-ink-800 border border-ink-600 rounded text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Select Day</option>
                    {outfitDays.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addItem}
                  disabled={!newItem.name || !newItem.price || !newItem.outfitDay}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-ink-600 text-ink-black disabled:text-ink-400 rounded transition-colors"
                >
                  Add Item
                </button>
              </div>

              {/* Items by Day */}
              <div className="space-y-4">
                {outfitDays.map(day => {
                  const dayItems = items.filter(item => item.outfitDay === day)
                  const dayTotal = dayItems.reduce((sum, item) => sum + item.price, 0)
                  
                  return (
                    <div key={day} className="bg-ink-700/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-medium">{day}</h4>
                        <span className="text-brand-400 font-medium">${dayTotal}</span>
                      </div>
                      
                      {dayItems.length === 0 ? (
                        <p className="text-ink-400 text-sm">No items added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {dayItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-ink-600/50 rounded px-3 py-2">
                              <div>
                                <span className="text-white">{item.name}</span>
                                <span className="text-ink-400 text-sm ml-2">• {item.category}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white">${item.price}</span>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-error-400 hover:text-error-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pricing Summary */}
              {items.length > 0 && (
                <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Package Pricing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-ink-400">Items Total:</span>
                      <span className="text-white">${pricing.totalItemValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-400">Service Fee:</span>
                      <span className="text-white">${pricing.serviceFee}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-white">Package Total:</span>
                      <span className="text-white">${pricing.totalPackageValue}</span>
                    </div>
                    <div className="border-t border-ink-600 pt-2">
                      <div className="flex justify-between">
                        <span className="text-ink-400">Platform Commission (18%):</span>
                        <span className="text-error-400">-${pricing.commission.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-success-400">Your Net Earnings:</span>
                        <span className="text-success-400">${pricing.netEarnings.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Review Package</h2>
              
              {/* Package Summary */}
              <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-ink-400">{description}</p>
                  </div>
                  <span className="px-3 py-1 bg-brand-600/20 text-brand-400 rounded-full text-sm">
                    {packageTypes.find(t => t.id === packageType)?.name}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-ink-400 text-sm">Duration</div>
                    <div className="text-white font-medium">{duration}</div>
                  </div>
                  <div>
                    <div className="text-ink-400 text-sm">Outfits</div>
                    <div className="text-white font-medium">{outfitDays.length}</div>
                  </div>
                  <div>
                    <div className="text-ink-400 text-sm">Total Items</div>
                    <div className="text-white font-medium">{items.length}</div>
                  </div>
                  <div>
                    <div className="text-ink-400 text-sm">Package Value</div>
                    <div className="text-white font-medium">${pricing.totalPackageValue}</div>
                  </div>
                </div>

                <div className="border-t border-ink-600 pt-4">
                  <h4 className="text-white font-medium mb-2">Client: {client.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {client.style.map(style => (
                      <span key={style} className="px-2 py-1 bg-ink-700 text-ink-300 text-xs rounded">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Final Pricing */}
              <div className="bg-success-400/10 border border-success-400/20 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-3">Final Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink-400">Items Total:</span>
                    <span className="text-white">${pricing.totalItemValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Your Service Fee:</span>
                    <span className="text-white">${pricing.serviceFee}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-success-400/20 pt-2">
                    <span className="text-white">Total Package Value:</span>
                    <span className="text-white">${pricing.totalPackageValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Platform Commission (18%):</span>
                    <span className="text-error-400">-${pricing.commission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-success-400/20 pt-2">
                    <span className="text-success-400">Your Net Earnings:</span>
                    <span className="text-success-400">${pricing.netEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Curation Package</h1>
          <p className="mt-2 text-ink-400">
            Design a custom outfit package for your client
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        {['Package Info', 'Client Info', 'Items & Outfits', 'Review'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step > index + 1 
                ? 'bg-success-600 text-white' 
                : step === index + 1
                ? 'bg-brand-600 text-ink-black'
                : 'bg-ink-700 text-ink-400'
            }`}>
              {step > index + 1 ? '✓' : index + 1}
            </div>
            <span className={`ml-2 text-sm ${
              step === index + 1 ? 'text-white' : 'text-ink-400'
            }`}>
              {stepName}
            </span>
            {index < 3 && <div className="w-8 h-px bg-ink-600 ml-4" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-3 bg-ink-700 hover:bg-ink-600 disabled:bg-ink-800 text-white disabled:text-ink-500 rounded-lg transition-colors"
        >
          Previous
        </button>
        
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-ink-black rounded-lg transition-colors"
          >
            Next
          </button>
        ) : (
          <div className="space-x-3">
            <button className="px-6 py-3 bg-ink-700 hover:bg-ink-600 text-white rounded-lg transition-colors">
              Save as Draft
            </button>
            <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-ink-black rounded-lg transition-colors">
              Send Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

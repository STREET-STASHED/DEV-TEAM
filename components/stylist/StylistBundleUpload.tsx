'use client'

import { useState } from 'react'
import { 
  calculateRecommendedMarkup,
  commissionConfig 
} from '@/lib/commissionConfig'

interface BundleItem {
  id: string
  name: string
  basePrice: number
  category: string
  imageUrl?: string
}

interface StylistBundle {
  id: string
  name: string
  description: string
  items: BundleItem[]
  targetProfitMargin: number
  isPilot: boolean
  subscriptionTier?: 'silver' | 'gold' | 'platinum' | 'diamond'
}

interface StylistBundleUploadProps {
  onBundleCreate: (_bundle: StylistBundle) => void
}

export function StylistBundleUpload({ onBundleCreate }: StylistBundleUploadProps) {
  const [bundleName, setBundleName] = useState('')
  const [description, setDescription] = useState('')
  const [targetProfitMargin, setTargetProfitMargin] = useState(20)
  const [isPilot, setIsPilot] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<'silver' | 'gold' | 'platinum' | 'diamond'>('silver')
  const [items, setItems] = useState<BundleItem[]>([])
  const [newItem, setNewItem] = useState({ name: '', basePrice: 0, category: '' })

  const addItem = () => {
    if (newItem.name && newItem.basePrice > 0) {
      setItems([...items, {
        id: Date.now().toString(),
        name: newItem.name,
        basePrice: newItem.basePrice,
        category: newItem.category || 'accessories'
      }])
      setNewItem({ name: '', basePrice: 0, category: '' })
    }
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const calculateBundlePricing = () => {
    if (items.length === 0) return null

    const totalBasePrice = items.reduce((sum, item) => sum + item.basePrice, 0)
    const pilotPricing = calculateRecommendedMarkup(totalBasePrice, targetProfitMargin, isPilot, undefined, 'stylist')
    const subscriptionPricing = calculateRecommendedMarkup(totalBasePrice, targetProfitMargin, false, subscriptionTier, 'stylist')

    return {
      totalBasePrice,
      pilotPricing,
      subscriptionPricing,
      totalItems: items.length
    }
  }

  const handleCreateBundle = () => {
    if (bundleName && items.length > 0) {
      const bundle: StylistBundle = {
        id: Date.now().toString(),
        name: bundleName,
        description,
        items,
        targetProfitMargin,
        isPilot,
        subscriptionTier
      }
      onBundleCreate(bundle)
      
      // Reset form
      setBundleName('')
      setDescription('')
      setItems([])
      setTargetProfitMargin(20)
    }
  }

  const pricing = calculateBundlePricing()

  return (
    <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Create Stylist Bundle</h3>
      
      {/* Bundle Details */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Bundle Name
          </label>
          <input
            type="text"
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
            className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="e.g., Summer Weekend Vibes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Describe your curated bundle..."
          />
        </div>
      </div>

      {/* Commission Settings */}
      <div className="bg-ink-700/30 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-medium text-white mb-4">Commission Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phase
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isPilot}
                  onChange={() => setIsPilot(true)}
                  className="mr-2 text-brand-400"
                />
                <span className="text-ink-300">Pilot Phase ({commissionConfig.pilot.commissionRate * 100}% commission)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isPilot}
                  onChange={() => setIsPilot(false)}
                  className="mr-2 text-brand-400"
                />
                <span className="text-ink-300">Subscription Model</span>
              </label>
            </div>
          </div>

          {!isPilot && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Subscription Tier
              </label>
              <select
                value={subscriptionTier}
                onChange={(e) => setSubscriptionTier(e.target.value as 'silver' | 'gold' | 'platinum' | 'diamond')}
                className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="silver">Silver Stylist - {commissionConfig.stylistTiers.silver.commissionRate * 100}% commission</option>
                <option value="gold">Gold Stylist - {commissionConfig.stylistTiers.gold.commissionRate * 100}% commission</option>
                <option value="platinum">Platinum Stylist - {commissionConfig.stylistTiers.platinum.commissionRate * 100}% commission</option>
                <option value="diamond">Diamond Stylist - {commissionConfig.stylistTiers.diamond.commissionRate * 100}% commission</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Target Profit Margin (%)
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={targetProfitMargin}
              onChange={(e) => setTargetProfitMargin(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>5%</span>
              <span className="text-brand-400 font-medium">{targetProfitMargin}%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Items */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-4">Bundle Items</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Item name"
          />
          <input
            type="number"
            value={newItem.basePrice}
            onChange={(e) => setNewItem({ ...newItem, basePrice: Number(e.target.value) })}
            className="px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Base price"
            min="0"
            step="0.01"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Select category</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="shoes">Shoes</option>
            <option value="jewelry">Jewelry</option>
            <option value="bags">Bags</option>
          </select>
        </div>
        
        <button
          onClick={addItem}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-ink-black font-medium rounded-lg transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="mb-6">
          <h5 className="text-md font-medium text-white mb-3">Bundle Items ({items.length})</h5>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-ink-700/30 rounded border border-ink-600">
                <div>
                  <div className="text-white font-medium">{item.name}</div>
                  <div className="text-ink-400 text-sm">${item.basePrice} • {item.category}</div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-ink-400 hover:text-error-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Preview */}
      {pricing && (
        <div className="bg-ink-700/30 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-medium text-white mb-4">Pricing Preview</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">${pricing.totalBasePrice.toFixed(2)}</div>
              <div className="text-ink-400 text-sm">Total Base Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">${pricing.pilotPricing.recommendedPrice.toFixed(2)}</div>
              <div className="text-ink-400 text-sm">Pilot Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">${pricing.subscriptionPricing.recommendedPrice.toFixed(2)}</div>
              <div className="text-ink-400 text-sm">{subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">${pricing.pilotPricing.netProfit.toFixed(2)}</div>
              <div className="text-ink-400 text-sm">Pilot Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">${pricing.subscriptionPricing.netProfit.toFixed(2)}</div>
              <div className="text-ink-400 text-sm">{subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Profit</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-ink-600/30 rounded border border-ink-500">
            <div className="text-sm text-ink-300">
              <strong>Commission Impact:</strong> Pilot phase has {commissionConfig.pilot.commissionRate * 100}% commission, 
              while {subscriptionTier} stylist tier offers {commissionConfig.stylistTiers[subscriptionTier].commissionRate * 100}% commission.
            </div>
          </div>
        </div>
      )}

      {/* Create Bundle Button */}
      <button
        onClick={handleCreateBundle}
        disabled={!bundleName || items.length === 0}
        className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-ink-600 disabled:cursor-not-allowed text-ink-black font-medium rounded-lg transition-colors"
      >
        Create Bundle
      </button>
    </div>
  )
}

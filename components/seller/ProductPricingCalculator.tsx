'use client'

import { useState, useMemo } from 'react'
import { 
  calculateSuggestedPrice, 
  getPricingRecommendations, 
  getDistancePricingImpact,
  DEFAULT_PRICING_STRATEGIES,
  type ProductPricing 
} from '@/lib/sellerPricing'

interface ProductPricingCalculatorProps {
  onPricingSelect: (_pricing: ProductPricing) => void
  defaultBasePrice?: number
  defaultCategory?: string
}

export function ProductPricingCalculator({ 
  onPricingSelect, 
  defaultBasePrice = 0,
  defaultCategory = ''
}: ProductPricingCalculatorProps) {
  const [basePrice, setBasePrice] = useState(defaultBasePrice)
  const [category, setCategory] = useState(defaultCategory)
  const [selectedStrategy, setSelectedStrategy] = useState('balanced')
  const [customMarkup, setCustomMarkup] = useState(12)

  // Calculate pricing recommendations
  const recommendations = useMemo(() => {
    if (basePrice <= 0) return null
    return getPricingRecommendations(basePrice, category, 8)
  }, [basePrice, category])

  // Calculate distance impact
  const distanceImpact = useMemo(() => {
    if (basePrice <= 0) return []
    return getDistancePricingImpact(basePrice, customMarkup)
  }, [basePrice, customMarkup])

  // Get current pricing based on selected strategy
  const currentPricing = useMemo(() => {
    if (basePrice <= 0) return null
    
    const strategy = DEFAULT_PRICING_STRATEGIES.find(s => s.id === selectedStrategy)
    const markup = strategy ? strategy.markupPercentage : customMarkup
    
    return calculateSuggestedPrice(basePrice, markup, 8)
  }, [basePrice, selectedStrategy, customMarkup])

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId)
    if (strategyId === 'custom') {
      // Custom markup will be used
    } else {
      const strategy = DEFAULT_PRICING_STRATEGIES.find(s => s.id === strategyId)
      if (strategy && currentPricing) {
        onPricingSelect(currentPricing)
      }
    }
  }

  const handleCustomMarkupChange = (markup: number) => {
    setCustomMarkup(markup)
    setSelectedStrategy('custom')
    const pricing = calculateSuggestedPrice(basePrice, markup, 8)
    onPricingSelect(pricing)
  }

  if (!recommendations) {
    return (
      <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pricing Calculator</h3>
        <p className="text-ink-400">Enter a base price to see pricing recommendations</p>
      </div>
    )
  }

  return (
    <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-white mb-4">Smart Pricing Calculator</h3>
      
      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Base Price (Your Cost)
          </label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-ink-600 bg-ink-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Select Category</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home & Garden</option>
            <option value="beauty">Beauty & Health</option>
            <option value="sports">Sports & Outdoors</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </div>

      {/* Pricing Strategies */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-white mb-3">Pricing Strategy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEFAULT_PRICING_STRATEGIES.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => handleStrategySelect(strategy.id)}
              className={`p-3 rounded-lg border transition-colors ${
                selectedStrategy === strategy.id
                  ? 'border-brand-400 bg-brand-400/10 text-brand-400'
                  : 'border-ink-600 bg-ink-700/50 text-ink-300 hover:border-ink-500'
              }`}
            >
              <div className="font-medium">{strategy.name}</div>
              <div className="text-sm opacity-75">{strategy.markupPercentage}% markup</div>
            </button>
          ))}
          
          <button
            onClick={() => handleStrategySelect('custom')}
            className={`p-3 rounded-lg border transition-colors ${
              selectedStrategy === 'custom'
                ? 'border-brand-400 bg-brand-400/10 text-brand-400'
                : 'border-ink-600 bg-ink-700/50 text-ink-300 hover:border-ink-500'
            }`}
          >
            <div className="font-medium">Custom</div>
            <div className="text-sm opacity-75">{customMarkup}% markup</div>
          </button>
        </div>
      </div>

      {/* Custom Markup Slider */}
      {selectedStrategy === 'custom' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Custom Markup: {customMarkup}%
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={customMarkup}
            onChange={(e) => handleCustomMarkupChange(Number(e.target.value))}
            className="w-full h-2 bg-ink-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-ink-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>
      )}

      {/* Pricing Recommendations */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-white mb-3">Pricing Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['conservative', 'balanced', 'premium'] as const).map((strategy) => {
            const pricing = recommendations[strategy]
            const isRecommended = recommendations.recommended === strategy
            
            return (
              <div
                key={strategy}
                className={`p-4 rounded-lg border ${
                  isRecommended
                    ? 'border-brand-400 bg-brand-400/10'
                    : 'border-ink-600 bg-ink-700/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white capitalize">{strategy}</span>
                  {isRecommended && (
                    <span className="text-xs bg-brand-400 text-ink-black px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-400">Suggested Price:</span>
                    <span className="text-white font-medium">${pricing.suggestedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Markup:</span>
                    <span className="text-ink-300">${pricing.markupAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Support Fee:</span>
                    <span className="text-ink-300">${pricing.estimatedSupportFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Profit:</span>
                    <span className="text-brand-400 font-medium">${pricing.estimatedProfit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Margin:</span>
                    <span className="text-brand-400 font-medium">{pricing.profitMargin}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Distance Impact */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Distance Impact on Profit</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-600">
                <th className="text-left py-2 text-ink-400">Distance</th>
                <th className="text-right py-2 text-ink-400">Support Fee</th>
                <th className="text-right py-2 text-ink-400">Profit</th>
                <th className="text-right py-2 text-ink-400">Margin</th>
              </tr>
            </thead>
            <tbody>
              {distanceImpact.map(({ distance, pricing }) => (
                <tr key={distance} className="border-b border-ink-700/30">
                  <td className="py-2 text-white">{distance} miles</td>
                  <td className="py-2 text-right text-ink-300">${pricing.estimatedSupportFee}</td>
                  <td className="py-2 text-right text-brand-400">${pricing.estimatedProfit}</td>
                  <td className="py-2 text-right text-brand-400">{pricing.profitMargin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Selection Summary */}
      {currentPricing && (
        <div className="mt-6 p-4 bg-ink-700/50 rounded-lg border border-ink-600">
          <h4 className="text-md font-medium text-white mb-2">Selected Pricing</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-ink-400">Base Price:</span>
              <div className="text-white font-medium">${currentPricing.basePrice}</div>
            </div>
            <div>
              <span className="text-ink-400">Suggested Price:</span>
              <div className="text-white font-medium">${currentPricing.suggestedPrice}</div>
            </div>
            <div>
              <span className="text-ink-400">Estimated Profit:</span>
              <div className="text-brand-400 font-medium">${currentPricing.estimatedProfit}</div>
            </div>
            <div>
              <span className="text-ink-400">Profit Margin:</span>
              <div className="text-brand-400 font-medium">{currentPricing.profitMargin}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

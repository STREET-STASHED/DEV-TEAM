'use client'

import { useState } from 'react'
import { ProductPricingCalculator } from '@/components/seller/ProductPricingCalculator'
import { SellerPricingDashboard } from '@/components/seller/SellerPricingDashboard'
import { CommissionCalculator } from '@/components/seller/CommissionCalculator'
import { type ProductPricing } from '@/lib/sellerPricing'

// Mock data for demo
const mockProducts = [
  {
    id: '1',
    name: 'Vintage Denim Jacket',
    basePrice: 25.00,
    suggestedPrice: 28.00,
    supportFee: 2.50,
    category: 'clothing'
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    basePrice: 45.00,
    suggestedPrice: 52.00,
    supportFee: 3.20,
    category: 'electronics'
  },
  {
    id: '3',
    name: 'Handmade Ceramic Mug',
    basePrice: 12.00,
    suggestedPrice: 14.50,
    supportFee: 1.80,
    category: 'home'
  },
  {
    id: '4',
    name: 'Premium Leather Wallet',
    basePrice: 35.00,
    suggestedPrice: 42.00,
    supportFee: 2.80,
    category: 'accessories'
  },
  {
    id: '5',
    name: 'Organic Face Cream',
    basePrice: 18.00,
    suggestedPrice: 22.00,
    supportFee: 2.10,
    category: 'beauty'
  }
]

export default function SellerPricingDemoPage() {
  const [selectedPricing, setSelectedPricing] = useState<ProductPricing | null>(null)
  const [activeTab, setActiveTab] = useState<'calculator' | 'dashboard' | 'commission'>('calculator')

  return (
    <div className="min-h-screen bg-ink-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Seller Pricing Tools
          </h1>
          <p className="text-ink-300 max-w-2xl mx-auto">
            Smart pricing calculator and dashboard to help sellers optimize their product pricing 
            and account for StreetStashed support fees while maintaining healthy profit margins.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-ink-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-brand-600 text-black'
                  : 'text-ink-300 hover:text-white'
              }`}
            >
              Pricing Calculator
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-brand-600 text-black'
                  : 'text-ink-300 hover:text-white'
              }`}
            >
              Analytics Dashboard
            </button>
            <button
              onClick={() => setActiveTab('commission')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'commission'
                  ? 'bg-brand-600 text-black'
                  : 'text-ink-300 hover:text-white'
              }`}
            >
              Commission Calculator
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'calculator' ? (
          <div className="max-w-4xl mx-auto">
            <ProductPricingCalculator
              onPricingSelect={setSelectedPricing}
              defaultBasePrice={25}
              defaultCategory="clothing"
            />
            
            {selectedPricing && (
              <div className="mt-8 bg-ink-800 border border-ink-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Selected Pricing Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-ink-400">Base Price:</span>
                    <div className="text-white font-medium">${selectedPricing.basePrice}</div>
                  </div>
                  <div>
                    <span className="text-ink-400">Suggested Price:</span>
                    <div className="text-white font-medium">${selectedPricing.suggestedPrice}</div>
                  </div>
                  <div>
                    <span className="text-ink-400">Estimated Profit:</span>
                    <div className="text-brand-400 font-medium">${selectedPricing.estimatedProfit}</div>
                  </div>
                  <div>
                    <span className="text-ink-400">Profit Margin:</span>
                    <div className="text-brand-400 font-medium">{selectedPricing.profitMargin}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="max-w-6xl mx-auto">
            <SellerPricingDashboard
              products={mockProducts}
            />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <CommissionCalculator />
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="text-brand-400 text-2xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Pricing</h3>
              <p className="text-ink-300 text-sm">
                Automatically calculate optimal pricing based on your costs, category, and support fees.
              </p>
            </div>
            
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="text-brand-400 text-2xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Profit Analytics</h3>
              <p className="text-ink-300 text-sm">
                Track profit margins, support fees, and pricing strategies across your entire inventory.
              </p>
            </div>
            
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="text-brand-400 text-2xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Distance Impact</h3>
              <p className="text-ink-300 text-sm">
                See how delivery distance affects your profit margins and adjust pricing accordingly.
              </p>
            </div>
            
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="text-brand-400 text-2xl mb-3">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">Category Insights</h3>
              <p className="text-ink-300 text-sm">
                Compare performance across different product categories and optimize your strategy.
              </p>
            </div>
            
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="text-brand-400 text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Updates</h3>
              <p className="text-ink-300 text-sm">
                Get instant feedback on pricing changes and their impact on your bottom line.
              </p>
            </div>
            
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="text-brand-400 text-2xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-white mb-2">Multiple Strategies</h3>
              <p className="text-ink-300 text-sm">
                Choose from conservative, balanced, premium, or custom pricing strategies.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Strategy Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Pricing Strategy Comparison
          </h2>
          
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-600">
                    <th className="text-left py-3 text-ink-400">Strategy</th>
                    <th className="text-right py-3 text-ink-400">Markup</th>
                    <th className="text-right py-3 text-ink-400">Best For</th>
                    <th className="text-right py-3 text-ink-400">Typical Margin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink-700/30">
                    <td className="py-3 text-white font-medium">Conservative</td>
                    <td className="py-3 text-right text-ink-300">8%</td>
                    <td className="py-3 text-right text-ink-300">Low-value items, competitive markets</td>
                    <td className="py-3 text-right text-brand-400">3-5%</td>
                  </tr>
                  <tr className="border-b border-ink-700/30">
                    <td className="py-3 text-white font-medium">Balanced</td>
                    <td className="py-3 text-right text-ink-300">12%</td>
                    <td className="py-3 text-right text-ink-300">Most products, sustainable growth</td>
                    <td className="py-3 text-right text-brand-400">6-8%</td>
                  </tr>
                  <tr className="border-b border-ink-700/30">
                    <td className="py-3 text-white font-medium">Premium</td>
                    <td className="py-3 text-right text-ink-300">18%</td>
                    <td className="py-3 text-right text-ink-300">High-value items, luxury goods</td>
                    <td className="py-3 text-right text-brand-400">10-12%</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-white font-medium">Aggressive</td>
                    <td className="py-3 text-right text-ink-300">25%</td>
                    <td className="py-3 text-right text-ink-300">Niche markets, unique products</td>
                    <td className="py-3 text-right text-brand-400">15-18%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

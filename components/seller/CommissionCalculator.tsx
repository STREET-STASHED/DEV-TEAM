'use client'

import { useState } from 'react'
import { 
  compareCommissionScenarios,
  getCommissionSavings,
  isSubscriptionWorthIt,
  calculateTierBenefits,
  commissionConfig 
} from '@/lib/commissionConfig'

export function CommissionCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(5000)
  const [orderTotal, setOrderTotal] = useState(150)
  const [selectedTier, setSelectedTier] = useState<'silver' | 'gold' | 'platinum' | 'diamond'>('gold')
  const [currentOrders, setCurrentOrders] = useState(20)
  const [userType, setUserType] = useState<'seller' | 'stylist'>('seller')

  const scenarios = compareCommissionScenarios(orderTotal, 15, userType)
  const tierBenefits = calculateTierBenefits(currentOrders, monthlyRevenue, userType)
  const tiers = userType === 'stylist' ? commissionConfig.stylistTiers : commissionConfig.sellerTiers

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* User Type Toggle */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Your Business Type</h3>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setUserType('seller')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              userType === 'seller'
                ? 'bg-brand-600 text-ink-black'
                : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
            }`}
          >
            🏪 Seller/Boutique
          </button>
          <button
            onClick={() => setUserType('stylist')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              userType === 'stylist'
                ? 'bg-brand-600 text-ink-black'
                : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
            }`}
          >
            👗 Stylist/Services
          </button>
        </div>

        <div className="mt-4 p-3 bg-ink-700/30 rounded border border-ink-600">
          <div className="text-sm text-ink-300">
            <strong>{userType === 'stylist' ? 'Stylists' : 'Sellers'}</strong>: {userType === 'stylist' 
              ? 'Higher ticket values, lower volume, service-based pricing'
              : 'Volume-based, lower ticket values, product-focused pricing'
            }
          </div>
        </div>
      </div>

      {/* Commission Overview */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {userType === 'stylist' ? 'Stylist' : 'Seller'} Commission Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-ink-700/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white mb-1">18%</div>
            <div className="text-ink-400 text-sm">Pilot Rate</div>
            <div className="text-ink-500 text-xs">No subscription fee</div>
          </div>
          
          {Object.entries(tiers).map(([key, tier]) => (
            <div key={key} className="bg-ink-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-brand-400 mb-1">{tier.commissionRate * 100}%</div>
              <div className="text-ink-400 text-sm">{tier.name}</div>
              <div className="text-ink-500 text-xs">
                ${tier.monthlyFee}/mo • {tier.orderTarget > 0 ? `${tier.orderTarget} orders` : 'No target'}
              </div>
              {tier.cashback > 0 && (
                <div className="text-success-400 text-xs mt-1">
                  ${tier.cashback} cashback
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier Benefits Calculator */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Tier Benefits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">Monthly Revenue</label>
            <input
              type="number"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">Current Orders/Month</label>
            <input
              type="number"
              value={currentOrders}
              onChange={(e) => setCurrentOrders(Number(e.target.value))}
              className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-ink-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Current Status</h4>
            <span className="px-3 py-1 bg-brand-600/20 text-brand-400 rounded-full text-sm">
              {tierBenefits.currentTier === 'pilot' ? 'Pilot' : tiers[tierBenefits.currentTier as keyof typeof tiers]?.name}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-ink-400 text-sm">Monthly Revenue</div>
              <div className="text-white font-medium">{formatCurrency(monthlyRevenue)}</div>
            </div>
            <div>
              <div className="text-ink-400 text-sm">Orders This Month</div>
              <div className="text-white font-medium">{currentOrders}</div>
            </div>
            <div>
              <div className="text-ink-400 text-sm">Potential Cashback</div>
              <div className="text-success-400 font-medium">
                {tierBenefits.cashbackEligible ? `$${tierBenefits.potentialCashback}` : 'Not eligible'}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-brand-400/10 border border-brand-400/20 rounded">
            <div className="text-brand-400 text-sm font-medium">💡 {tierBenefits.recommendation}</div>
          </div>
        </div>

        {/* Next Tier Progress */}
        {tierBenefits.nextTier && (
          <div className="bg-ink-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Next Tier: {tiers[tierBenefits.nextTier as keyof typeof tiers]?.name}</h4>
              <span className="text-ink-400 text-sm">
                {currentOrders}/{tiers[tierBenefits.nextTier as keyof typeof tiers]?.orderTarget} orders
              </span>
            </div>
            
            <div className="w-full bg-ink-600 rounded-full h-2 mb-3">
              <div 
                className="bg-brand-400 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (currentOrders / tiers[tierBenefits.nextTier as keyof typeof tiers]?.orderTarget) * 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="text-ink-400 text-sm">
              {tiers[tierBenefits.nextTier as keyof typeof tiers]?.orderTarget - currentOrders} more orders needed
            </div>
          </div>
        )}
      </div>

      {/* Per-Order Calculator */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Per-Order Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">Order Total</label>
            <input
              type="number"
              value={orderTotal}
              onChange={(e) => setOrderTotal(Number(e.target.value))}
              className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">Compare Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as 'silver' | 'gold' | 'platinum' | 'diamond')}
              className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond Elite</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-ink-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Pilot Plan</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-400 text-sm">Commission Rate:</span>
                <span className="text-white">{(scenarios.pilot.commissionRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400 text-sm">Commission:</span>
                <span className="text-error-400">{formatCurrency(scenarios.pilot.commissionAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400 text-sm">Your Earnings:</span>
                <span className="text-success-400 font-medium">{formatCurrency(scenarios.pilot.netEarnings)}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-400/10 border border-brand-400/20 rounded-lg p-4">
            <h4 className="text-brand-400 font-medium mb-3">{scenarios[selectedTier].description}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-400 text-sm">Commission Rate:</span>
                <span className="text-white">{(scenarios[selectedTier].commissionRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400 text-sm">Commission:</span>
                <span className="text-error-400">{formatCurrency(scenarios[selectedTier].commissionAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400 text-sm">Your Earnings:</span>
                <span className="text-success-400 font-medium">{formatCurrency(scenarios[selectedTier].netEarnings)}</span>
              </div>
              <div className="border-t border-brand-400/20 pt-2">
                <div className="flex justify-between">
                  <span className="text-ink-400 text-sm">Monthly Fee:</span>
                  <span className="text-white">${scenarios[selectedTier].monthlyFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400 text-sm">Cashback (if eligible):</span>
                  <span className="text-success-400">-${scenarios[selectedTier].cashback}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-ink-400 text-sm">Effective Fee:</span>
                  <span className="text-white">${scenarios[selectedTier].effectiveFee}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Analysis */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(tiers).map(([key, tier]) => {
            const savings = getCommissionSavings(monthlyRevenue, false, key as keyof typeof tiers, userType)
            const worthIt = isSubscriptionWorthIt(monthlyRevenue, key as keyof typeof tiers, userType)
            
            return (
              <div key={key} className={`rounded-lg p-4 ${
                worthIt.worthIt ? 'bg-success-400/10 border border-success-400/20' : 'bg-ink-700/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{tier.name}</h4>
                  {worthIt.worthIt && (
                    <span className="text-success-400 text-xs">✓ Worth It</span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-400">Commission:</span>
                    <span className="text-white">{(tier.commissionRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Monthly Fee:</span>
                    <span className="text-white">${tier.monthlyFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Order Target:</span>
                    <span className="text-white">{tier.orderTarget > 0 ? tier.orderTarget : 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Cashback:</span>
                    <span className="text-success-400">${tier.cashback}</span>
                  </div>
                  
                  <div className="border-t border-ink-600 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-ink-400">Monthly Savings:</span>
                      <span className={savings.monthlySavings > 0 ? 'text-success-400' : 'text-error-400'}>
                        {savings.monthlySavings > 0 ? '+' : ''}{formatCurrency(savings.monthlySavings)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-ink-700/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">💡 Key Insights</h4>
          <div className="space-y-2 text-sm text-ink-300">
            <div>• <strong>Cashback Incentive:</strong> Hit your order target to unlock cashback and reduce your effective monthly fee</div>
            <div>• <strong>Volume Benefits:</strong> Higher tiers offer lower commission rates for better profitability</div>
            <div>• <strong>Clear Progression:</strong> Each tier has achievable order targets with meaningful rewards</div>
            <div>• <strong>Risk-Free:</strong> You always profit - either from subscription fees or increased commission volume</div>
            {userType === 'stylist' && (
              <div>• <strong>Stylist Advantage:</strong> Lower fees and commission rates due to higher ticket values and service-based model</div>
            )}
          </div>
        </div>
      </div>

      {/* Tier Comparison Table */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {userType === 'stylist' ? 'Stylist' : 'Seller'} Tier Comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-600">
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Tier</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Monthly Fee</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Order Target</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Cashback</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Effective Fee</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Commission</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink-700">
                <td className="py-3 px-4 text-white font-medium">Pilot</td>
                <td className="py-3 px-4 text-white">$0</td>
                <td className="py-3 px-4 text-white">-</td>
                <td className="py-3 px-4 text-white">-</td>
                <td className="py-3 px-4 text-white">$0</td>
                <td className="py-3 px-4 text-error-400 font-medium">18%</td>
                <td className="py-3 px-4 text-ink-400">Getting started</td>
              </tr>
              {Object.entries(tiers).map(([key, tier]) => (
                <tr key={key} className="border-b border-ink-700">
                  <td className="py-3 px-4 text-white font-medium">{tier.name}</td>
                  <td className="py-3 px-4 text-white">${tier.monthlyFee}</td>
                  <td className="py-3 px-4 text-white">{tier.orderTarget > 0 ? `${tier.orderTarget} orders` : 'None'}</td>
                  <td className="py-3 px-4 text-success-400">${tier.cashback}</td>
                  <td className="py-3 px-4 text-white">${tier.effectiveFee}</td>
                  <td className="py-3 px-4 text-error-400 font-medium">{(tier.commissionRate * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-ink-400">{tier.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

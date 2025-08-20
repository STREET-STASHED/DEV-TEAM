'use client'


import { 
  calculateSellerPoints,
  calculateSellerDiscount,
  getAllSellerTiers,
  rewardsConfig 
} from '@/lib/rewardsConfig'

interface SellerRewardsProps {
  currentTier: string
  monthlySales: number
  currentPoints: number
  onUpgradeTier: (_tier: string) => void
}

export function SellerRewards({ currentTier, monthlySales, currentPoints, onUpgradeTier }: SellerRewardsProps) {

  
  const sellerTiers = getAllSellerTiers()
  const currentDiscount = calculateSellerDiscount(currentTier, monthlySales, currentPoints)
  const pointsEarned = calculateSellerPoints(monthlySales)

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
      {/* Current Status */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Subscription Rewards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-brand-400 mb-1">{pointsEarned}</div>
            <div className="text-ink-400 text-sm">Points Earned</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success-400 mb-1">${currentDiscount.actualDiscount}</div>
            <div className="text-ink-400 text-sm">Discount Earned</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(currentDiscount.finalSubscription)}</div>
            <div className="text-ink-400 text-sm">Final Subscription</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(monthlySales)}</div>
            <div className="text-ink-400 text-sm">Monthly Sales</div>
          </div>
        </div>

        <div className="bg-brand-400/10 border border-brand-400/20 rounded-lg p-4">
          <div className="text-sm text-ink-300">
            <strong>How it works:</strong> Earn {rewardsConfig.seller.pointsPerDollar * 100} point per $1 in sales. 
            Redeem points for subscription discounts. Higher sales = bigger discounts!
          </div>
        </div>
      </div>

      {/* Current Tier Details */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Current Tier: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-ink-400">Base Subscription:</span>
              <span className="text-white">{formatCurrency(currentDiscount.baseSubscription)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Max Discount:</span>
              <span className="text-success-400">{formatCurrency(currentDiscount.maxDiscount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Current Discount:</span>
              <span className="text-success-400">{formatCurrency(currentDiscount.actualDiscount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Final Subscription:</span>
              <span className="text-white font-medium">{formatCurrency(currentDiscount.finalSubscription)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-ink-400">Sales Progress</span>
                <span className="text-white">{Math.round(currentDiscount.salesProgress * 100)}%</span>
              </div>
              <div className="w-full bg-ink-600 rounded-full h-2">
                <div 
                  className="bg-success-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentDiscount.salesProgress * 100}%` }}
                ></div>
              </div>
              <div className="text-ink-400 text-xs mt-1">
                {currentDiscount.pointsNeeded > 0 
                  ? `${formatCurrency(monthlySales)} / ${formatCurrency(currentDiscount.baseSubscription * 10)} sales`
                  : 'Max discount achieved!'
                }
              </div>
            </div>
            
            <div className="bg-ink-700/30 rounded p-3">
              <div className="text-ink-400 text-sm mb-1">Commission Rate</div>
              <div className="text-white font-medium">
                {(sellerTiers.find(t => t.tier === currentTier)?.commissionRate || 0) * 100}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Tier Comparison</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-600">
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Tier</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Base Sub</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Max Discount</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Floor</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Commission</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Sales Threshold</th>
                <th className="text-left py-3 px-4 text-ink-300 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sellerTiers.map((tier) => {

                const isCurrentTier = tier.tier === currentTier
                const canUpgrade = tier.tier !== currentTier
                
                return (
                  <tr key={tier.tier} className={`border-b border-ink-700 ${
                    isCurrentTier ? 'bg-brand-400/10' : ''
                  }`}>
                    <td className="py-3 px-4 text-white font-medium">
                      {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                      {isCurrentTier && <span className="ml-2 text-brand-400 text-sm">(Current)</span>}
                    </td>
                    <td className="py-3 px-4 text-white">{formatCurrency(tier.baseSubscription)}</td>
                    <td className="py-3 px-4 text-success-400">{formatCurrency(tier.maxDiscount)}</td>
                    <td className="py-3 px-4 text-white">{formatCurrency(tier.floor)}</td>
                    <td className="py-3 px-4 text-white">{(tier.commissionRate * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-white">{formatCurrency(tier.salesThreshold)}</td>
                    <td className="py-3 px-4">
                      {isCurrentTier ? (
                        <span className="text-brand-400 text-sm">Current Tier</span>
                      ) : canUpgrade ? (
                        <button
                          onClick={() => onUpgradeTier(tier.tier)}
                          className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-ink-black text-sm rounded transition-colors"
                        >
                          Upgrade
                        </button>
                      ) : (
                        <span className="text-ink-500 text-sm">Locked</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points Earning Progress */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Points Earning</h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-400">Points earned this month</span>
              <span className="text-white">{pointsEarned}</span>
            </div>
            <div className="w-full bg-ink-600 rounded-full h-2">
              <div 
                className="bg-brand-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (pointsEarned / 1000) * 100)}%` }}
              ></div>
            </div>
            <div className="text-ink-400 text-xs mt-1">
              {1000 - pointsEarned > 0 ? `${1000 - pointsEarned} more points to next discount level` : 'Maximum discount achieved!'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-ink-700/30 rounded">
              <div className="text-lg font-bold text-brand-400">300</div>
              <div className="text-ink-400 text-sm">Points</div>
              <div className="text-success-400 text-xs">$30 Discount</div>
            </div>
            <div className="text-center p-3 bg-ink-700/30 rounded">
              <div className="text-lg font-bold text-brand-400">600</div>
              <div className="text-ink-400 text-sm">Points</div>
              <div className="text-success-400 text-xs">$60 Discount</div>
            </div>
            <div className="text-center p-3 bg-ink-700/30 rounded">
              <div className="text-lg font-bold text-brand-400">1,200</div>
              <div className="text-ink-400 text-sm">Points</div>
              <div className="text-success-400 text-xs">$120 Discount</div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-ink-700/30 rounded-lg p-4">
        <h5 className="text-white font-medium mb-2">Terms & Conditions</h5>
        <div className="text-ink-400 text-sm space-y-1">
          <div>• Points are earned at a rate of 1 point per $10 in sales</div>
          <div>• Discounts are applied to subscription fees only</div>
          <div>• Floor pricing ensures minimum subscription collection</div>
          <div>• Higher sales volumes unlock larger discounts</div>
          <div>• Points reset monthly but tier benefits persist</div>
        </div>
      </div>
    </div>
  )
}

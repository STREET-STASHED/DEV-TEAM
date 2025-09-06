'use client'

import { 
  calculateDriverTier,
  calculateDriverBonus,
  getAllDriverTiers
} from '@/lib/rewardsConfig'

interface DriverRewardsProps {
  ordersThisMonth: number
  basePay: number
  onViewProfile: () => void
}

export function DriverRewards({ ordersThisMonth, basePay, onViewProfile }: DriverRewardsProps) {
  const driverTier = calculateDriverTier(ordersThisMonth)
  const driverBonus = calculateDriverBonus(basePay, ordersThisMonth)
  const driverTiers = getAllDriverTiers()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Driver Rewards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-brand-400 mb-1">{ordersThisMonth}</div>
            <div className="text-ink-400 text-sm">Orders This Month</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success-400 mb-1">{driverTier.bonusPercentage}%</div>
            <div className="text-ink-400 text-sm">Bonus Rate</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(driverBonus.bonusAmount)}</div>
            <div className="text-ink-400 text-sm">Bonus Earned</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(driverBonus.totalPay)}</div>
            <div className="text-ink-400 text-sm">Total Pay</div>
          </div>
        </div>

        <div className="bg-brand-400/10 border border-brand-400/20 rounded-lg p-4">
          <div className="text-sm text-ink-300">
            <strong>How it works:</strong> Earn bonus percentages on your delivery pay based on monthly order volume. 
            Higher volume = bigger bonuses and exclusive badges!
          </div>
        </div>
      </div>

      {/* Current Tier Details */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Current Tier: {driverTier.tier.charAt(0).toUpperCase() + driverTier.tier.slice(1)}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{driverTier.badge}</div>
              <div>
                <div className="text-white font-medium">{driverTier.tier.charAt(0).toUpperCase() + driverTier.tier.slice(1)} Driver</div>
                <div className="text-ink-400 text-sm">{driverTier.description}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-ink-400">Base Pay:</span>
                <span className="text-white">{formatCurrency(driverBonus.basePay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Bonus Rate:</span>
                <span className="text-success-400">{driverTier.bonusPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Bonus Amount:</span>
                <span className="text-success-400">{formatCurrency(driverBonus.bonusAmount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-ink-400">Total Pay:</span>
                <span className="text-white">{formatCurrency(driverBonus.totalPay)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-ink-400">Progress to next tier</span>
                <span className="text-white">
                  {driverTier.nextTier ? `${ordersThisMonth} / ${driverTier.nextTier.ordersNeeded + ordersThisMonth}` : 'Max tier reached'}
                </span>
              </div>
              <div className="w-full bg-ink-600 rounded-full h-2">
                <div 
                  className="bg-success-400 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: driverTier.nextTier 
                      ? `${Math.min(100, (ordersThisMonth / (driverTier.nextTier.ordersNeeded + ordersThisMonth)) * 100)}%`
                      : '100%'
                  }}
                ></div>
              </div>
              <div className="text-ink-400 text-xs mt-1">
                {driverTier.nextTier 
                  ? `${driverTier.nextTier.ordersNeeded} more orders to ${driverTier.nextTier.tier} tier`
                  : 'You\'ve reached the top tier!'
                }
              </div>
            </div>
            
            {driverTier.nextTier && (
              <div className="bg-ink-700/30 rounded p-3">
                <div className="text-ink-400 text-sm mb-1">Next Tier Preview</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{driverTier.nextTier.badge}</span>
                  <div>
                    <div className="text-white font-medium">{driverTier.nextTier.tier.charAt(0).toUpperCase() + driverTier.nextTier.tier.slice(1)}</div>
                    <div className="text-success-400 text-sm">+{driverTier.nextTier.bonusPercentage}% bonus</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Tier Comparison</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {driverTiers.map((tier) => {
            const isCurrentTier = tier.tier === driverTier.tier
            const isUnlocked = ordersThisMonth >= tier.ordersPerMonth[0]
            
            return (
              <div 
                key={tier.tier}
                className={`p-4 rounded-lg border transition-colors ${
                  isCurrentTier 
                    ? 'bg-brand-400/20 border-brand-400' 
                    : isUnlocked
                    ? 'bg-ink-700/30 border-ink-600'
                    : 'bg-ink-800/50 border-ink-700 opacity-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{tier.badge || '🥉'}</div>
                  <div className="text-white font-medium mb-1">
                    {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                    {isCurrentTier && <span className="ml-1 text-brand-400 text-sm">(Current)</span>}
                  </div>
                  <div className="text-ink-400 text-sm mb-2">
                    {tier.ordersPerMonth[0]}-{tier.ordersPerMonth[1]} orders
                  </div>
                  <div className="text-success-400 font-medium">
                    +{tier.bonusPercentage}% bonus
                  </div>
                  {!isUnlocked && (
                    <div className="text-ink-500 text-xs mt-2">
                      {tier.ordersPerMonth[0] - ordersThisMonth} more orders needed
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badge Showcase */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Badge Showcase</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="text-white font-medium">Your Current Badge</h5>
            <div className="bg-ink-700/30 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">{driverTier.badge || '🥉'}</div>
              <div className="text-white font-medium text-lg mb-2">
                {driverTier.tier.charAt(0).toUpperCase() + driverTier.tier.slice(1)} Driver
              </div>
              <div className="text-ink-400 text-sm">{driverTier.description}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-white font-medium">Available Badges</h5>
            <div className="space-y-3">
              {driverTiers.map((tier) => (
                <div key={tier.tier} className="flex items-center space-x-3 p-3 bg-ink-700/30 rounded">
                  <div className="text-2xl">{tier.badge || '🥉'}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)} Badge
                    </div>
                    <div className="text-ink-400 text-sm">
                      {tier.ordersPerMonth[0]}-{tier.ordersPerMonth[1]} orders/month
                    </div>
                  </div>
                  <div className="text-success-400 font-medium">
                    +{tier.bonusPercentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onViewProfile}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-black font-medium rounded-lg transition-colors"
          >
            View My Driver Profile
          </button>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-ink-700/30 rounded-lg p-4">
        <h5 className="text-white font-medium mb-2">Terms & Conditions</h5>
        <div className="text-ink-400 text-sm space-y-1">
          <div>• Bonuses are calculated on base delivery pay only</div>
          <div>• Order counts reset monthly</div>
          <div>• Badges are permanent and show in your driver profile</div>
          <div>• Bonuses are paid out with regular delivery payments</div>
          <div>• Tier requirements are based on completed orders</div>
        </div>
      </div>
    </div>
  )
}

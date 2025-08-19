'use client'

import { useState } from 'react'
import { 
  calculateBuyerPoints,
  calculateBuyerCredit,
  getBuyerRedemptionOptions,
  rewardsConfig 
} from '@/lib/rewardsConfig'

interface BuyerRewardsProps {
  totalSpent: number
  currentPoints: number
  onRedeemPoints: (points: number, credit: number) => void
}

export function BuyerRewards({ totalSpent, currentPoints, onRedeemPoints }: BuyerRewardsProps) {
  const [selectedRedemption, setSelectedRedemption] = useState<number | null>(null)
  
  const redemptionOptions = getBuyerRedemptionOptions(currentPoints)
  const availableCredit = calculateBuyerCredit(currentPoints)
  const pointsEarned = calculateBuyerPoints(totalSpent)

  const handleRedeem = () => {
    if (selectedRedemption) {
      const option = redemptionOptions.find(opt => opt.points === selectedRedemption)
      if (option) {
        onRedeemPoints(option.points, option.credit)
        setSelectedRedemption(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Stashed Rewards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-brand-400 mb-1">{currentPoints}</div>
            <div className="text-ink-400 text-sm">Current Points</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success-400 mb-1">${availableCredit}</div>
            <div className="text-ink-400 text-sm">Available Credit</div>
          </div>
          <div className="bg-ink-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">${totalSpent}</div>
            <div className="text-ink-400 text-sm">Total Spent</div>
          </div>
        </div>

        <div className="bg-brand-400/10 border border-brand-400/20 rounded-lg p-4">
          <div className="text-sm text-ink-300">
            <strong>How it works:</strong> Earn {rewardsConfig.buyer.pointsPerDollar * 100} point per $1 spent. 
            Redeem points for delivery fee credits that can only be used on StreetStashed.
          </div>
        </div>
      </div>

      {/* Redemption Options */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Redeem Points</h4>
        
        {redemptionOptions.length > 0 ? (
          <div className="space-y-4">
            {redemptionOptions.map((option) => (
              <div 
                key={option.points}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedRedemption === option.points
                    ? 'bg-brand-400/20 border-brand-400'
                    : option.available
                    ? 'bg-ink-700/30 border-ink-600 hover:bg-ink-700/50'
                    : 'bg-ink-800/50 border-ink-700 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => option.available && setSelectedRedemption(option.points)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{option.description}</div>
                    <div className="text-ink-400 text-sm">
                      {option.available ? 'Available to redeem' : `${option.points - currentPoints} more points needed`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-success-400 font-medium">${option.credit}</div>
                    <div className="text-ink-400 text-sm">Credit Value</div>
                  </div>
                </div>
              </div>
            ))}

            {selectedRedemption && (
              <div className="mt-6 p-4 bg-success-400/10 border border-success-400/20 rounded-lg">
                <div className="text-success-400 text-sm mb-3">
                  <strong>Ready to redeem!</strong> You&apos;ll receive ${redemptionOptions.find(opt => opt.points === selectedRedemption)?.credit} in delivery fee credits.
                </div>
                <button
                  onClick={handleRedeem}
                  className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white font-medium rounded-lg transition-colors"
                >
                  Redeem {selectedRedemption} Points
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-ink-500 text-lg mb-2">No redemption options available</div>
            <div className="text-ink-400 text-sm">Start shopping to earn points!</div>
          </div>
        )}
      </div>

      {/* Points Earning Progress */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Earning Progress</h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-400">Points earned this month</span>
              <span className="text-white">{pointsEarned}</span>
            </div>
            <div className="w-full bg-ink-600 rounded-full h-2">
              <div 
                className="bg-brand-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (pointsEarned / 500) * 100)}%` }}
              ></div>
            </div>
            <div className="text-ink-400 text-xs mt-1">
              {500 - pointsEarned > 0 ? `${500 - pointsEarned} more points to first redemption` : 'Ready for redemption!'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-ink-700/30 rounded">
              <div className="text-lg font-bold text-brand-400">500</div>
              <div className="text-ink-400 text-sm">Points</div>
              <div className="text-success-400 text-xs">$5 Credit</div>
            </div>
            <div className="text-center p-3 bg-ink-700/30 rounded">
              <div className="text-lg font-bold text-brand-400">1,000</div>
              <div className="text-ink-400 text-sm">Points</div>
              <div className="text-success-400 text-xs">$10 Credit</div>
            </div>
            <div className="text-center p-3 bg-ink-700/30 rounded">
              <div className="text-lg font-bold text-brand-400">2,000</div>
              <div className="text-ink-400 text-sm">Points</div>
              <div className="text-success-400 text-xs">$20 Credit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-ink-700/30 rounded-lg p-4">
        <h5 className="text-white font-medium mb-2">Terms & Conditions</h5>
        <div className="text-ink-400 text-sm space-y-1">
          <div>• Points are earned at a rate of 1 point per $10 spent</div>
          <div>• Credits can only be used for delivery fees on StreetStashed</div>
          <div>• Credits cannot be withdrawn as cash</div>
          <div>• Points reset monthly but credits persist</div>
          <div>• Minimum redemption is 500 points for $5 credit</div>
        </div>
      </div>
    </div>
  )
}

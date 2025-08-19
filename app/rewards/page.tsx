'use client'

import { useState } from 'react'
import { BuyerRewards } from '@/components/rewards/BuyerRewards'
import { SellerRewards } from '@/components/rewards/SellerRewards'
import { DriverRewards } from '@/components/rewards/DriverRewards'

// Mock data - in real app this would come from user context/API
const mockUserData = {
  buyer: {
    totalSpent: 1250,
    currentPoints: 125,
    credits: 0
  },
  seller: {
    currentTier: 'silver',
    monthlySales: 4500,
    currentPoints: 450
  },
  driver: {
    ordersThisMonth: 35,
    basePay: 125.50
  }
}

export default function RewardsPage() {
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'driver'>('buyer')

  const handleBuyerRedeem = (points: number, credit: number) => {
    console.log(`Redeeming ${points} points for $${credit} credit`)
    // In real app, this would call an API to redeem points
    alert(`Successfully redeemed ${points} points for $${credit} in delivery fee credits!`)
  }

  const handleSellerUpgrade = (tier: string) => {
    console.log(`Upgrading to ${tier} tier`)
    // In real app, this would call an API to upgrade tier
    alert(`Successfully upgraded to ${tier} tier!`)
  }

  const handleDriverProfile = () => {
    console.log('Viewing driver profile')
    // In real app, this would navigate to driver profile
    alert('Navigating to driver profile...')
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">StreetStashed Rewards</h1>
          <p className="text-ink-400 text-lg">
            Earn points, unlock rewards, and maximize your benefits on StreetStashed
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-8">
          <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Select Your Role</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setUserRole('buyer')}
                className={`p-4 rounded-lg border transition-colors ${
                  userRole === 'buyer'
                    ? 'bg-brand-400/20 border-brand-400'
                    : 'bg-ink-700/30 border-ink-600 hover:bg-ink-700/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🛍️</div>
                  <div className="text-white font-medium">Buyer</div>
                  <div className="text-ink-400 text-sm">Earn points on purchases</div>
                </div>
              </button>
              
              <button
                onClick={() => setUserRole('seller')}
                className={`p-4 rounded-lg border transition-colors ${
                  userRole === 'seller'
                    ? 'bg-brand-400/20 border-brand-400'
                    : 'bg-ink-700/30 border-ink-600 hover:bg-ink-700/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏪</div>
                  <div className="text-white font-medium">Seller</div>
                  <div className="text-ink-400 text-sm">Subscription discounts</div>
                </div>
              </button>
              
              <button
                onClick={() => setUserRole('driver')}
                className={`p-4 rounded-lg border transition-colors ${
                  userRole === 'driver'
                    ? 'bg-brand-400/20 border-brand-400'
                    : 'bg-ink-700/30 border-ink-600 hover:bg-ink-700/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🚗</div>
                  <div className="text-white font-medium">Driver</div>
                  <div className="text-ink-400 text-sm">Bonuses & badges</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Rewards Content */}
        <div className="mb-8">
          {userRole === 'buyer' && (
            <BuyerRewards
              totalSpent={mockUserData.buyer.totalSpent}
              currentPoints={mockUserData.buyer.currentPoints}
              onRedeemPoints={handleBuyerRedeem}
            />
          )}
          
          {userRole === 'seller' && (
            <SellerRewards
              currentTier={mockUserData.seller.currentTier}
              monthlySales={mockUserData.seller.monthlySales}
              currentPoints={mockUserData.seller.currentPoints}
              onUpgradeTier={handleSellerUpgrade}
            />
          )}
          
          {userRole === 'driver' && (
            <DriverRewards
              ordersThisMonth={mockUserData.driver.ordersThisMonth}
              basePay={mockUserData.driver.basePay}
              onViewProfile={handleDriverProfile}
            />
          )}
        </div>

        {/* System Overview */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Rewards System Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-white font-medium">🛍️ Buyer Rewards</h3>
              <div className="text-ink-400 text-sm space-y-1">
                <div>• 1 point per $10 spent</div>
                <div>• Redeem for delivery fee credits</div>
                <div>• Credits locked to StreetStashed</div>
                <div>• Monthly point reset</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-white font-medium">🏪 Seller Rewards</h3>
              <div className="text-ink-400 text-sm space-y-1">
                <div>• 1 point per $10 in sales</div>
                <div>• Subscription fee discounts</div>
                <div>• Floor pricing protection</div>
                <div>• Sales-based progression</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-white font-medium">🚗 Driver Rewards</h3>
              <div className="text-ink-400 text-sm space-y-1">
                <div>• Bonus % on delivery pay</div>
                <div>• Exclusive driver badges</div>
                <div>• Monthly order targets</div>
                <div>• Permanent status recognition</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Benefits */}
        <div className="mt-8 bg-brand-400/10 border border-brand-400/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-brand-400 mb-4">Why This System Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-2">For Users</h3>
              <div className="text-ink-400 text-sm space-y-1">
                <div>• Clear value proposition for each role</div>
                <div>• Achievable goals with meaningful rewards</div>
                <div>• Gamification increases engagement</div>
                <div>• Rewards scale with usage</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">For Platform</h3>
              <div className="text-ink-400 text-sm space-y-1">
                <div>• Always profitable - rewards pay for themselves</div>
                <div>• Increases user retention and engagement</div>
                <div>• Drives higher order volumes</div>
                <div>• Creates competitive moat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

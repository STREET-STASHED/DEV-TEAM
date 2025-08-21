import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Rewards',
  description: 'Earn points and unlock exclusive rewards',
}

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-ink-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Rewards & Points</h1>
          <p className="text-xl text-ink-300 max-w-3xl mx-auto">
            Earn points for every action, unlock exclusive perks, and get cash rewards for your fashion choices
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-gradient-to-r from-brand-500/20 to-purple-500/20 rounded-2xl p-8 border border-brand-400/30 mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Your Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-brand-400 mb-2">2,847</div>
                <div className="text-ink-300">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-400 mb-2">Gold</div>
                <div className="text-ink-300">Member Level</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">$28.47</div>
                <div className="text-ink-300">Cash Value</div>
              </div>
            </div>
            <div className="w-full bg-ink-700 rounded-full h-4 mb-4">
              <div className="bg-gradient-to-r from-brand-500 to-purple-500 h-4 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-ink-300 text-sm">750 points until Platinum level</p>
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How to Earn Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-400 text-2xl">🛍️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Shopping</h3>
              <p className="text-ink-300 text-sm">1 point per $1 spent</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 text-2xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Reviews</h3>
              <p className="text-ink-300 text-sm">50 points per review</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Social Sharing</h3>
              <p className="text-ink-300 text-sm">25 points per share</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-400 text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Challenges</h3>
              <p className="text-ink-300 text-sm">100-500 points per challenge</p>
            </div>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Available Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cash Rewards */}
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-400/30">
              <div className="text-center mb-4">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Cash Rewards</h3>
              <p className="text-ink-300 text-sm text-center mb-4">Convert points to cash</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">1,000 points</span>
                  <span className="text-white font-semibold">$10.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">5,000 points</span>
                  <span className="text-white font-semibold">$55.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">10,000 points</span>
                  <span className="text-white font-semibold">$120.00</span>
                </div>
              </div>
              <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                Redeem Cash
              </button>
            </div>

            {/* Discount Codes */}
            <div className="bg-gradient-to-r from-brand-500/20 to-brand-600/20 rounded-xl p-6 border border-brand-400/30">
              <div className="text-center mb-4">
                <span className="text-4xl">🎫</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Discount Codes</h3>
              <p className="text-ink-300 text-sm text-center mb-4">Save on your next purchase</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">500 points</span>
                  <span className="text-white font-semibold">10% off</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">1,000 points</span>
                  <span className="text-white font-semibold">20% off</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">2,000 points</span>
                  <span className="text-white font-semibold">30% off</span>
                </div>
              </div>
              <button className="w-full bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                Get Discount
              </button>
            </div>

            {/* Free Shipping */}
            <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-400/30">
              <div className="text-center mb-4">
                <span className="text-4xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Free Shipping</h3>
              <p className="text-ink-300 text-sm text-center mb-4">Free delivery on all orders</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">300 points</span>
                  <span className="text-white font-semibold">1 month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">800 points</span>
                  <span className="text-white font-semibold">3 months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">1,500 points</span>
                  <span className="text-white font-semibold">1 year</span>
                </div>
              </div>
              <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                Activate Shipping
              </button>
            </div>
          </div>
        </div>

        {/* Member Levels */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Member Levels</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-ink-800 rounded-lg border border-ink-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-ink-600 rounded-full flex items-center justify-center">
                  <span className="text-ink-300 text-lg">🥉</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Bronze</h3>
                  <p className="text-ink-300 text-sm">0 - 999 points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-ink-300 text-sm">1x points</p>
                <p className="text-ink-300 text-sm">Basic rewards</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-brand-500/20 rounded-lg border border-brand-400/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🥈</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Gold</h3>
                  <p className="text-brand-300 text-sm">1,000 - 2,999 points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-brand-300 text-sm">1.5x points</p>
                <p className="text-brand-300 text-sm">Enhanced rewards</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-ink-800 rounded-lg border border-ink-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🥇</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Platinum</h3>
                  <p className="text-ink-300 text-sm">3,000 - 9,999 points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-ink-300 text-sm">2x points</p>
                <p className="text-ink-300 text-sm">Premium rewards</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-ink-800 rounded-lg border border-ink-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">💎</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Diamond</h3>
                  <p className="text-ink-300 text-sm">10,000+ points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-ink-300 text-sm">3x points</p>
                <p className="text-ink-300 text-sm">Exclusive rewards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link href="/buyer/dashboard" className="inline-flex items-center space-x-2 bg-ink-800 hover:bg-ink-700 px-6 py-3 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

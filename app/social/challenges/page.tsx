import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Social Challenges',
  description: 'Participate in viral challenges and win prizes',
}

export default function SocialChallengesPage() {
  return (
    <div className="min-h-screen bg-ink-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Viral Challenges</h1>
          <p className="text-xl text-ink-300 max-w-3xl mx-auto">
            Show off your style, participate in trending challenges, and win amazing prizes while building your following
          </p>
        </div>

        {/* Active Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Challenge 1 */}
          <div className="bg-gradient-to-r from-brand-500/20 to-brand-600/20 rounded-2xl p-8 border border-brand-400/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Streetwear Showdown</h3>
              <span className="bg-brand-500 text-white text-sm px-3 py-1 rounded-full">Live Now</span>
            </div>
            <p className="text-ink-300 text-base mb-6">
              Show off your best streetwear fit and win up to $1000 in prizes. 
              Share your look on social media with #StreetwearShowdown
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Participants</span>
                <span className="text-white font-semibold">2,847</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Deadline</span>
                <span className="text-white font-semibold">3 days left</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Prize Pool</span>
                <span className="text-white font-semibold">$5,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Entry Fee</span>
                <span className="text-white font-semibold">Free</span>
              </div>
            </div>
            <Link href="/social/challenges/join" className="w-full bg-brand-500 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-brand-600 transition-colors text-center block">
              Join Challenge
            </Link>
          </div>

          {/* Challenge 2 */}
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl p-8 border border-purple-400/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Style Transformation</h3>
              <span className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full">New</span>
            </div>
            <p className="text-ink-300 text-base mb-6">
              Transform your style with before/after photos and win styling sessions with top stylists. 
              Use #StyleTransformation to enter
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Participants</span>
                <span className="text-white font-semibold">1,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Deadline</span>
                <span className="text-white font-semibold">7 days left</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Prize Pool</span>
                <span className="text-white font-semibold">$2,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Entry Fee</span>
                <span className="text-white font-semibold">Free</span>
              </div>
            </div>
            <Link href="/social/challenges/join" className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-purple-600 transition-colors text-center block">
              Join Challenge
            </Link>
          </div>

          {/* Challenge 3 */}
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl p-8 border border-green-400/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Brand Ambassador</h3>
              <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">Coming Soon</span>
            </div>
            <p className="text-ink-300 text-base mb-6">
              Become a brand ambassador for your favorite streetwear brands. 
              Create content and earn exclusive rewards and partnerships
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Participants</span>
                <span className="text-white font-semibold">Coming Soon</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Start Date</span>
                <span className="text-white font-semibold">Next Week</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Rewards</span>
                <span className="text-white font-semibold">Partnerships</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Entry Fee</span>
                <span className="text-white font-semibold">Free</span>
              </div>
            </div>
            <button className="w-full bg-green-500 text-white px-6 py-3 rounded-lg text-base font-medium opacity-50 cursor-not-allowed text-center">
              Coming Soon
            </button>
          </div>

          {/* Challenge 4 */}
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl p-8 border border-orange-400/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Street Style Photography</h3>
              <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full">Voting</span>
            </div>
            <p className="text-ink-300 text-base mb-6">
              Submit your best street style photography and compete for recognition. 
              Winners get featured in our style magazine
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Participants</span>
                <span className="text-white font-semibold">3,456</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Phase</span>
                <span className="text-white font-semibold">Voting</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Prize</span>
                <span className="text-white font-semibold">Magazine Feature</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Entry Fee</span>
                <span className="text-white font-semibold">Free</span>
              </div>
            </div>
            <button className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-orange-600 transition-colors text-center">
              Vote Now
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How Challenges Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Join a Challenge</h3>
              <p className="text-ink-300">Browse available challenges and join the ones that interest you</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create & Share</h3>
              <p className="text-ink-300">Create your entry and share it on social media with the challenge hashtag</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Win Prizes</h3>
              <p className="text-ink-300">Get votes, win prizes, and build your following in the fashion community</p>
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

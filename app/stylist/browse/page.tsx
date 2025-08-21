import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Browse Stylists',
  description: 'Discover top stylists and book styling sessions',
}

export default function StylistBrowsePage() {
  return (
    <div className="min-h-screen bg-ink-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Discover Top Stylists</h1>
          <p className="text-xl text-ink-300 max-w-3xl mx-auto">
            Connect with professional stylists who can transform your look and help you discover your unique style
          </p>
        </div>

        {/* Featured Stylists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Stylist Card 1 */}
          <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 hover:border-brand-400/50 transition-colors">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">StyleMaster Pro</h3>
                <p className="text-brand-400 text-sm">Premium Stylist</p>
                <p className="text-ink-300 text-sm">4.9 ★ (2.1k reviews)</p>
              </div>
            </div>
            <p className="text-ink-300 text-base mb-6">
              Curated collections from top streetwear brands with personalized styling advice. 
              Specializes in streetwear and urban fashion.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Starting at</span>
                <span className="text-white font-semibold">$150/session</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Experience</span>
                <span className="text-white font-semibold">8+ years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Specialties</span>
                <span className="text-white font-semibold">Streetwear, Urban</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Link href="/stylist/book-session" className="flex-1 bg-brand-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors text-center">
                Book Session
              </Link>
              <Link href="/stylist/collections" className="flex-1 bg-ink-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors text-center">
                View Collection
              </Link>
            </div>
          </div>

          {/* Stylist Card 2 */}
          <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 hover:border-purple-400/50 transition-colors">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">F</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">Fashion Forward</h3>
                <p className="text-purple-400 text-sm">Trendsetter</p>
                <p className="text-ink-300 text-sm">4.8 ★ (1.8k reviews)</p>
              </div>
            </div>
            <p className="text-ink-300 text-base mb-6">
              Trendsetting looks and exclusive access to limited edition drops. 
              Known for discovering emerging brands and styles.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Starting at</span>
                <span className="text-white font-semibold">$120/session</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Experience</span>
                <span className="text-white font-semibold">6+ years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Specialties</span>
                <span className="text-white font-semibold">Trends, Emerging</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Link href="/stylist/book-session" className="flex-1 bg-purple-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors text-center">
                Book Session
              </Link>
              <Link href="/stylist/collections" className="flex-1 bg-ink-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors text-center">
                View Collection
              </Link>
            </div>
          </div>

          {/* Stylist Card 3 */}
          <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 hover:border-green-400/50 transition-colors">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">Trend Tracker</h3>
                <p className="text-green-400 text-sm">Style Analyst</p>
                <p className="text-ink-300 text-sm">4.7 ★ (1.5k reviews)</p>
              </div>
            </div>
            <p className="text-ink-300 text-base mb-6">
              Stay ahead of the curve with the latest fashion trends and predictions. 
              Expert in seasonal forecasting and style analysis.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Starting at</span>
                <span className="text-white font-semibold">$100/session</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Experience</span>
                <span className="text-white font-semibold">5+ years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Specialties</span>
                <span className="text-white font-semibold">Forecasting, Analysis</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Link href="/stylist/book-session" className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors text-center">
                Book Session
              </Link>
              <Link href="/stylist/collections" className="flex-1 bg-ink-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors text-center">
                View Collection
              </Link>
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

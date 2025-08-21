import Link from 'next/link'

export async function StylistDashboardContent() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500/10 to-brand-500/10 rounded-2xl p-8 border border-purple-400/20">
        <h1 className="text-3xl font-bold text-white mb-4">Stylist Dashboard</h1>
        <p className="text-ink-300 text-lg mb-6">
          Build your brand, engage with clients, and grow your influence in the fashion community
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-brand-400/20 rounded-lg">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ink-400">Active Clients</p>
                <p className="text-2xl font-bold text-white">18</p>
              </div>
            </div>
          </div>

          <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-brand-400/20 rounded-lg">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7l8 0M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ink-400">This Month Appointments</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
            </div>
          </div>

          <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-brand-400/20 rounded-lg">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ink-400">Monthly Earnings</p>
                <p className="text-2xl font-bold text-white">$3,245</p>
              </div>
            </div>
          </div>

          <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-brand-400/20 rounded-lg">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ink-400">Average Rating</p>
                <p className="text-2xl font-bold text-white">4.9</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Commerce Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Viral Challenges */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Viral Challenges</h2>
            <Link href="/stylist/challenges" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-brand-500/20 to-brand-600/20 rounded-xl p-6 border border-brand-400/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Streetwear Showdown</h3>
                <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-ink-300 text-sm mb-4">Create and share your best streetwear looks</p>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-ink-300">Participants</span>
                <span className="text-white font-semibold">2,847</span>
              </div>
              <button className="w-full bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                Participate
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-400/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Style Transformation</h3>
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">New</span>
              </div>
              <p className="text-ink-300 text-sm mb-4">Show before/after style transformations</p>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-ink-300">Participants</span>
                <span className="text-white font-semibold">1,234</span>
              </div>
              <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                Participate
              </button>
            </div>
          </div>
        </div>

        {/* Client Engagement */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Client Engagement</h2>
            <Link href="/stylist/clients" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Sarah M.</h3>
                  <p className="text-ink-300 text-sm">Last session: 2 days ago</p>
                </div>
              </div>
              <p className="text-ink-300 text-sm mb-4">Ready for next styling session</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-brand-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                  Book Session
                </button>
                <button className="flex-1 bg-ink-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors">
                  Message
                </button>
              </div>
            </div>

            <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Mike R.</h3>
                  <p className="text-ink-300 text-sm">Last session: 1 week ago</p>
                </div>
              </div>
              <p className="text-ink-300 text-sm mb-4">Interested in new collection</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                  Book Session
                </button>
                <button className="flex-1 bg-ink-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/stylist/looks/create"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Create Look</h3>
            <p className="text-ink-300 text-sm">Design and share new style collections</p>
          </Link>

          <Link
            href="/stylist/appointments/schedule"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7l8 0M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Schedule Session</h3>
            <p className="text-ink-300 text-sm">Book appointments with clients</p>
          </Link>

          <Link
            href="/stylist/bundle-upload"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Upload Bundle</h3>
            <p className="text-ink-300 text-sm">Add new products to your store</p>
          </Link>

          <Link
            href="/stylist/earnings"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">View Earnings</h3>
            <p className="text-ink-300 text-sm">Track your revenue and analytics</p>
          </Link>
        </div>
      </div>

      {/* Social Analytics */}
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <h2 className="text-2xl font-bold text-white mb-6">Social Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-4">Content Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Total Views</span>
                <span className="text-white font-semibold">45.2K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Engagement Rate</span>
                <span className="text-white font-semibold">8.7%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Viral Score</span>
                <span className="text-white font-semibold">92</span>
              </div>
            </div>
          </div>

          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-4">Client Growth</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">New Clients</span>
                <span className="text-white font-semibold">+12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Retention Rate</span>
                <span className="text-white font-semibold">87%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Referrals</span>
                <span className="text-white font-semibold">+8</span>
              </div>
            </div>
          </div>

          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">This Month</span>
                <span className="text-white font-semibold">$3,245</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Last Month</span>
                <span className="text-white font-semibold">$2,890</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Growth</span>
                <span className="text-green-400 font-semibold">+12.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

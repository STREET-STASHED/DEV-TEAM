import Link from 'next/link'

export async function SellerDashboardContent() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500/10 to-brand-500/10 rounded-2xl p-8 border border-green-400/20">
        <h1 className="text-3xl font-bold text-white mb-4">Seller Dashboard</h1>
        <p className="text-ink-300 text-lg mb-6">
          Grow your business with viral marketing, social commerce, and data-driven insights
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-brand-400/20 rounded-lg">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ink-400">Total Products</p>
                <p className="text-2xl font-bold text-white">12</p>
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
                <p className="text-sm font-medium text-ink-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">$2,847.50</p>
              </div>
            </div>
          </div>

          <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-brand-400/20 rounded-lg">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ink-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">34</p>
              </div>
            </div>
          </div>

          <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-brand-400/20 rounded-lg">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ink-400">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-white">8.5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Commerce Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Viral Marketing Tools */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Viral Marketing Tools</h2>
            <Link href="/seller/marketing" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-brand-500/20 to-brand-600/20 rounded-xl p-6 border border-brand-400/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Social Challenges</h3>
                <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-ink-300 text-sm mb-4">Create viral challenges to promote your products</p>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-ink-300">Current Challenge</span>
                <span className="text-white font-semibold">Style Showdown</span>
              </div>
              <button className="w-full bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                Launch Challenge
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-400/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Influencer Network</h3>
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">New</span>
              </div>
              <p className="text-ink-300 text-sm mb-4">Connect with fashion influencers to boost sales</p>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-ink-300">Available Influencers</span>
                <span className="text-white font-semibold">24</span>
              </div>
              <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                Browse Network
              </button>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Customer Insights</h2>
            <Link href="/seller/analytics" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <h3 className="text-white font-semibold mb-3">Top Performing Products</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">Streetwear Hoodie</span>
                  <span className="text-white font-semibold">$847.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">Designer Sneakers</span>
                  <span className="text-white font-semibold">$623.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">Limited Tee</span>
                  <span className="text-white font-semibold">$445.00</span>
                </div>
              </div>
            </div>

            <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <h3 className="text-white font-semibold mb-3">Customer Demographics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">Age 18-25</span>
                  <span className="text-white font-semibold">45%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">Age 26-35</span>
                  <span className="text-white font-semibold">38%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-300">Age 36+</span>
                  <span className="text-white font-semibold">17%</span>
                </div>
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
            href="/seller/upload"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Add Product</h3>
            <p className="text-ink-300 text-sm">Upload new products to your store</p>
          </Link>

          <Link
            href="/seller/pricing-demo"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Pricing Tools</h3>
            <p className="text-ink-300 text-sm">Optimize pricing for maximum profit</p>
          </Link>

          <Link
            href="/seller/marketing"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Marketing Tools</h3>
            <p className="text-ink-300 text-sm">Launch viral campaigns and promotions</p>
          </Link>

          <Link
            href="/seller/analytics"
            className="bg-ink-800 border border-ink-700 rounded-xl p-6 hover:bg-ink-700/50 transition-colors group"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Analytics</h3>
            <p className="text-ink-300 text-sm">Track performance and insights</p>
          </Link>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <h2 className="text-2xl font-bold text-white mb-6">Performance Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-4">Sales Trends</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">This Week</span>
                <span className="text-white font-semibold">$847.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Last Week</span>
                <span className="text-white font-semibold">$623.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Growth</span>
                <span className="text-green-400 font-semibold">+36.0%</span>
              </div>
            </div>
          </div>

          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-4">Social Engagement</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Product Shares</span>
                <span className="text-white font-semibold">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Challenge Participants</span>
                <span className="text-white font-semibold">892</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Viral Score</span>
                <span className="text-white font-semibold">87</span>
              </div>
            </div>
          </div>

          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
            <h3 className="text-lg font-semibold text-white mb-4">Customer Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">New Customers</span>
                <span className="text-white font-semibold">+23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Repeat Rate</span>
                <span className="text-white font-semibold">67%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Avg Order Value</span>
                <span className="text-white font-semibold">$83.75</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

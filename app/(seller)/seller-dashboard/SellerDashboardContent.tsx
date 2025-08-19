import Link from 'next/link'

export async function SellerDashboardContent() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
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

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
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

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
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

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/seller/upload"
          className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4 hover:bg-ink-700/50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="ml-3 text-white font-medium">Add Product</span>
          </div>
        </Link>

        <Link
          href="/seller/pricing-demo"
          className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4 hover:bg-ink-700/50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="ml-3 text-white font-medium">Pricing Tools</span>
          </div>
        </Link>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-ink-600 rounded-lg">
              <svg className="w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="ml-3 text-ink-400 font-medium">Analytics</span>
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-ink-600 rounded-lg">
              <svg className="w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="ml-3 text-ink-400 font-medium">Settings</span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Products</h2>
          <Link
            href="/seller/upload"
            className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-ink-black text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </Link>
        </div>

        {/* Mock Products */}
        <div className="space-y-3">
          {[
            { name: 'Vintage Denim Jacket', price: 28.00, profit: 2.50, status: 'Active' },
            { name: 'Wireless Headphones', price: 52.00, profit: 4.80, status: 'Active' },
            { name: 'Handmade Ceramic Mug', price: 14.50, profit: 1.70, status: 'Active' },
            { name: 'Premium Leather Wallet', price: 42.00, profit: 4.20, status: 'Active' }
          ].map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-ink-700/30 rounded-lg border border-ink-600">
              <div className="flex-1">
                <h3 className="text-white font-medium">{product.name}</h3>
                <p className="text-ink-400 text-sm">Price: ${product.price}</p>
              </div>
              <div className="text-right">
                <div className="text-brand-400 font-medium">${product.profit} profit</div>
                <div className="text-ink-400 text-sm">{product.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Orders</h2>
        
        {/* Mock Orders */}
        <div className="space-y-3">
          {[
            { id: 'ORD-001', customer: 'Sarah M.', total: 28.00, status: 'Shipped', date: '2 hours ago' },
            { id: 'ORD-002', customer: 'Mike R.', total: 52.00, status: 'Processing', date: '5 hours ago' },
            { id: 'ORD-003', customer: 'Emma L.', total: 14.50, status: 'Delivered', date: '1 day ago' }
          ].map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-ink-700/30 rounded-lg border border-ink-600">
              <div className="flex-1">
                <h3 className="text-white font-medium">{order.id}</h3>
                <p className="text-ink-400 text-sm">{order.customer} • {order.date}</p>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">${order.total}</div>
                <div className={`text-sm font-medium ${
                  order.status === 'Delivered' ? 'text-success-400' :
                  order.status === 'Shipped' ? 'text-brand-400' :
                  'text-warning-400'
                }`}>
                  {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

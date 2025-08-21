import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'Track your orders and view order history',
}

export default function BuyerOrdersPage() {
  return (
    <div className="min-h-screen bg-ink-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">My Orders</h1>
          <p className="text-xl text-ink-300 max-w-3xl mx-auto">
            Track your orders, view order history, and manage your purchases
          </p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
            <div className="text-3xl font-bold text-white mb-2">12</div>
            <div className="text-ink-300 text-sm">Total Orders</div>
          </div>
          <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
            <div className="text-3xl font-bold text-brand-400 mb-2">3</div>
            <div className="text-ink-300 text-sm">Active Orders</div>
          </div>
          <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
            <div className="text-3xl font-bold text-green-400 mb-2">8</div>
            <div className="text-ink-300 text-sm">Delivered</div>
          </div>
          <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
            <div className="text-3xl font-bold text-purple-400 mb-2">$847</div>
            <div className="text-ink-300 text-sm">Total Spent</div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Active Orders</h2>
          
          <div className="space-y-6">
            {/* Order 1 */}
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Order #ST-2024-001</h3>
                    <span className="bg-brand-500 text-white text-xs px-3 py-1 rounded-full">Processing</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-ink-300 text-sm">Order Date</p>
                      <p className="text-white font-medium">Dec 15, 2024</p>
                    </div>
                    <div>
                      <p className="text-ink-300 text-sm">Estimated Delivery</p>
                      <p className="text-white font-medium">Dec 20, 2024</p>
                    </div>
                    <div>
                      <p className="text-ink-300 text-sm">Total Amount</p>
                      <p className="text-white font-medium">$89.99</p>
                    </div>
                    <div>
                      <p className="text-ink-300 text-sm">Items</p>
                      <p className="text-white font-medium">2 items</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-ink-300 text-sm">Items:</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-brand-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-brand-400 text-xs">👕</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Premium Streetwear T-Shirt</p>
                        <p className="text-ink-400 text-xs">Size: L, Color: Black</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 text-xs">👖</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Designer Jeans</p>
                        <p className="text-ink-400 text-xs">Size: 32x32, Color: Blue</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-3 lg:items-end">
                  <Link href="/buyer/orders/track" className="bg-brand-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors text-center">
                    Track Order
                  </Link>
                  <Link href="/buyer/orders/review" className="bg-ink-700 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors text-center">
                    Write Review
                  </Link>
                  <button className="bg-ink-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-ink-500 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

            {/* Order 2 */}
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Order #ST-2024-002</h3>
                    <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">Shipped</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-ink-300 text-sm">Order Date</p>
                      <p className="text-white font-medium">Dec 12, 2024</p>
                    </div>
                    <div>
                      <p className="text-ink-300 text-sm">Estimated Delivery</p>
                      <p className="text-white font-medium">Dec 18, 2024</p>
                    </div>
                    <div>
                      <p className="text-ink-300 text-sm">Total Amount</p>
                      <p className="text-white font-medium">$156.50</p>
                    </div>
                    <div>
                      <p className="text-ink-300 text-sm">Items</p>
                      <p className="text-white font-medium">1 item</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-ink-300 text-sm">Items:</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 text-xs">👟</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Limited Edition Sneakers</p>
                        <p className="text-ink-400 text-xs">Size: 10, Color: White/Red</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-3 lg:items-end">
                  <Link href="/buyer/orders/track" className="bg-brand-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors text-center">
                    Track Order
                  </Link>
                  <button className="bg-ink-700 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-ink-800 border border-ink-700 rounded-lg p-4 hover:border-brand-400/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-white">
                        Order #{`ST-2024-00${i + 2}`}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        i === 1 ? 'bg-green-500 text-white' : 'bg-ink-600 text-ink-300'
                      }`}>
                        {i === 1 ? 'Delivered' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-ink-300 text-sm">
                      {i === 1 ? 'Premium Streetwear Collection' : `Order ${i + 2} items`}
                    </p>
                    <p className="text-ink-400 text-xs">
                      {i === 1 ? 'Delivered on Dec 10, 2024' : `Completed on Dec ${8 - i}, 2024`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href="/buyer/orders/review" className="bg-brand-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-brand-600 transition-colors">
                      Review
                    </Link>
                    <button className="bg-ink-700 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-ink-600 transition-colors">
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

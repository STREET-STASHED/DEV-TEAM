'use client'

import { NavigationButton } from '@/components/ui/Navigation'
import { createSupabaseBrowser } from '@/app/lib/supabase/browser'
import { useEffect, useState } from 'react'

type Order = {
  id: string
  status?: string
  total_price?: number
  created_at?: string
}

export function BuyerDashboardContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getOrders() {
      try {
        const supabase = createSupabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setOrders([])
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase.from('orders')
          .select('id, status, total_amount, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching orders:', error)
          setOrders([])
        } else {
          const mappedOrders = (data || []).map((order) => ({
            id: order.id,
            status: order.status ?? undefined,
            total_price: order.total_amount ?? undefined,
            created_at: order.created_at ?? undefined,
          }))
          setOrders(mappedOrders)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    getOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-brand-500/10 to-purple-500/10 rounded-2xl p-8 border border-brand-400/20">
          <div className="animate-pulse">
            <div className="h-8 bg-ink-700 rounded mb-4"></div>
            <div className="h-6 bg-ink-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-ink-800/50 rounded-xl p-4 border border-ink-700">
                  <div className="h-8 bg-ink-700 rounded mb-1"></div>
                  <div className="h-4 bg-ink-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-500/10 to-purple-500/10 rounded-2xl p-8 border border-brand-400/20">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome back to StreetStashed</h1>
        <p className="text-ink-300 text-lg mb-6">
          Discover trending styles, connect with top stylists, and earn rewards for your fashion choices
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-ink-800/50 rounded-xl p-4 border border-ink-700">
            <div className="text-2xl font-bold text-white mb-1">{orders.length}</div>
            <div className="text-ink-300 text-sm">Orders</div>
          </div>
          <div className="bg-ink-800/50 rounded-xl p-4 border border-ink-700">
            <div className="text-2xl font-bold text-white mb-1">2,847</div>
            <div className="text-ink-300 text-sm">Reward Points</div>
          </div>
          <div className="bg-ink-800/50 rounded-xl p-4 border border-ink-700">
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <div className="text-ink-300 text-sm">Following</div>
          </div>
          <div className="bg-ink-800/50 rounded-xl p-4 border border-ink-700">
            <div className="text-2xl font-bold text-white mb-1">Gold</div>
            <div className="text-ink-300 text-sm">Member Level</div>
          </div>
        </div>
      </div>

      {/* Featured Stylists */}
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Stylists</h2>
          <NavigationButton action="view-all-stylists" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
            View All
          </NavigationButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700 hover:border-brand-400/50 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">StyleMaster Pro</h3>
                <p className="text-ink-300 text-sm">4.9 ★ (2.1k reviews)</p>
              </div>
            </div>
            <p className="text-ink-300 text-sm mb-4">Curated collections from top streetwear brands with personalized styling advice</p>
            <div className="flex space-x-2">
              <NavigationButton action="book-session" className="flex-1 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                Book Session
              </NavigationButton>
              <NavigationButton action="view-collection" className="flex-1 bg-ink-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors">
                View Collection
              </NavigationButton>
            </div>
          </div>

          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700 hover:border-purple-400/50 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Fashion Forward</h3>
                <p className="text-ink-300 text-sm">4.8 ★ (1.8k reviews)</p>
              </div>
            </div>
            <p className="text-ink-300 text-sm mb-4">Trendsetting looks and exclusive access to limited edition drops</p>
            <div className="flex space-x-2">
              <NavigationButton action="book-session" className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                Book Session
              </NavigationButton>
              <NavigationButton action="view-collection" className="flex-1 bg-ink-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors">
                View Collection
              </NavigationButton>
            </div>
          </div>

          <div className="bg-ink-800 rounded-xl p-6 border border-ink-700 hover:border-green-400/50 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Trend Tracker</h3>
                <p className="text-ink-300 text-sm">4.7 ★ (1.5k reviews)</p>
              </div>
            </div>
            <p className="text-ink-300 text-sm mb-4">Stay ahead of the curve with the latest fashion trends and predictions</p>
            <div className="flex space-x-2">
              <NavigationButton action="book-session" className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                Book Session
              </NavigationButton>
              <NavigationButton action="view-collection" className="flex-1 bg-ink-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors">
                View Collection
              </NavigationButton>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Active Challenges</h2>
          <NavigationButton action="view-all-challenges" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
            View All
          </NavigationButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-brand-500/20 to-brand-600/20 rounded-xl p-6 border border-brand-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Streetwear Showdown</h3>
              <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full">Live</span>
            </div>
            <p className="text-ink-300 text-sm mb-4">Show off your best streetwear fit and win up to $1000 in prizes</p>
            <div className="space-y-3">
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
            </div>
            <NavigationButton action="join-challenge" className="w-full bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors mt-4">
              Join Challenge
            </NavigationButton>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Style Transformation</h3>
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">New</span>
            </div>
            <p className="text-ink-300 text-sm mb-4">Transform your style with before/after photos and win styling sessions</p>
            <div className="space-y-3">
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
            </div>
            <NavigationButton action="join-challenge" className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors mt-4">
              Join Challenge
            </NavigationButton>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
          <NavigationButton action="view-all-orders" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
            View All
          </NavigationButton>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-ink-600 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
            <p className="text-ink-300 text-sm mb-4">
              Start shopping to see your orders here and earn reward points!
            </p>
            <NavigationButton action="start-shopping" className="bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 transition-colors">
              Start Shopping
            </NavigationButton>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-ink-800 border border-ink-700 rounded-lg p-6 hover:border-brand-400/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-semibold text-white">
                      Order ID: <span className="font-normal text-ink-300">{order.id}</span>
                    </p>
                    <p
                      className={`text-sm sm:text-base font-medium italic ${
                        order.status === 'delivered' ? 'text-green-400' : 'text-yellow-400'
                      }`}
                    >
                      Status: {order.status}
                    </p>
                    <p className="text-sm sm:text-base text-ink-300">
                      Total Price: <span className="text-white font-semibold">${order.total_price?.toFixed(2) ?? 'N/A'}</span>
                    </p>
                    <p className="text-sm sm:text-base text-ink-400">
                      Ordered At:{' '}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <NavigationButton action="track-order" className="bg-ink-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink-600 transition-colors">
                      Track Order
                    </NavigationButton>
                    <NavigationButton action="review-order" className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                      Review
                    </NavigationButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

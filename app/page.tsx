'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import {
    CameraIcon,
    ChatBubbleLeftRightIcon,
    FireIcon,
    FunnelIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    ShoppingCartIcon,
    SparklesIcon,
    StarIcon,
    TrophyIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [_selectedCategory, _setSelectedCategory] = useState('all')
  const [stores, setStores] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [liveActivity, setLiveActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch data from multiple APIs in parallel
        const [productsRes, storesRes, categoriesRes, socialRes, realtimeRes] = await Promise.all([
          fetch('/api/items?trending=true&limit=6'),
          fetch('/api/stores?featured=true&limit=6'),
          fetch('/api/categories'),
          fetch('/api/social/posts?type=trending&limit=3'),
          fetch('/api/analytics/realtime')
        ])

        const [productsData, storesData, categoriesData, socialData, realtimeData] = await Promise.all([
          productsRes.json(),
          storesRes.json(),
          categoriesRes.json(),
          socialRes.json(),
          realtimeRes.json()
        ])

        // Set the data, with fallback to empty arrays if API fails
        const products = productsData.items || productsData.results || []
        const stores = storesData.stores || storesData.results || []
        const categories = categoriesData.categories || categoriesData.results || []
        
        // Ensure products have required properties for styling
        const enhancedProducts = products.map((product: any) => ({
          ...product,
          isTrending: product.isTrending ?? Math.random() > 0.7, // Random trending status if not provided
          rating: product.rating ?? (4 + Math.random()), // Random rating if not provided
          reviewCount: product.reviewCount ?? Math.floor(Math.random() * 500),
          inStock: product.inStock ?? true,
          images: product.images || product.image_url ? [product.image_url] : ['/mock/default-product.jpg']
        }))
        
        // Ensure categories have icons
        const enhancedCategories = categories.map((category: any) => ({
          ...category,
          icon: category.icon || '🛍️', // Default icon if not provided
          productCount: category.productCount || Math.floor(Math.random() * 50)
        }))
        
        setFeaturedProducts(enhancedProducts)
        setStores(stores)
        setCategories(enhancedCategories)
        
        // Process live activity data
        const activityItems = []
        
        // Add social posts as activity
        if (socialData.posts && socialData.posts.length > 0) {
          socialData.posts.forEach((post: any) => {
            activityItems.push({
              id: `social-${post.id}`,
              type: 'social',
              title: 'New Social Post',
              description: post.content,
              timestamp: post.created_at,
              icon: '💬',
              color: 'blue',
              colorClasses: {
                bg: 'bg-blue-500',
                text: 'text-blue-400',
                border: 'hover:border-blue-500/50'
              }
            })
          })
        }
        
        // Add real-time analytics as activity
        if (realtimeData.activeUsers > 0) {
          activityItems.push({
            id: 'realtime-users',
            type: 'analytics',
            title: 'Active Users',
            description: `${realtimeData.activeUsers} users online now`,
            timestamp: new Date().toISOString(),
            icon: '👥',
            color: 'green',
            colorClasses: {
              bg: 'bg-green-500',
              text: 'text-green-400',
              border: 'hover:border-green-500/50'
            }
          })
        }
        
        if (realtimeData.ordersPerMinute > 0) {
          activityItems.push({
            id: 'realtime-orders',
            type: 'analytics',
            title: 'New Orders',
            description: `${realtimeData.ordersPerMinute} orders in the last hour`,
            timestamp: new Date().toISOString(),
            icon: '📦',
            color: 'purple',
            colorClasses: {
              bg: 'bg-purple-500',
              text: 'text-purple-400',
              border: 'hover:border-purple-500/50'
            }
          })
        }
        
        setLiveActivity(activityItems.slice(0, 3)) // Show top 3 activities

      } catch (error) {
        console.error('Error fetching homepage data:', error)
        setError('Failed to load some content. Please refresh the page.')
        
        // Fallback to mock data to maintain colorful appearance
        const { mockProducts, mockStores, mockCategories } = await import('@/lib/mockData')
        setFeaturedProducts(mockProducts.slice(0, 6))
        setStores(mockStores.slice(0, 6))
        setCategories(mockCategories)
        setLiveActivity([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/buyer/marketplace?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    _setSelectedCategory(categoryId)
    if (categoryId === 'all') {
      router.push('/buyer/marketplace')
    } else {
      router.push(`/buyer/marketplace?category=${categoryId}`)
    }
  }

  const handleStoreClick = (storeId: string) => {
    router.push(`/buyer/marketplace?store=${storeId}`)
  }

  const handleProductClick = (productId: string) => {
    router.push(`/buyer/marketplace/product/${productId}`)
  }

  const handleAIStylist = () => {
    router.push('/ai-stylist')
  }

  const handleARTryOn = () => {
    router.push('/ar-tryon')
  }

  const handleSocialChallenges = () => {
    router.push('/social/challenges')
  }

  const handleBlockchainRewards = () => {
    router.push('/blockchain-rewards')
  }

  const handleReferrals = () => {
    router.push('/referrals')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-300">Loading StreetStashed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Join Us Button */}
      <header className="bg-ink-900/80 backdrop-blur-sm border-b border-ink-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-white">STREETSTASHED</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/buyer/marketplace" className="text-ink-300 hover:text-white transition-colors">
                Marketplace
              </a>
              <a href="/social/challenges" className="text-ink-300 hover:text-white transition-colors">
                Challenges
              </a>
              <a href="/ai-stylist" className="text-ink-300 hover:text-white transition-colors">
                AI Stylist
              </a>
            </nav>

            {/* Join Us Button */}
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="text-ink-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-500/25"
              >
                Join Us
              </a>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-ink-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-ink-800 border-t border-ink-700">
            <div className="px-4 py-2 space-y-2">
              <a href="/buyer/marketplace" className="block px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors">
                Marketplace
              </a>
              <a href="/social/challenges" className="block px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors">
                Challenges
              </a>
              <a href="/ai-stylist" className="block px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors">
                AI Stylist
              </a>
              <div className="border-t border-ink-700 pt-2 mt-2">
                <a href="/login" className="block px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors">
                  Sign In
                </a>
                <a href="/signup" className="block px-4 py-2 text-brand-400 hover:text-brand-300 hover:bg-ink-700 rounded-lg transition-colors">
                  Join Us
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              StreetStashed
            </h1>
            <p className="text-xl md:text-2xl text-ink-300 mb-8 max-w-3xl mx-auto">
              Discover the latest streetwear, connect with local stores, and get your style delivered in minutes
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for sneakers, clothing, accessories..."
                  className="w-full bg-ink-800 border border-ink-700 rounded-full px-6 py-4 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-2 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full transition-colors"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push('/buyer/marketplace')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                <span>Shop Now</span>
              </button>
              <button
                onClick={handleAIStylist}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <SparklesIcon className="w-6 h-6" />
                <span>AI Stylist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">🚀 Advanced Features</h2>
            <p className="text-ink-300">Experience the future of fashion shopping</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* AI Stylist */}
            <button
              onClick={handleAIStylist}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 border border-purple-400/30 shadow-lg"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-white mb-2">AI Stylist</h3>
              <p className="text-sm text-purple-100">Get personalized style recommendations</p>
            </button>

            {/* AR Try-On */}
            <button
              onClick={handleARTryOn}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 border border-blue-400/30 shadow-lg"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <CameraIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-white mb-2">AR Try-On</h3>
              <p className="text-sm text-blue-100">Virtual fitting room experience</p>
            </button>

            {/* Social Challenges */}
            <button
              onClick={handleSocialChallenges}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 border border-green-400/30 shadow-lg"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-white mb-2">Challenges</h3>
              <p className="text-sm text-green-100">Compete and win prizes</p>
            </button>

            {/* Blockchain Rewards */}
            <button
              onClick={handleBlockchainRewards}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 border border-orange-400/30 shadow-lg"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <FunnelIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-white mb-2">Rewards</h3>
              <p className="text-sm text-orange-100">Earn tokens and rewards</p>
            </button>
          </div>
        </div>
      </div>

      {/* Live Activity Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">🔥 Live Activity</h2>
            <p className="text-ink-300">Real-time updates from the StreetStashed community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {liveActivity.length > 0 ? (
              liveActivity.map((activity) => (
                <div key={activity.id} className={`bg-ink-900 rounded-xl p-6 border border-ink-800 ${activity.colorClasses?.border || 'hover:border-purple-500/50'} transition-all duration-300`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-3 h-3 ${activity.colorClasses?.bg || 'bg-purple-500'} rounded-full animate-pulse`}></div>
                    <span className={`${activity.colorClasses?.text || 'text-purple-400'} font-semibold`}>
                      {activity.type === 'social' ? 'SOCIAL' : activity.type === 'analytics' ? 'LIVE' : 'UPDATE'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{activity.title}</h3>
                  <p className="text-ink-300 text-sm">{activity.description}</p>
                  <span className="text-ink-400 text-xs">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              // Fallback static content if no live activity data
              <>
                <div className="bg-ink-900 rounded-xl p-6 border border-ink-800 hover:border-red-500/50 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-semibold">LIVE</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">New Product Drop</h3>
                  <p className="text-ink-300 text-sm">@StyleMaster just dropped 50 new pieces</p>
                  <span className="text-ink-400 text-xs">2 min ago</span>
                </div>
                <div className="bg-ink-900 rounded-xl p-6 border border-ink-800 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 font-semibold">AI</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">AI Stylist Active</h3>
                  <p className="text-ink-300 text-sm">AI Stylist generated 127 new outfit combinations</p>
                  <span className="text-ink-400 text-xs">5 min ago</span>
                </div>
                <div className="bg-ink-900 rounded-xl p-6 border border-ink-800 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-400 font-semibold">NFT</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">NFT Collection</h3>
                  <p className="text-ink-300 text-sm">New NFT collection minted: &apos;Streetwear Legends&apos;</p>
                  <span className="text-ink-400 text-xs">8 min ago</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Shop by Category</h2>
            <p className="text-ink-300">Find exactly what you&apos;re looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="bg-ink-900 hover:bg-ink-800 rounded-xl p-6 text-center transition-colors border border-ink-800 hover:border-purple-500/50"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{category.name}</h3>
                <p className="text-sm text-ink-400">{category.productCount} items</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-ink-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Trending Now</h2>
            <p className="text-ink-300">The hottest items everyone&apos;s talking about</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="bg-ink-900 rounded-xl overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-all duration-300 border border-ink-800 hover:border-purple-500/50"
              >
                <div className="relative">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : '/mock/default-product.jpg'}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/mock/default-product.jpg'
                    }}
                  />
                  {product.isTrending && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <FireIcon className="w-4 h-4" />
                      <span>Trending</span>
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Sale
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white text-lg line-clamp-2">{product.name}</h3>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-ink-300 text-sm">{product.rating}</span>
                    </div>
                  </div>

                  <p className="text-ink-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-white">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-ink-400 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-ink-400 text-sm">{product.storeName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/buyer/marketplace')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Products
            </button>
          </div>
        </div>
      </div>

      {/* Social & Viral Features */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">🌟 Social & Viral Features</h2>
            <p className="text-ink-300">Connect, compete, and earn rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Referrals */}
            <button
              onClick={handleReferrals}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-8 rounded-xl text-center transition-all duration-300 transform hover:scale-105 border border-green-400/30 shadow-lg"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <HeartIcon className="w-10 h-10" />
              </div>
              <h3 className="font-semibold text-white text-xl mb-3">Refer Friends</h3>
              <p className="text-green-100 mb-4">Invite friends and earn rewards</p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-sm font-semibold">Earn $10 for each friend!</p>
              </div>
            </button>

            {/* Live Chat */}
            <button
              onClick={() => alert('Live chat coming soon!')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-8 rounded-xl text-center transition-all duration-300 transform hover:scale-105 border border-blue-400/30 shadow-lg"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-10 h-10" />
              </div>
              <h3 className="font-semibold text-white text-xl mb-3">Live Chat</h3>
              <p className="text-blue-100 mb-4">Get instant help and support</p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-sm font-semibold">24/7 Customer Support</p>
              </div>
            </button>

            {/* Global Community */}
            <button
              onClick={() => alert('Global community features coming soon!')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-8 rounded-xl text-center transition-all duration-300 transform hover:scale-105 border border-purple-400/30 shadow-lg"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <HeartIcon className="w-10 h-10" />
              </div>
              <h3 className="font-semibold text-white text-xl mb-3">Global Community</h3>
              <p className="text-purple-100 mb-4">Connect with fashion lovers worldwide</p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-sm font-semibold">Join 50K+ Members</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Stores */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Stores</h2>
            <p className="text-ink-300">Discover amazing local businesses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className="bg-ink-900 rounded-xl overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-all duration-300 border border-ink-800 hover:border-purple-500/50"
              >
                <div className="relative">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/mock/default-store.jpg'
                    }}
                  />
                  {store.isVerified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Verified
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white text-xl">{store.name}</h3>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-ink-300">{store.rating}</span>
                      <span className="text-ink-400 text-sm">({store.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-ink-400 text-sm mb-4 line-clamp-2">{store.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPinIcon className="w-4 h-4 text-ink-400" />
                      <span className="text-ink-300">{store.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-ink-400">Delivery:</span>
                      <span className="text-ink-300">{store.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-ink-400">Min Order:</span>
                      <span className="text-ink-300">${store.minOrder}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {store.categories.slice(0, 3).map((category) => (
                      <span
                        key={category}
                        className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/buyer/marketplace')}
              className="bg-ink-800 hover:bg-ink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore All Stores
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

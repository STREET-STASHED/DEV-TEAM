'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import EnhancedSearchFilters from '@/components/search/EnhancedSearchFilters'
import { useCart } from '@/context/CartContext'
import {
    CameraIcon,
    ChatBubbleLeftRightIcon,
    FireIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    ShareIcon,
    ShoppingCartIcon,
    SparklesIcon,
    StarIcon,
    TrophyIcon
} from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function MarketplaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem, hasItem, totalCount } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStore, setSelectedStore] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState('trending')
  const [_useEnhancedSearch] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [liveActivity, setLiveActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, _setShowFilters] = useState(false)
  const [_showAIStylist, _setShowAIStylist] = useState(false)
  const [_showARTryOn, _setShowARTryOn] = useState(false)
  const [_showSocialChallenges, _setShowSocialChallenges] = useState(false)

  const applyFilters = useCallback(() => {
    // Since we're now fetching filtered data from the API,
    // we just need to set the products as filtered products
    setFilteredProducts(products)
  }, [products])

  useEffect(() => {
    // Get URL parameters
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const store = searchParams.get('store')

    if (search) setSearchQuery(search)
    if (category) setSelectedCategory(category)
    if (store) setSelectedStore(store)
  }, [searchParams])

  useEffect(() => {
    if (products.length > 0) {
      applyFilters()
    }
  }, [products, searchQuery, selectedCategory, selectedStore, priceRange, sortBy, applyFilters])

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // If there's a search query, use search API, otherwise use items API
        let productsRes
        if (searchQuery.trim()) {
          const searchParams = new URLSearchParams({
            q: searchQuery,
            ...(selectedCategory !== 'all' && { category: selectedCategory }),
            ...(selectedStore !== 'all' && { store: selectedStore }),
            ...(priceRange[0] > 0 && { minPrice: priceRange[0].toString() }),
            ...(priceRange[1] < 1000 && { maxPrice: priceRange[1].toString() }),
            sortBy: sortBy === 'trending' ? 'relevance' : sortBy
          })
          productsRes = await fetch(`/api/search?${searchParams}`)
        } else {
          productsRes = await fetch('/api/items')
        }

        // Fetch other data in parallel
        const [storesRes, categoriesRes, socialRes] = await Promise.all([
          fetch('/api/stores'),
          fetch('/api/categories'),
          fetch('/api/social/posts?type=trending&limit=3')
        ])

        const [productsData, storesData, categoriesData, socialData] = await Promise.all([
          productsRes.json(),
          storesRes.json(),
          categoriesRes.json(),
          socialRes.json()
        ])

        // Set the data, with fallback to empty arrays if API fails
        const products = searchQuery.trim() 
          ? (productsData.results || [])
          : (productsData.items || productsData.results || [])
        
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
        const enhancedCategories = (categoriesData.categories || categoriesData.results || []).map((category: any) => ({
          ...category,
          icon: category.icon || '🛍️', // Default icon if not provided
          productCount: category.productCount || Math.floor(Math.random() * 50)
        }))
        
        setProducts(enhancedProducts)
        setStores(storesData.stores || storesData.results || [])
        setCategories(enhancedCategories)
        
        // Process live activity data
        const activityItems: any[] = []
        
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
                text: 'text-blue-400'
              }
            })
          })
        }
        
        setLiveActivity(activityItems.slice(0, 3)) // Show top 3 activities

      } catch (error) {
        console.error('Error fetching marketplace data:', error)
        setError('Failed to load marketplace data. Please refresh the page.')
        
        // Fallback to mock data to maintain colorful appearance
        const { mockProducts, mockStores, mockCategories } = await import('@/lib/mockData')
        setProducts(mockProducts)
        setStores(mockStores)
        setCategories(mockCategories)
        setLiveActivity([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, selectedCategory, selectedStore, priceRange, sortBy])

  const _handleSearch = (filters?: any) => {
    const params = new URLSearchParams()
    
    if (filters) {
      // Enhanced search with filters
      if (filters.query) params.set('search', filters.query)
      if (filters.category !== 'all') params.set('category', filters.category)
      if (filters.brand !== 'all') params.set('brand', filters.brand)
      if (filters.size.length > 0) params.set('size', filters.size.join(','))
      if (filters.color.length > 0) params.set('color', filters.color.join(','))
      if (filters.condition.length > 0) params.set('condition', filters.condition.join(','))
      if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString())
      if (filters.priceRange[1] < 1000) params.set('maxPrice', filters.priceRange[1].toString())
      if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy)
    } else {
      // Legacy search
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedStore !== 'all') params.set('store', selectedStore)
    }

    const queryString = params.toString()
    router.push(`/buyer/marketplace${queryString ? `?${queryString}` : ''}`)
  }

  const handleProductClick = (productId: string) => {
    router.push(`/buyer/marketplace/product/${productId}`)
  }

  const handleAddToCart = (product: any) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.images && product.images.length > 0 ? product.images[0] : '/mock/default-product.jpg',
      category: product.category
    }

    addItem(cartItem)

    // Show success message
    const message = document.createElement('div')
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    message.textContent = `${product.name} added to cart!`
    document.body.appendChild(message)

    setTimeout(() => {
      document.body.removeChild(message)
    }, 3000)
  }

  const handleAddToWishlist = (product: any) => {
    // In real implementation, this would add to wishlist
    console.log('Adding to wishlist:', product.name)
    // Show success message
    alert(`${product.name} added to wishlist!`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedStore('all')
    setPriceRange([0, 1000])
    setSortBy('trending')
    router.push('/buyer/marketplace')
  }

  const handleAIStylist = () => {
    _setShowAIStylist(true)
    // In real implementation, this would open AI Stylist modal or navigate to page
    router.push('/ai-stylist')
  }

  const handleARTryOn = () => {
    _setShowARTryOn(true)
    // In real implementation, this would open AR Try-On modal or navigate to page
    router.push('/ar-tryon')
  }

  const handleSocialChallenges = () => {
    _setShowSocialChallenges(true)
    // In real implementation, this would open Social Challenges modal or navigate to page
    router.push('/social/challenges')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-300">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🛍️ Marketplace</h1>
              <p className="text-ink-300">Discover amazing products from local stores</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/buyer/checkout')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>Cart ({totalCount})</span>
              </button>
              <button
                onClick={() => router.back()}
                className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Bar */}
      <div className="bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-pink-500/20 border-b border-yellow-400/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* AI Stylist */}
            <button
              onClick={handleAIStylist}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>AI Stylist</span>
            </button>

            {/* AR Try-On */}
            <button
              onClick={handleARTryOn}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <CameraIcon className="w-5 h-5" />
              <span>AR Try-On</span>
            </button>

            {/* Social Challenges */}
            <button
              onClick={handleSocialChallenges}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <TrophyIcon className="w-5 h-5" />
              <span>Challenges</span>
            </button>

            {/* Live Chat */}
            <button
              onClick={() => alert('Live chat coming soon!')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Live Chat</span>
            </button>

            {/* Social Sharing */}
            <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
              <ShareIcon className="w-5 h-5" />
              <span>Share</span>
            </button>
            <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              <span>NFT Collection</span>
            </button>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>Smart Contracts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Activity Section */}
      <div className="bg-ink-900 border-b border-ink-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span className="text-red-500">🔥</span>
              Live Activity
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-sm">Real-time updates</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <button className="text-ink-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveActivity.length > 0 ? (
              liveActivity.map((activity) => (
                <div key={activity.id} className="bg-ink-800 rounded-lg p-4 border border-ink-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 ${activity.colorClasses?.bg || 'bg-blue-500'} rounded-full animate-pulse`}></div>
                    <span className={`${activity.colorClasses?.text || 'text-blue-400'} text-sm font-semibold`}>
                      {activity.type === 'social' ? 'SOCIAL' : activity.type === 'analytics' ? 'LIVE' : 'UPDATE'}
                    </span>
                  </div>
                  <p className="text-white text-sm">{activity.description}</p>
                  <span className="text-ink-400 text-xs">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              // Fallback static content if no live activity data
              <>
                <div className="bg-ink-800 rounded-lg p-4 border border-ink-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-semibold">LIVE</span>
                  </div>
                  <p className="text-white text-sm">@StyleMaster just dropped 50 new pieces</p>
                  <span className="text-ink-400 text-xs">2 min ago</span>
                </div>
                <div className="bg-ink-800 rounded-lg p-4 border border-ink-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 text-sm font-semibold">AI</span>
                  </div>
                  <p className="text-white text-sm">AI Stylist generated 127 new outfit combinations</p>
                  <span className="text-ink-400 text-xs">5 min ago</span>
                </div>
                <div className="bg-ink-800 rounded-lg p-4 border border-ink-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-400 text-sm font-semibold">NFT</span>
                  </div>
                  <p className="text-white text-sm">New NFT collection minted: &apos;Streetwear Legends&apos;</p>
                  <span className="text-ink-400 text-xs">8 min ago</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Search Filters Component */}
          <EnhancedSearchFilters />

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-ink-900 rounded-lg border border-ink-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Store Filter */}
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Store</label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Stores</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      placeholder="Min"
                      className="w-20 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-ink-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      placeholder="Max"
                      className="w-20 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="bg-ink-700 hover:bg-ink-600 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="bg-ink-900 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-ink-300">
            Showing {filteredProducts.length} of {products.length} products
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            {selectedStore !== 'all' && ` from ${stores.find(s => s.id === selectedStore)?.name}`}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="w-12 h-12 text-ink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No products found</h3>
            <p className="text-ink-300 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearFilters}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-ink-900 rounded-xl overflow-hidden border border-ink-800 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : '/mock/default-product.jpg'}
                    alt={product.name}
                    className="w-full h-64 object-cover cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                    onError={(e) => {
                      e.currentTarget.src = '/mock/default-product.jpg'
                    }}
                  />

                  {/* Badges */}
                  {product.isTrending && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <FireIcon className="w-4 h-4" />
                      <span>Trending</span>
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Sale
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button
                      onClick={() => handleAddToWishlist(product)}
                      className="bg-ink-800/80 hover:bg-ink-700/80 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <HeartIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`p-2 rounded-full transition-colors ${
                        hasItem(product.id)
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                      title={hasItem(product.id) ? 'Already in cart' : 'Add to cart'}
                    >
                      {hasItem(product.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <ShoppingCartIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="font-semibold text-white text-lg line-clamp-2 cursor-pointer hover:text-purple-400 transition-colors"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-ink-300 text-sm">{product.rating}</span>
                    </div>
                  </div>

                  <p className="text-ink-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                  {/* Store Info */}
                  <div className="flex items-center space-x-2 mb-3 text-sm">
                    <MapPinIcon className="w-4 h-4 text-ink-400" />
                    <span className="text-ink-300">{product.storeName}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-white">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-ink-400 line-through">${product.originalPrice}</span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.inStock
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

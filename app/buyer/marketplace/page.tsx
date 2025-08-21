'use client'

import { useState, useEffect } from 'react'
import { mockProducts, mockCategories, searchProducts } from '@/lib/mockData'
import { useCart } from '@/context/CartContext'
import { ProductCard } from './ProductCard'
import { useRouter } from 'next/navigation'
import { 
  FireIcon, 
  StarIcon, 
  ClockIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  TrophyIcon,
  GiftIcon,
  UsersIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export default function MarketplacePage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [showCart, setShowCart] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [showLiveChat, setShowLiveChat] = useState(false)
  const [liveUpdates, setLiveUpdates] = useState([
    { id: 1, message: "🔥 New drop: Limited Edition Sneakers just added!", time: "2 min ago" },
    { id: 2, message: "⭐ StyleMaster Pro just restocked their collection", time: "5 min ago" },
    { id: 3, message: "🎉 50+ new products added this hour", time: "12 min ago" }
  ])
  
  const { items: cart, updateQuantity, removeItem, totalCount, totalPrice } = useCart()
  const router = useRouter()

  // Filter products based on search and category
  useEffect(() => {
    let filtered = mockProducts

    if (searchQuery) {
      filtered = searchProducts(searchQuery)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // Filter by selected stores
    if (selectedStores.length > 0) {
      filtered = filtered.filter(product => selectedStores.includes(product.storeId))
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'trending':
      default:
        filtered = filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
        break
    }

    setProducts(filtered)
  }, [searchQuery, selectedCategory, sortBy, priceRange, selectedStores])

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdates(prev => [
        {
          id: Date.now(),
          message: `🆕 ${Math.floor(Math.random() * 20) + 1} new products just dropped!`,
          time: "Just now"
        },
        ...prev.slice(0, 2)
      ])
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Live Updates Bar */}
      <div className="bg-gradient-to-r from-brand-500 to-purple-600 p-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <FireIcon className="w-4 h-4 animate-pulse" />
            <span>LIVE UPDATES</span>
            <div className="flex space-x-4">
              {liveUpdates.slice(0, 2).map((update) => (
                <span key={update.id} className="text-xs opacity-90">
                  {update.message}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Cart Bar */}
      <div className="bg-ink-900 border-b border-ink-800 p-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, stores, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 ml-6">
            {/* Live Chat */}
            <button 
              onClick={() => setShowLiveChat(!showLiveChat)}
              className="relative bg-purple-600 hover:bg-purple-700 p-3 rounded-lg transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
            </button>

            {/* Notifications */}
            <button className="relative bg-ink-800 hover:bg-ink-700 p-3 rounded-lg transition-colors">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setShowCart(!showCart)}
              className="relative bg-brand-500 hover:bg-brand-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cart ({totalCount})
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section - Viral Challenges & Trending */}
      <div className="bg-gradient-to-r from-brand-500/10 to-purple-500/10 border-b border-brand-400/20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trending Challenge */}
            <div className="bg-gradient-to-r from-brand-500/20 to-brand-600/20 rounded-xl p-6 border border-brand-400/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Trending Challenge</h3>
                  <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">Live</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Streetwear Showdown</h4>
                <p className="text-ink-300 text-sm mb-4">Show off your best streetwear fit and win up to $1000 in prizes</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4 text-brand-400" />
                    <span className="text-brand-400 text-sm">2,847 participants</span>
                  </div>
                  <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors transform hover:scale-105">
                    Join Now
                  </button>
                </div>
              </div>
            </div>

            {/* AI Stylist */}
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-400/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">AI Stylist</h3>
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">AI Powered</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Get Personalized Style</h4>
                <p className="text-ink-300 text-sm mb-4">AI analyzes your style and recommends perfect outfits</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 text-sm">4.9 ★ AI Rating</span>
                  </div>
                  <button 
                    onClick={() => router.push('/ai-stylist')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors transform hover:scale-105"
                  >
                    Try AI Stylist
                  </button>
                </div>
              </div>
            </div>

            {/* Blockchain Rewards */}
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-400/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Blockchain Rewards</h3>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Web3</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-300">$STASH Tokens</span>
                    <span className="text-white font-semibold">2,847</span>
                  </div>
                  <div className="w-full bg-ink-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <p className="text-ink-300 text-sm mb-4">Earn crypto rewards for shopping and challenges</p>
                <button 
                  onClick={() => router.push('/blockchain-rewards')}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors transform hover:scale-105"
                >
                  View Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="bg-ink-800 border-b border-ink-700 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">🚀 Advanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AR Try-On */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30 text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-white mb-2">AR Try-On</h3>
              <p className="text-ink-300 text-xs mb-3">Virtual fitting room with AR technology</p>
              <button 
                onClick={() => router.push('/ar-tryon')}
                className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
              >
                Try AR
              </button>
            </div>

            {/* Live Streaming */}
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-400/30 text-center">
              <div className="text-3xl mb-2">📺</div>
              <h3 className="font-semibold text-white mb-2">Live Shows</h3>
              <p className="text-ink-300 text-xs mb-3">Watch live fashion shows and drops</p>
              <button 
                onClick={() => router.push('/live-shows')}
                className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
              >
                Watch Live
              </button>
            </div>

            {/* NFT Marketplace */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold text-white mb-2">NFT Collection</h3>
              <p className="text-ink-300 text-xs mb-3">Exclusive digital fashion NFTs</p>
              <button 
                onClick={() => router.push('/nft-marketplace')}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
              >
                Browse NFTs
              </button>
            </div>

            {/* Smart Contracts */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-2">Smart Contracts</h3>
              <p className="text-ink-300 text-xs mb-3">Automated escrow and payments</p>
              <button 
                onClick={() => router.push('/smart-contracts')}
                className="bg-cyan-500 text-white px-3 py-1 rounded text-xs hover:bg-cyan-600 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-ink-900 border-b border-ink-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">🔥 Live Activity</h3>
            <div className="flex items-center space-x-2">
              <span className="text-ink-400 text-sm">Real-time updates</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-ink-800 rounded-lg p-3 border border-ink-700">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">LIVE</span>
              </div>
              <p className="text-white text-sm">@StyleMaster just dropped 50 new pieces</p>
              <span className="text-ink-400 text-xs">2 min ago</span>
            </div>
            <div className="bg-ink-800 rounded-lg p-3 border border-ink-700">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-xs font-medium">AI</span>
              </div>
              <p className="text-white text-sm">AI Stylist generated 127 new outfit combinations</p>
              <span className="text-ink-400 text-xs">5 min ago</span>
            </div>
            <div className="bg-ink-800 rounded-lg p-3 border border-ink-700">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-purple-400 text-xs font-medium">NFT</span>
              </div>
              <p className="text-white text-sm">New NFT collection minted: "Streetwear Legends"</p>
              <span className="text-ink-400 text-xs">8 min ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category and Sort Bar */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
              }`}
            >
              All Categories
            </button>
            {mockCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort and Filter Options */}
          <div className="flex items-center space-x-4 ml-6">
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-ink-900 hover:bg-ink-700 px-4 py-2 rounded-lg text-ink-300 transition-colors"
            >
              Filters
            </button>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-ink-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="trending">🔥 Trending</option>
                <option value="newest">🆕 Newest</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="rating">⭐ Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-ink-800 border-b border-ink-700 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-20 bg-ink-900 border border-ink-700 rounded px-2 py-1 text-white text-sm"
                  />
                  <span className="text-ink-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])}
                    className="w-20 bg-ink-900 border border-ink-700 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>

              {/* Store Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Stores</label>
                <select
                  multiple
                  value={selectedStores}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value)
                    setSelectedStores(values)
                  }}
                  className="w-full bg-ink-900 border border-ink-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="store-1">Urban Threads Collective</option>
                  <option value="store-2">Sneaker Haven</option>
                  <option value="store-3">Luxe Jewelry Co.</option>
                  <option value="store-4">Vintage Vault</option>
                  <option value="store-5">Athletic Edge</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => {
                    setPriceRange([0, 2000])
                    setSelectedStores([])
                  }}
                  className="bg-ink-700 hover:bg-ink-600 px-4 py-2 rounded text-sm transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded text-sm transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex gap-6 lg:gap-8">
        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Results Count and Stats */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">
                {selectedCategory === 'all' ? 'All Products' : mockCategories.find(c => c.id === selectedCategory)?.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-ink-400">
                <span className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Updated 2 min ago</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span>Trending now</span>
                </span>
              </div>
            </div>
            <p className="text-ink-400">
              {products.length} products found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image_url: product.images[0] || '/mock/default-product.jpg',
                    seller_id: product.storeId,
                    category: product.category,
                    created_at: product.created_at,
                    storeName: product.storeName,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-ink-600">●</div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-ink-400">
                Try adjusting your search or category filters
              </p>
            </div>
          )}
        </div>

        {/* Shopping Cart Sidebar */}
        {showCart && (
          <div className="w-80 bg-ink-900 border-l border-ink-800 p-4 h-screen sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="text-ink-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {totalCount === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-ink-400 mb-4">Your cart is empty</p>
                <button 
                  onClick={() => setShowCart(false)}
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg"
                >
                  Browse products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-ink-800 rounded-lg p-3 border border-ink-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-ink-700 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🛍️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate">{item.name}</h4>
                        <p className="text-brand-400 font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-ink-700 rounded-full flex items-center justify-center text-white hover:bg-ink-600"
                        >
                          -
                        </button>
                        <span className="text-white font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-ink-700 rounded-full flex items-center justify-center text-white hover:bg-ink-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Cart Total */}
                <div className="border-t border-ink-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-brand-400 font-bold text-xl">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push('/buyer/checkout')}
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-4 rounded-lg transition-colors transform hover:scale-105 active:scale-95"
                    >
                      Proceed to Checkout
                    </button>
                    <button 
                      onClick={() => setShowCart(false)}
                      className="w-full bg-ink-800 hover:bg-ink-700 text-white font-medium py-3 px-4 rounded-lg transition-colors border border-ink-700 transform hover:scale-105 active:scale-95"
                    >
                      Keep Shopping
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Chat Panel */}
        {showLiveChat && (
          <div className="w-80 bg-ink-900 border-l border-ink-800 p-4 h-screen sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Live Chat</h2>
              <button 
                onClick={() => setShowLiveChat(false)}
                className="text-ink-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-green-500 text-white text-center py-2 rounded-lg mb-4 text-sm">
              🟢 Online - Response time: &lt; 2 min
            </div>
            <div className="space-y-3 mb-4">
              <div className="bg-ink-800 rounded-lg p-3">
                <p className="text-sm text-ink-300">Hi! How can I help you today?</p>
                <span className="text-xs text-ink-500">2 min ago</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Notification */}
      {showCart && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          🛒 Cart updated! ({totalCount} items)
        </div>
      )}
    </div>
  )
}

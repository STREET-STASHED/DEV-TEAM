'use client'

import { useState, useEffect } from 'react'
import { mockProducts, mockCategories, mockStores, searchProducts, filterProductsByCategory } from '@/lib/mockData'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'

export default function MarketplacePage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')

  // Filter products based on search and category
  useEffect(() => {
    let filtered = mockProducts

    if (searchQuery) {
      filtered = searchProducts(searchQuery)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
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
      case 'trending':
      default:
        filtered = filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
        break
    }

    setProducts(filtered)
  }, [searchQuery, selectedCategory, sortBy])

  const handleAddToCart = (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log(`Added product ${productId} to cart`)
    alert('Product added to cart!')
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <header className="bg-ink-900 border-b border-ink-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <StreetStashedLogo size="md" />
          <div className="flex items-center space-x-4">
            <button className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg font-medium transition-colors">
              Cart (0)
            </button>
            <button className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg font-medium transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-ink-900 border-b border-ink-800 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products, stores, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400">
              🔍
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
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
                    : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-ink-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="trending">Trending</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Results Count */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {selectedCategory === 'all' ? 'All Products' : mockCategories.find(c => c.id === selectedCategory)?.name}
          </h1>
          <p className="text-ink-400">
            {products.length} products found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-ink-900 rounded-lg overflow-hidden border border-ink-800 hover:border-brand-500 transition-colors group">
                {/* Product Image */}
                <div className="relative h-64 bg-ink-800 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-ink-700 to-ink-800 flex items-center justify-center">
                    <span className="text-4xl text-ink-500">
                      {product.category === 'clothing' && '👕'}
                      {product.category === 'shoes' && '👟'}
                      {product.category === 'jewelry' && '💍'}
                      {product.category === 'accessories' && '👜'}
                      {product.category === 'watches' && '⌚'}
                    </span>
                  </div>
                  
                  {/* Trending Badge */}
                  {product.isTrending && (
                    <div className="absolute top-2 left-2 bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      🔥 Trending
                    </div>
                  )}
                  
                  {/* Sale Badge */}
                  {product.originalPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  {/* Store Name */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-ink-400">{product.storeName}</span>
                    <span className="text-xs bg-brand-500 text-white px-2 py-1 rounded-full">Verified</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-brand-400">
                          {i < Math.floor(product.rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-ink-400">({product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-brand-400">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-ink-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Delivery Info */}
                  <div className="text-sm text-ink-400">
                    🚚 {mockStores.find(s => s.id === product.storeId)?.deliveryTime}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-ink-400">
              Try adjusting your search or category filters
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

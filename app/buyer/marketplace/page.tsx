'use client'

import { useState, useEffect } from 'react'
import { mockProducts, mockCategories, searchProducts } from '@/lib/mockData'
import { useCart } from '@/context/CartContext'
import { ProductCard } from './ProductCard'

export default function MarketplacePage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [showCart, setShowCart] = useState(false)
  
  const { items: cart, updateQuantity, removeItem, totalCount, totalPrice } = useCart()

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

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
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
                🔍
              </div>
            </div>
          </div>

          {/* Cart Button */}
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative bg-brand-500 hover:bg-brand-600 px-6 py-3 rounded-lg font-medium transition-colors ml-6"
          >
            🛒 Cart ({totalCount})
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>
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
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4 ml-6">
            <span className="text-ink-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex gap-6 lg:gap-8">
        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Results Count */}
          <div className="mb-6 sm:mb-8">
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
                    created_at: new Date().toISOString(), // Mock creation date
                    storeName: product.storeName,
                  }}
                />
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
                ✕
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
                      onClick={() => {
                        // TODO: Implement checkout functionality
                        console.log('Proceeding to checkout...')
                      }}
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

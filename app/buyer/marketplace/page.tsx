'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { mockProducts, mockCategories, mockStores } from '@/lib/mockData'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory: string
  storeId: string
  storeName: string
  images: string[]
  sizes: string[]
  colors: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  isTrending: boolean
  tags: string[]
  created_at: string
}

interface Category {
  id: string
  name: string
  icon: string
  description: string
  productCount: number
  image: string
}

interface Store {
  id: string
  name: string
  description: string
  rating: number
  reviewCount: number
  deliveryTime: string
  minOrder: number
  categories: string[]
  image: string
  location: string
  isVerified: boolean
}

function MarketplaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStore, setSelectedStore] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState('trending')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const loadMarketplaceData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Load data from APIs with fallback to mock data
      await Promise.all([
        // API calls would go here
      ])
      
      // For now, use mock data
      setProducts(mockProducts)
      setCategories(mockCategories)
      setStores(mockStores)
      
    } catch (error) {
      console.error('Error loading marketplace data:', error)
      setError('Failed to load marketplace data')
      
      // Fallback to mock data
      setProducts(mockProducts)
      setCategories(mockCategories)
      setStores(mockStores)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...products]
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    
    // Apply store filter
    if (selectedStore !== 'all') {
      filtered = filtered.filter(product => product.storeId === selectedStore)
    }
    
    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default: // trending
        filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
    }
    
    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, selectedStore, priceRange, sortBy])

  useEffect(() => {
    loadMarketplaceData()
  }, [loadMarketplaceData])

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
    applyFilters()
  }, [applyFilters])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (selectedStore !== 'all') params.set('store', selectedStore)
    
    const queryString = params.toString()
    router.push(`/buyer/marketplace${queryString ? `?${queryString}` : ''}`)
  }

  const handleProductClick = (productId: string) => {
    router.push(`/buyer/marketplace/product/${productId}`)
  }

  const handleAddToCart = (product: Product) => {
    // In real implementation, this would add to cart context
    console.log('Adding to cart:', product.name)
    // Show success message
    alert(`${product.name} added to cart!`)
  }

  const handleAddToWishlist = (product: Product) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-300">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🛍️ Marketplace</h1>
              <p className="text-ink-300">Discover amazing products from local stores</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for products..."
                className="w-full bg-ink-900 border border-ink-700 rounded-lg px-4 py-3 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-ink-900 hover:bg-ink-700 px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-ink-900 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="trending">Trending</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

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
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                    onError={(e) => {
                      e.currentTarget.src = '/mock/default-product.jpg'
                    }}
                  />
                  
                  {/* Badges */}
                  {product.isTrending && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Trending
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
                      className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full transition-colors"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
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

export default function BuyerMarketplacePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarketplaceContent />
    </Suspense>
  )
}

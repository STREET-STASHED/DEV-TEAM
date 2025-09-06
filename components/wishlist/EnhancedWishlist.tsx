'use client'

import { useState } from 'react'
import { Heart, X, ShoppingCart, Eye, Share2, Trash2, Grid, List, Star } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'

interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image_url: string
  storeName: string
  category?: string
  brand?: string
  size?: string
  color?: string
  condition?: string
  rating?: number
  reviewCount?: number
  isOnSale?: boolean
  discount?: number
  isInStock?: boolean
  addedAt: string
}

interface EnhancedWishlistProps {
  isOpen: boolean
  onClose: () => void
}

export default function EnhancedWishlist({ isOpen, onClose }: EnhancedWishlistProps) {
  const { items, removeItem, clearWishlist } = useWishlist()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'name' | 'brand'>('newest')
  const [filterBy, setFilterBy] = useState<'all' | 'in_stock' | 'on_sale' | 'out_of_stock'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [_showFilters, _setShowFilters] = useState(false)

  // Enhanced wishlist items with more data
  const enhancedItems: WishlistItem[] = items.map(item => ({
    ...item,
    originalPrice: item.price * 1.2, // Mock original price
    brand: 'Nike', // Mock brand
    size: 'M', // Mock size
    color: 'Black', // Mock color
    condition: 'New', // Mock condition
    rating: 4.5, // Mock rating
    reviewCount: Math.floor(Math.random() * 100) + 10, // Mock review count
    isOnSale: Math.random() > 0.7, // Mock sale status
    discount: Math.floor(Math.random() * 30) + 10, // Mock discount
    isInStock: Math.random() > 0.2, // Mock stock status
    addedAt: new Date().toISOString() // Mock added date
  }))

  // Filter and sort items
  const filteredAndSortedItems = enhancedItems
    .filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return item.name.toLowerCase().includes(query) ||
               item.brand?.toLowerCase().includes(query) ||
               item.category?.toLowerCase().includes(query)
      }
      return true
    })
    .filter(item => {
      // Stock filter
      switch (filterBy) {
        case 'in_stock':
          return item.isInStock
        case 'on_sale':
          return item.isOnSale
        case 'out_of_stock':
          return !item.isInStock
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price
        case 'price_high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        case 'brand':
          return (a.brand || '').localeCompare(b.brand || '')
        default: // newest
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      }
    })

  // Handle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Handle bulk actions
  const handleBulkAction = (action: 'remove' | 'add_to_cart') => {
    if (action === 'remove') {
      selectedItems.forEach(itemId => removeItem(itemId))
      setSelectedItems([])
    } else if (action === 'add_to_cart') {
      // Add selected items to cart
      console.log('Adding to cart:', selectedItems)
      // TODO: Implement add to cart functionality
    }
  }

  // Calculate savings
  const totalSavings = enhancedItems.reduce((total, item) => {
    if (item.isOnSale && item.originalPrice) {
      return total + (item.originalPrice - item.price)
    }
    return total
  }, 0)

  // Calculate total value
  const totalValue = enhancedItems.reduce((total, item) => total + item.price, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-ink-900 rounded-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden border border-ink-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div className="flex items-center space-x-4">
            <Heart className="w-6 h-6 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">My Wishlist</h2>
              <p className="text-ink-400">
                {enhancedItems.length} items • ${totalValue.toFixed(2)} total value
                {totalSavings > 0 && (
                  <span className="text-green-400 ml-2">
                    • ${totalSavings.toFixed(2)} saved
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-ink-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wishlist..."
                  className="w-full sm:w-64 bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
                >
                  <option value="all">All Items</option>
                  <option value="in_stock">In Stock</option>
                  <option value="on_sale">On Sale</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                  <option value="brand">Brand A-Z</option>
                </select>
              </div>
            </div>

            {/* View Mode and Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-ink-400 hover:text-white hover:bg-ink-800'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-ink-400 hover:text-white hover:bg-ink-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('add_to_cart')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add to Cart ({selectedItems.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('remove')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove ({selectedItems.length})
                  </button>
                </div>
              )}

              <button
                onClick={clearWishlist}
                className="text-ink-400 hover:text-red-400 text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-ink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-ink-300 mb-2">
                {searchQuery ? 'No items found' : 'Your wishlist is empty'}
              </h3>
              <p className="text-ink-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Start adding items you love to your wishlist'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={onClose}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredAndSortedItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-ink-800 rounded-xl border border-ink-700 overflow-hidden transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 rounded border-ink-600 bg-ink-800 text-purple-500 focus:ring-purple-500 focus:ring-2"
                    />
                  </div>

                  {/* Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}`}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1">
                      {item.isOnSale && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          -{item.discount}%
                        </span>
                      )}
                      {!item.isInStock && (
                        <span className="bg-ink-600 text-white text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 flex-1">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-ink-400 hover:text-red-400 ml-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-ink-400 text-xs mb-2">{item.storeName}</p>
                    
                    {item.brand && (
                      <p className="text-ink-500 text-xs mb-2">{item.brand}</p>
                    )}

                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(item.rating!) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-ink-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-ink-400 text-xs">
                          {item.rating} ({item.reviewCount})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-white font-bold text-lg">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.isOnSale && item.originalPrice && (
                        <span className="text-ink-400 text-sm line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        disabled={!item.isInStock}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          item.isInStock
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-ink-700 text-ink-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4 inline mr-1" />
                        {item.isInStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredAndSortedItems.length > 0 && (
          <div className="p-6 border-t border-ink-700 bg-ink-800/50">
            <div className="flex items-center justify-between">
              <div className="text-ink-400 text-sm">
                Showing {filteredAndSortedItems.length} of {enhancedItems.length} items
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedItems(filteredAndSortedItems.map(item => item.id))}
                  className="text-ink-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-ink-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

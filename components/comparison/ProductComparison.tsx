'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Plus, Star, Heart, ShoppingCart, Share2, CheckCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image_url: string
  brand: string
  category: string
  size?: string
  color?: string
  condition: string
  rating: number
  reviewCount: number
  description: string
  features: string[]
  specifications: Record<string, string>
  seller: {
    name: string
    rating: number
    reviewCount: number
    verified: boolean
  }
  shipping: {
    free: boolean
    estimatedDays: number
    cost: number
  }
  returnPolicy: {
    days: number
    condition: string
  }
  isInStock: boolean
  isOnSale: boolean
  discount?: number
}

interface ProductComparisonProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onAddProduct?: (_product: Product) => void
  onRemoveProduct?: (_productId: string) => void
}

export default function ProductComparison({ 
  isOpen, 
  onClose, 
  products = [], 
  onAddProduct, 
  onRemoveProduct 
}: ProductComparisonProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(products)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])

  // Mock search results for adding products
  const mockSearchResults: Product[] = useMemo(() => [
    {
      id: '1',
      name: 'Nike Air Jordan 1 Retro High',
      price: 299.99,
      originalPrice: 399.99,
      image_url: '/mock/sneakers-1.jpg',
      brand: 'Nike',
      category: 'Sneakers',
      size: '10',
      color: 'Red/White/Black',
      condition: 'New',
      rating: 4.8,
      reviewCount: 1247,
      description: 'Classic Air Jordan 1 in the iconic Chicago colorway',
      features: ['Leather upper', 'Air-Sole unit', 'Rubber outsole', 'High-top design'],
      specifications: {
        'Upper Material': 'Leather',
        'Midsole': 'Air-Sole',
        'Outsole': 'Rubber',
        'Closure': 'Lace-up',
        'Weight': '13.5 oz'
      },
      seller: {
        name: 'SneakerHead Store',
        rating: 4.9,
        reviewCount: 2341,
        verified: true
      },
      shipping: {
        free: true,
        estimatedDays: 2,
        cost: 0
      },
      returnPolicy: {
        days: 30,
        condition: 'New with tags'
      },
      isInStock: true,
      isOnSale: true,
      discount: 25
    },
    {
      id: '2',
      name: 'Adidas Yeezy Boost 350 V2',
      price: 450.00,
      image_url: '/mock/sneakers-2.jpg',
      brand: 'Adidas',
      category: 'Sneakers',
      size: '10',
      color: 'Cream White',
      condition: 'New',
      rating: 4.6,
      reviewCount: 892,
      description: 'Kanye West collaboration with Adidas featuring Boost technology',
      features: ['Primeknit upper', 'Boost midsole', 'Rubber outsole', 'Slip-on design'],
      specifications: {
        'Upper Material': 'Primeknit',
        'Midsole': 'Boost',
        'Outsole': 'Rubber',
        'Closure': 'Slip-on',
        'Weight': '11.2 oz'
      },
      seller: {
        name: 'Yeezy Store',
        rating: 4.7,
        reviewCount: 1567,
        verified: true
      },
      shipping: {
        free: false,
        estimatedDays: 3,
        cost: 15.99
      },
      returnPolicy: {
        days: 14,
        condition: 'New with box'
      },
      isInStock: true,
      isOnSale: false
    }
  ], [])

  const maxProducts = 4

  // Handle adding product to comparison
  const handleAddProduct = (product: Product) => {
    if (selectedProducts.length >= maxProducts) {
      alert(`You can only compare up to ${maxProducts} products`)
      return
    }
    
    if (selectedProducts.find(p => p.id === product.id)) {
      alert('Product is already in comparison')
      return
    }
    
    setSelectedProducts(prev => [...prev, product])
    onAddProduct?.(product)
    setShowAddProduct(false)
  }

  // Handle removing product from comparison
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
    onRemoveProduct?.(productId)
  }

  // Search for products to add
  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = mockSearchResults.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, mockSearchResults])

  // Calculate comparison metrics
  const getComparisonMetrics = () => {
    if (selectedProducts.length < 2) return null

    const prices = selectedProducts.map(p => p.price)
    const ratings = selectedProducts.map(p => p.rating)
    const reviewCounts = selectedProducts.map(p => p.reviewCount)

    return {
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      averageRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      totalReviews: reviewCounts.reduce((a, b) => a + b, 0),
      priceRange: Math.max(...prices) - Math.min(...prices)
    }
  }

  const metrics = getComparisonMetrics()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-ink-900 rounded-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-hidden border border-ink-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Comparison</h2>
            <p className="text-ink-400">
              Compare up to {maxProducts} products side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add Product Section */}
        {selectedProducts.length < maxProducts && (
          <div className="p-6 border-b border-ink-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Products to Compare</h3>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {showAddProduct && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products to compare..."
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                
                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="bg-ink-800 rounded-lg p-4 border border-ink-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                        onClick={() => handleAddProduct(product)}
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-ink-400 text-xs mb-2">{product.brand}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold">${product.price}</span>
                          <span className="text-green-400 text-xs">Add to Compare</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          {selectedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-ink-400" />
              </div>
              <h3 className="text-xl font-semibold text-ink-300 mb-2">
                No products to compare
              </h3>
              <p className="text-ink-400 mb-6">
                Add products to start comparing features, prices, and more
              </p>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add Products
              </button>
            </div>
          ) : (
            <div className="min-w-full">
              {/* Product Headers */}
              <div className="flex">
                <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700">
                  <div className="text-ink-400 text-sm font-medium">Features</div>
                </div>
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                    <div className="flex items-start justify-between mb-3">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-ink-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-ink-400 text-xs mb-2">{product.brand}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-ink-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-ink-400 text-xs">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-lg">
                          ${product.price}
                        </span>
                        {product.isOnSale && product.originalPrice && (
                          <span className="text-ink-400 text-sm line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded text-xs font-medium transition-colors">
                          <ShoppingCart className="w-3 h-3 inline mr-1" />
                          Add to Cart
                        </button>
                        <button className="bg-ink-700 hover:bg-ink-600 text-white py-1 px-2 rounded text-xs transition-colors">
                          <Heart className="w-3 h-3" />
                        </button>
                        <button className="bg-ink-700 hover:bg-ink-600 text-white py-1 px-2 rounded text-xs transition-colors">
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="space-y-0">
                {/* Price */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Price</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <div className="text-white font-bold text-lg">
                        ${product.price}
                        {product.isOnSale && product.originalPrice && (
                          <span className="text-ink-400 text-sm line-through ml-2">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.isOnSale && product.discount && (
                        <div className="text-green-400 text-sm">
                          Save {product.discount}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Rating</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-ink-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-white font-semibold">{product.rating}</span>
                        <span className="text-ink-400 text-sm">({product.reviewCount})</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Condition */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Condition</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <span className="text-white">{product.condition}</span>
                    </div>
                  ))}
                </div>

                {/* Size */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Size</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <span className="text-white">{product.size || 'N/A'}</span>
                    </div>
                  ))}
                </div>

                {/* Color */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Color</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <span className="text-white">{product.color || 'N/A'}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Shipping</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <div className="text-white">
                        {product.shipping.free ? 'Free' : `$${product.shipping.cost}`}
                      </div>
                      <div className="text-ink-400 text-sm">
                        {product.shipping.estimatedDays} days
                      </div>
                    </div>
                  ))}
                </div>

                {/* Return Policy */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Return Policy</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <div className="text-white">
                        {product.returnPolicy.days} days
                      </div>
                      <div className="text-ink-400 text-sm">
                        {product.returnPolicy.condition}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Seller */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Seller</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{product.seller.name}</span>
                        {product.seller.verified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.seller.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-ink-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-ink-400 text-sm">
                          {product.seller.rating} ({product.seller.reviewCount})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="flex border-b border-ink-700">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-ink-700 bg-ink-800/50">
                    <div className="text-ink-300 text-sm font-medium">Key Features</div>
                  </div>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex-1 min-w-64 p-4 border-r border-ink-700 last:border-r-0">
                      <ul className="space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index} className="text-ink-300 text-sm flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {metrics && selectedProducts.length >= 2 && (
          <div className="p-6 border-t border-ink-700 bg-ink-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${metrics.lowestPrice}</div>
                <div className="text-ink-400 text-sm">Lowest Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${metrics.highestPrice}</div>
                <div className="text-ink-400 text-sm">Highest Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{metrics.averageRating.toFixed(1)}</div>
                <div className="text-ink-400 text-sm">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{metrics.totalReviews}</div>
                <div className="text-ink-400 text-sm">Total Reviews</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

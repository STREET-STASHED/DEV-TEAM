'use client'

import { useState, useEffect } from 'react'
import { 
  getPersonalizedRecommendations, 
  getCategoryRecommendations,
  trackUserBehavior,
  type ProductRecommendation,
  type RecommendationContext 
} from '@/lib/ai/recommendations'

interface ProductRecommendationsProps {
  userId?: string
  sessionId: string
  category?: string
  limit?: number
  title?: string
  showReason?: boolean
  className?: string
}

export default function ProductRecommendations({
  userId,
  sessionId,
  category,
  limit = 8,
  title = 'Recommended for You',
  showReason = true,
  className = ''
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [userId, sessionId, category, limit])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create recommendation context
      const context: RecommendationContext = {
        userId,
        sessionId,
        currentCategory: category,
        recentViews: [], // Would be populated from user session
        cartItems: [], // Would be populated from cart context
        purchaseHistory: [] // Would be populated from user profile
      }

      let results: ProductRecommendation[]

      if (category) {
        // Get category-specific recommendations
        results = await getCategoryRecommendations(category, context, limit)
      } else {
        // Get personalized recommendations
        results = await getPersonalizedRecommendations(context, limit)
      }

      setRecommendations(results)
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product: ProductRecommendation) => {
    // Track user behavior
    trackUserBehavior({
      userId,
      sessionId,
      productId: product.id,
      action: 'view',
      timestamp: new Date(),
      category: product.category,
      price: product.price
    })
  }

  const handleAddToCart = (product: ProductRecommendation) => {
    // Track user behavior
    trackUserBehavior({
      userId,
      sessionId,
      productId: product.id,
      action: 'add_to_cart',
      timestamp: new Date(),
      category: product.category,
      price: product.price
    })
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-ink-100">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-ink-800 rounded-lg h-48 mb-2"></div>
              <div className="bg-ink-800 rounded h-4 mb-1"></div>
              <div className="bg-ink-800 rounded h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-ink-400">{error}</p>
        <button 
          onClick={loadRecommendations}
          className="mt-2 text-brand-400 hover:text-brand-300 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-ink-400">No recommendations available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-ink-100">{title}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div 
            key={product.id} 
            className="group cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="relative mb-2">
              <img
                src={product.image_url || '/mock/default-product.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
              />
              
              {/* Recommendation Score Badge */}
              <div className="absolute top-2 right-2">
                <div className="bg-brand-500 text-white text-xs px-2 py-1 rounded-full">
                  {Math.round(product.score * 100)}%
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-1">
              <h4 className="font-medium text-ink-100 text-sm line-clamp-2">
                {product.name}
              </h4>
              
              <p className="text-brand-400 font-semibold">
                ${product.price.toFixed(2)}
              </p>
              
              {showReason && (
                <p className="text-xs text-ink-400 line-clamp-1">
                  {product.reason}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart(product)
                }}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-xs py-2 px-3 rounded-md transition-colors"
              >
                Add to Cart
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate to product detail
                  window.location.href = `/buyer/marketplace/product/${product.id}`
                }}
                className="bg-ink-700 hover:bg-ink-600 text-ink-200 text-xs py-2 px-3 rounded-md transition-colors"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {recommendations.length >= limit && (
        <div className="text-center pt-4">
          <button
            onClick={loadRecommendations}
            className="bg-ink-800 hover:bg-ink-700 text-ink-200 px-6 py-2 rounded-md transition-colors"
          >
            Load More Recommendations
          </button>
        </div>
      )}
    </div>
  )
}

// Specialized recommendation components
export function PersonalizedRecommendations(props: Omit<ProductRecommendationsProps, 'category'>) {
  return <ProductRecommendations {...props} title="Recommended for You" />
}

export function CategoryRecommendations(props: ProductRecommendationsProps & { category: string }) {
  return <ProductRecommendations {...props} title={`Popular in ${props.category}`} />
}

export function TrendingRecommendations(props: Omit<ProductRecommendationsProps, 'category'>) {
  return <ProductRecommendations {...props} title="Trending Now" />
}

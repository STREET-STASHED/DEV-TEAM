'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { Heart, ShoppingCart, Share2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Recommendation {
  productId: string
  score: number
  reason: string
  confidence: number
  product: {
    id: string
    name: string
    description: string
    price: number
    image: string
    category: string
    seller: {
      id: string
      name: string
    }
  }
}

interface RecommendationSectionProps {
  type?: 'hybrid' | 'collaborative' | 'content' | 'realtime' | 'contextual'
  title?: string
  limit?: number
  showReason?: boolean
  className?: string
}

export default function RecommendationSection({
  type = 'hybrid', title = 'Recommended for You', limit = 8, showReason = true, className = ''
}: RecommendationSectionProps) {
  const { user } = useSupabase()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Generate contextual data
  const getContext = () => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    const month = now.getMonth()

    return {
      timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
      dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day],
      season: month < 3 || month > 10 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall'
    }
  }

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        sessionId
      })

      // Add context for contextual recommendations
      if (type === 'contextual') {
        params.append('context', JSON.stringify(getContext()))
      }

      const response = await fetch(`/api/recommendations?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }, [user, type, limit, sessionId])

  // Track user behavior
  const trackBehavior = async (action: string, productId: string) => {
    if (!user) return

    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          productId,
          sessionId
        })
      })
    } catch (error) {
      console.error('Error tracking behavior:', error)
    }
  }

  // Handle product interactions
  const handleLike = (productId: string) => {
    trackBehavior('like', productId)
    // Add visual feedback here
  }

  const handleView = (productId: string) => {
    trackBehavior('view', productId)
  }

  const handleCart = (productId: string) => {
    trackBehavior('cart', productId)
    // Add to cart logic here
  }

  const handleShare = (productId: string) => {
    trackBehavior('share', productId)
    // Share logic here
  }

  // Fetch recommendations on mount and when type changes
  useEffect(() => {
    fetchRecommendations()
  }, [user, type, limit, fetchRecommendations])

  // Auto-refresh recommendations every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && type === 'realtime') {
        fetchRecommendations()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, type, fetchRecommendations])

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500 animate-pulse" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-ink-800 rounded-lg p-4 animate-pulse">
              <div className="bg-ink-700 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-ink-700 h-4 rounded w-3/4"></div>
                <div className="bg-ink-700 h-4 rounded w-1/2"></div>
                <div className="bg-ink-700 h-6 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="bg-ink-800/50 border border-ink-700 rounded-lg p-8 text-center">
          <Sparkles className="w-12 h-12 text-ink-500 mx-auto mb-4" />
          <p className="text-ink-400">Start browsing to get personalized recommendations!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {type === 'realtime' && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-ink-400">Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-400">
            {recommendations.length} recommendations
          </span>
          <button
            onClick={fetchRecommendations}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-ink-800 rounded-lg overflow-hidden border border-ink-700 hover:border-brand-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={rec.product.image || '/mock/default-product.jpg'}
                  alt={rec.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onLoad={() => handleView(rec.productId)}
                />
                
                {/* Confidence Badge */}
                <div className="absolute top-2 left-2">
                  <div className="bg-brand-600/90 text-ink-black text-xs px-2 py-1 rounded-full font-medium">
                    {Math.round(rec.confidence * 100)}% match
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleLike(rec.productId)}
                    className="bg-ink-900/80 hover:bg-red-600/80 text-white p-2 rounded-full transition-colors duration-200"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCart(rec.productId)}
                    className="bg-ink-900/80 hover:bg-brand-600/80 text-white p-2 rounded-full transition-colors duration-200"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare(rec.productId)}
                    className="bg-ink-900/80 hover:bg-ink-700/80 text-white p-2 rounded-full transition-colors duration-200"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors duration-200 line-clamp-2">
                    {rec.product.name}
                  </h3>
                  <p className="text-sm text-ink-400 line-clamp-1">
                    by {rec.product.seller.name}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-brand-500">
                    ${rec.product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-ink-500 bg-ink-700 px-2 py-1 rounded">
                    {rec.product.category}
                  </span>
                </div>

                {showReason && rec.reason && (
                  <div className="pt-2 border-t border-ink-700">
                    <p className="text-xs text-ink-400 line-clamp-2">
                      💡 {rec.reason}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}

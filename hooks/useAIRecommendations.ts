import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

export interface AIRecommendation {
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

export interface UseAIRecommendationsOptions {
  type?: 'hybrid' | 'collaborative' | 'content' | 'realtime' | 'contextual'
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
  enabled?: boolean
}

export interface UseAIRecommendationsReturn {
  recommendations: AIRecommendation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  trackBehavior: (_action: string, _productId: string) => Promise<void>
  sessionId: string
}

export function useAIRecommendations(_options:UseAIRecommendationsOptions = {}): UseAIRecommendationsReturn {
  const {
    type = 'hybrid',
    limit = 10,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true
  } = options

  const { user } = useSupabase()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Generate contextual data for contextual recommendations
  const getContext = useCallback(() => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    const month = now.getMonth()

    return {
      timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
      dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day],
      season: month < 3 || month > 10 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall'
    }
  }, [])

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user || !enabled) {
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
  }, [user, type, limit, sessionId, enabled, getContext])

  // Track user behavior
  const trackBehavior = useCallback(async (action: string, productId: string) => {
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
  }, [user, sessionId])

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchRecommendations()
  }, [fetchRecommendations])

  // Initial fetch
  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // Auto-refresh for real-time recommendations
  useEffect(() => {
    if (!autoRefresh || type !== 'realtime' || !user || !enabled) {
      return
    }

    const interval = setInterval(() => {
      fetchRecommendations()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, type, user, enabled, refreshInterval, fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    refetch,
    trackBehavior,
    sessionId
  }
}

// Convenience hooks for specific recommendation types
export function useHybridRecommendations(_limit?:number) {
  return useAIRecommendations({ type: 'hybrid', limit })
}

export function useCollaborativeRecommendations(_limit?:number) {
  return useAIRecommendations({ type: 'collaborative', limit })
}

export function useContentBasedRecommendations(_limit?:number) {
  return useAIRecommendations({ type: 'content', limit })
}

export function useRealTimeRecommendations(_limit?:number) {
  return useAIRecommendations({ 
    type: 'realtime', 
    limit, 
    autoRefresh: true,
    refreshInterval: 2 * 60 * 1000 // 2 minutes for real-time
  })
}

export function useContextualRecommendations(_limit?:number) {
  return useAIRecommendations({ type: 'contextual', limit })
}

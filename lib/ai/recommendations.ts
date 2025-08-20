import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/database.types'

// Types for recommendation system
export interface UserPreference {
  userId: string
  category: string
  brand: string
  priceRange: { min: number; max: number }
  style: string[]
  weight: number // 0-1, how much this preference matters
}

export interface ProductFeatures {
  id: string
  category: string
  brand: string
  price: number
  tags: string[]
  condition: string
  style: string[]
  sellerRating: number
  popularity: number // based on views, likes, purchases
}

export interface RecommendationScore {
  productId: string
  score: number
  reason: string
  confidence: number
}

export interface UserBehavior {
  userId: string
  productId: string
  action: 'view' | 'like' | 'cart' | 'purchase' | 'share'
  timestamp: Date
  sessionId: string
}

class AIRecommendationEngine {
  private supabase: ReturnType<typeof createClient<Database>>

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // 1. COLLABORATIVE FILTERING - Find similar users and recommend their liked items
  async getCollaborativeRecommendations(userId: string, limit: number = 10): Promise<RecommendationScore[]> {
    try {
      // Get user's purchase and interaction history
      const { data: userHistory } = await this.supabase
        .from('user_behaviors')
        .select('product_id, action, timestamp')
        .eq('user_id', userId)
        .in('action', ['purchase', 'like', 'cart'])

      if (!userHistory || userHistory.length === 0) {
        return this.getPopularItems(limit)
      }

      // Find similar users based on overlapping preferences
      const similarUsers = await this.findSimilarUsers(userId, userHistory)
      
      // Get products liked by similar users that current user hasn't seen
      const recommendations = await this.getProductsFromSimilarUsers(userId, similarUsers, limit)
      
      return recommendations
    } catch (error) {
      console.error('Collaborative filtering error:', error)
      return this.getPopularItems(limit)
    }
  }

  // 2. CONTENT-BASED FILTERING - Recommend items similar to what user has liked
  async getContentBasedRecommendations(userId: string, limit: number = 10): Promise<RecommendationScore[]> {
    try {
      // Get user's preferred product features
      const userPreferences = await this.extractUserPreferences(userId)
      
      if (!userPreferences || userPreferences.length === 0) {
        return this.getPopularItems(limit)
      }

      // Get all active products
      const { data: products } = await this.supabase
        .from('items')
        .select('*')
        .eq('active', true)

      if (!products) return []

      // Score products based on user preferences
      const scoredProducts = products.map(product => {
        const score = this.calculateContentScore(product, userPreferences)
        return {
          productId: product.id,
          score,
          reason: this.generateRecommendationReason(product, userPreferences),
          confidence: this.calculateConfidence(product, userPreferences)
        }
      })

      // Sort by score and return top recommendations
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Content-based filtering error:', error)
      return this.getPopularItems(limit)
    }
  }

  // 3. HYBRID RECOMMENDATIONS - Combine collaborative and content-based
  async getHybridRecommendations(userId: string, limit: number = 10): Promise<RecommendationScore[]> {
    try {
      const [collaborative, contentBased] = await Promise.all([
        this.getCollaborativeRecommendations(userId, limit * 2),
        this.getContentBasedRecommendations(userId, limit * 2)
      ])

      // Combine and re-rank recommendations
      const combined = this.combineRecommendations(collaborative, contentBased)
      
      return combined.slice(0, limit)
    } catch (error) {
      console.error('Hybrid recommendations error:', error)
      return this.getPopularItems(limit)
    }
  }

  // 4. REAL-TIME PERSONALIZATION - Based on current session
  async getRealTimeRecommendations(userId: string, sessionId: string, limit: number = 10): Promise<RecommendationScore[]> {
    try {
      // Get current session behavior
      const { data: sessionBehavior } = await this.supabase
        .from('user_behaviors')
        .select('product_id, action, timestamp')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(20)

      if (!sessionBehavior || sessionBehavior.length === 0) {
        return this.getHybridRecommendations(userId, limit)
      }

      // Extract session preferences
      const sessionPreferences = this.extractSessionPreferences(sessionBehavior)
      
      // Get products matching session preferences
      const { data: products } = await this.supabase
        .from('items')
        .select('*')
        .eq('active', true)

      if (!products) return []

      // Score based on session behavior
      const scoredProducts = products.map(product => {
        const score = this.calculateSessionScore(product, sessionPreferences)
        return {
          productId: product.id,
          score,
          reason: 'Based on your current browsing session',
          confidence: 0.7
        }
      })

      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Real-time recommendations error:', error)
      return this.getHybridRecommendations(userId, limit)
    }
  }

  // 5. CONTEXTUAL RECOMMENDATIONS - Based on time, location, weather, etc.
  async getContextualRecommendations(userId: string, context: {
    timeOfDay?: string
    dayOfWeek?: string
    season?: string
    location?: string
    weather?: string
  }, limit: number = 10): Promise<RecommendationScore[]> {
    try {
      // Get contextual preferences
      const contextualPreferences = this.getContextualPreferences(context)
      
      // Combine with user preferences
      const userPreferences = await this.extractUserPreferences(userId)
      const combinedPreferences = this.combinePreferences(userPreferences, contextualPreferences)
      
      // Get recommendations based on combined preferences
      const { data: products } = await this.supabase
        .from('items')
        .select('*')
        .eq('active', true)

      if (!products) return []

      const scoredProducts = products.map(product => {
        const score = this.calculateContextualScore(product, combinedPreferences, context)
        return {
          productId: product.id,
          score,
          reason: this.generateContextualReason(context),
          confidence: 0.8
        }
      })

      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Contextual recommendations error:', error)
      return this.getHybridRecommendations(userId, limit)
    }
  }

  // Helper methods
  private async findSimilarUsers(userId: string, userHistory: UserBehavior[]): Promise<string[]> {
    // Find users with similar purchase patterns
    const userProductIds = userHistory.map(h => h.product_id)
    
    const { data: similarUsers } = await this.supabase
      .from('user_behaviors')
      .select('user_id')
      .in('product_id', userProductIds)
      .neq('user_id', userId)
      .in('action', ['purchase', 'like'])

    if (!similarUsers) return []

    // Count overlaps and return top similar users
    const userCounts = similarUsers.reduce((acc, curr) => {
      acc[curr.user_id] = (acc[curr.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([userId]) => userId)
  }

  private async getProductsFromSimilarUsers(userId: string, similarUsers: string[], limit: number): Promise<RecommendationScore[]> {
    const { data: products } = await this.supabase
      .from('user_behaviors')
      .select('product_id, action')
      .in('user_id', similarUsers)
      .in('action', ['purchase', 'like'])
      .neq('user_id', userId)

    if (!products) return []

    // Score products based on how many similar users liked them
    const productScores = products.reduce((acc, curr) => {
      acc[curr.product_id] = (acc[curr.product_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(productScores)
      .map(([productId, score]) => ({
        productId,
        score,
        reason: `Liked by ${score} users with similar taste`,
        confidence: Math.min(score / 10, 1)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private async extractUserPreferences(userId: string): Promise<UserPreference[]> {
    const { data: userHistory } = await this.supabase
      .from('user_behaviors')
      .select('product_id, action, timestamp')
      .eq('user_id', userId)
      .in('action', ['purchase', 'like', 'cart'])
      .order('timestamp', { ascending: false })
      .limit(100)

    if (!userHistory) return []

    // Get product details for user's interactions
    const productIds = userHistory.map(h => h.product_id)
    const { data: products } = await this.supabase
      .from('items')
      .select('*')
      .in('id', productIds)

    if (!products) return []

    // Analyze preferences
    const preferences: UserPreference[] = []
    
    // Category preferences
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category || 'unknown'] = (acc[product.category || 'unknown'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(categoryCounts).forEach(([category, count]) => {
      preferences.push({
        userId,
        category,
        brand: '',
        priceRange: { min: 0, max: 1000 },
        style: [],
        weight: count / products.length
      })
    })

    // Price range preferences
    const prices = products.map(p => p.price).filter(p => p > 0)
    if (prices.length > 0) {
      preferences.push({
        userId,
        category: '',
        brand: '',
        priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
        style: [],
        weight: 0.8
      })
    }

    return preferences
  }

  private calculateContentScore(product: ProductFeatures, preferences: UserPreference[]): number {
    let score = 0

    preferences.forEach(pref => {
      // Category match
      if (pref.category && product.category === pref.category) {
        score += pref.weight * 0.3
      }

      // Price range match
      if (pref.priceRange && product.price >= pref.priceRange.min && product.price <= pref.priceRange.max) {
        score += pref.weight * 0.4
      }

      // Brand match (if we had brand data)
      if (pref.brand && product.brand === pref.brand) {
        score += pref.weight * 0.2
      }

      // Style match (if we had style data)
      if (pref.style.length > 0 && product.tags) {
        const styleOverlap = pref.style.filter(style => product.tags.includes(style)).length
        score += (styleOverlap / pref.style.length) * pref.weight * 0.1
      }
    })

    return score
  }

  private async getPopularItems(limit: number): Promise<RecommendationScore[]> {
    const { data: products } = await this.supabase
      .from('items')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!products) return []

    return products.map(product => ({
      productId: product.id,
      score: 1,
      reason: 'Popular items',
      confidence: 0.5
    }))
  }

  private combineRecommendations(collaborative: RecommendationScore[], contentBased: RecommendationScore[]): RecommendationScore[] {
    const combined = new Map<string, RecommendationScore>()

    // Add collaborative recommendations
    collaborative.forEach(rec => {
      combined.set(rec.productId, { ...rec, score: rec.score * 0.6 })
    })

    // Add content-based recommendations with boost
    contentBased.forEach(rec => {
      const existing = combined.get(rec.productId)
      if (existing) {
        existing.score += rec.score * 0.4
        existing.confidence = Math.max(existing.confidence, rec.confidence)
      } else {
        combined.set(rec.productId, { ...rec, score: rec.score * 0.4 })
      }
    })

    return Array.from(combined.values()).sort((a, b) => b.score - a.score)
  }

  private extractSessionPreferences(sessionBehavior: UserBehavior[]): Record<string, unknown> {
    // Extract preferences from current session
    const viewedProducts = sessionBehavior.filter(b => b.action === 'view').map(b => b.product_id)
    const likedProducts = sessionBehavior.filter(b => b.action === 'like').map(b => b.product_id)
    
    return {
      viewedProducts,
      likedProducts,
      sessionLength: sessionBehavior.length
    }
  }

  private calculateSessionScore(product: ProductFeatures, sessionPreferences: Record<string, unknown>): number {
    let score = 0

    // Boost if product was already viewed in this session
    if (sessionPreferences.viewedProducts.includes(product.id)) {
      score += 0.3
    }

    // High boost if product was liked in this session
    if (sessionPreferences.likedProducts.includes(product.id)) {
      score += 0.7
    }

    // Boost based on session length (longer sessions = more specific preferences)
    score += Math.min(sessionPreferences.sessionLength / 20, 0.2)

    return score
  }

  private getContextualPreferences(context: Record<string, unknown>): UserPreference[] {
    const preferences: UserPreference[] = []

    // Time-based preferences
    if (context.timeOfDay === 'morning') {
      preferences.push({
        userId: '',
        category: 'Streetwear',
        brand: '',
        priceRange: { min: 0, max: 200 },
        style: ['casual', 'comfortable'],
        weight: 0.6
      })
    } else if (context.timeOfDay === 'evening') {
      preferences.push({
        userId: '',
        category: 'Limited Edition',
        brand: '',
        priceRange: { min: 100, max: 1000 },
        style: ['premium', 'exclusive'],
        weight: 0.7
      })
    }

    // Season-based preferences
    if (context.season === 'winter') {
      preferences.push({
        userId: '',
        category: 'Streetwear',
        brand: '',
        priceRange: { min: 0, max: 500 },
        style: ['warm', 'layered'],
        weight: 0.8
      })
    }

    return preferences
  }

  private combinePreferences(userPrefs: UserPreference[], contextualPrefs: UserPreference[]): UserPreference[] {
    return [...userPrefs, ...contextualPrefs]
  }

  private calculateContextualScore(product: ProductFeatures, preferences: UserPreference[], context: Record<string, unknown>): number {
    let score = this.calculateContentScore(product, preferences)

    // Additional contextual boosts
    if (context.timeOfDay === 'evening' && product.price > 100) {
      score += 0.2 // Evening shoppers prefer premium items
    }

    if (context.season === 'winter' && product.category === 'Streetwear') {
      score += 0.3 // Winter boosts streetwear
    }

    return score
  }

  private generateRecommendationReason(product: ProductFeatures, preferences: UserPreference[]): string {
    const reasons = []
    
    preferences.forEach(pref => {
      if (pref.category && product.category === pref.category) {
        reasons.push(`You like ${pref.category}`)
      }
      if (pref.priceRange && product.price >= pref.priceRange.min && product.price <= pref.priceRange.max) {
        reasons.push('Matches your price range')
      }
    })

    return reasons.length > 0 ? reasons.join(', ') : 'Based on your preferences'
  }

  private generateContextualReason(context: Record<string, unknown>): string {
    const reasons = []
    
    if (context.timeOfDay) {
      reasons.push(`Perfect for ${context.timeOfDay}`)
    }
    if (context.season) {
      reasons.push(`Great for ${context.season}`)
    }

    return reasons.join(', ')
  }

  private calculateConfidence(product: ProductFeatures, preferences: UserPreference[]): number {
    // Calculate confidence based on how well product matches preferences
    let confidence = 0.5 // Base confidence

    const matchingPreferences = preferences.filter(pref => {
      if (pref.category && product.category === pref.category) return true
      if (pref.priceRange && product.price >= pref.priceRange.min && product.price <= pref.priceRange.max) return true
      return false
    })

    confidence += (matchingPreferences.length / preferences.length) * 0.5

    return Math.min(confidence, 1)
  }

  // Track user behavior for learning
  async trackUserBehavior(behavior: UserBehavior): Promise<void> {
    try {
      await this.supabase
        .from('user_behaviors')
        .insert({
          user_id: behavior.userId,
          product_id: behavior.productId,
          action: behavior.action,
          session_id: behavior.sessionId,
          timestamp: behavior.timestamp.toISOString()
        })
    } catch (error) {
      console.error('Error tracking user behavior:', error)
    }
  }
}

// Export singleton instance
export const recommendationEngine = new AIRecommendationEngine()

// Convenience functions
export async function getRecommendations(_userId: string, _type: 'hybrid' | 'collaborative' | 'content' | 'realtime' | 'contextual' = 'hybrid', _options?: { limit?: number }) {
  switch (type) {
    case 'collaborative':
      return recommendationEngine.getCollaborativeRecommendations(userId, options?.limit)
    case 'content':
      return recommendationEngine.getContentBasedRecommendations(userId, options?.limit)
    case 'realtime':
      return recommendationEngine.getRealTimeRecommendations(userId, options?.sessionId, options?.limit)
    case 'contextual':
      return recommendationEngine.getContextualRecommendations(userId, options?.context, options?.limit)
    default:
      return recommendationEngine.getHybridRecommendations(userId, options?.limit)
  }
}

export async function trackBehavior(_behavior:UserBehavior) {
  return recommendationEngine.trackUserBehavior(behavior)
}

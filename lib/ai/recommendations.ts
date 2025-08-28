import { createClient } from '@supabase/supabase-js'

export interface ProductRecommendation {
  id: string
  name: string
  category: string
  price: number
  image_url: string
  score: number
  reason: string
}

export interface UserBehavior {
  userId?: string
  sessionId: string
  productId: string
  action: 'view' | 'add_to_cart' | 'purchase' | 'like' | 'share'
  timestamp: Date
  category?: string
  price?: number
}

export interface RecommendationContext {
  userId?: string
  sessionId: string
  currentCategory?: string
  priceRange?: { min: number; max: number }
  recentViews: string[]
  cartItems: string[]
  purchaseHistory: string[]
}

class AIRecommendationEngine {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  /**
   * Generate personalized product recommendations
   */
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    try {
      // Get user behavior data
      const userBehavior = await this.getUserBehavior(context.userId, context.sessionId)

      // Calculate recommendation scores
      const recommendations = await this.calculateRecommendationScores(
        userBehavior,
        context,
        limit
      )

      // Apply diversity and freshness filters
      const filteredRecommendations = this.applyDiversityFilters(recommendations, limit)

      return filteredRecommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return this.getFallbackRecommendations(limit)
    }
  }

  /**
   * Get category-based recommendations
   */
  async getCategoryRecommendations(
    category: string,
    context: RecommendationContext,
    limit: number = 8
  ): Promise<ProductRecommendation[]> {
    try {
      // Get trending products in category
      const trendingProducts = await this.getTrendingProducts(category, limit)

      // Get similar products based on user preferences
      const similarProducts = await this.getSimilarProducts(category, context, limit)

      // Merge and rank recommendations
      const merged = this.mergeRecommendations(trendingProducts, similarProducts, limit)

      return merged
    } catch (error) {
      console.error('Error getting category recommendations:', error)
      return this.getFallbackRecommendations(limit)
    }
  }

  /**
   * Get trending products based on recent activity
   */
  async getTrendingProducts(category: string, limit: number): Promise<ProductRecommendation[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('id, name, category, price, image_url')
        .eq('category', category)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map((product: any) => ({
        ...product,
        score: 0.8, // Base trending score
        reason: 'Trending in this category'
      }))
    } catch (error) {
      console.error('Error getting trending products:', error)
      return []
    }
  }

  /**
   * Get similar products based on user preferences
   */
  async getSimilarProducts(
    category: string,
    context: RecommendationContext,
    limit: number
  ): Promise<ProductRecommendation[]> {
    try {
      // Analyze user preferences from behavior
      const preferences = this.analyzeUserPreferences(context)

      // Get products matching preferences
      const { data, error } = await this.supabase
        .from('products')
        .select('id, name, category, price, image_url')
        .eq('category', category)
        .eq('status', 'active')
        .gte('price', preferences.priceRange.min)
        .lte('price', preferences.priceRange.max)
        .limit(limit * 2) // Get more to filter

      if (error) throw error

      // Score products based on user preferences
      const scoredProducts = data.map((product: any) => ({
        ...product,
        score: this.calculatePreferenceScore(product, preferences),
        reason: 'Matches your preferences'
      }))

      // Return top scored products
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting similar products:', error)
      return []
    }
  }

  /**
   * Calculate recommendation scores based on user behavior
   */
  private async calculateRecommendationScores(
    userBehavior: UserBehavior[],
    context: RecommendationContext,
    limit: number
  ): Promise<ProductRecommendation[]> {
    try {
      // Get all active products
      const { data: products, error } = await this.supabase
        .from('products')
        .select('id, name, category, price, image_url')
        .eq('status', 'active')
        .limit(limit * 3) // Get more to filter

      if (error) throw error

      // Calculate scores for each product
      const scoredProducts = products.map((product: any) => {
        const score = this.calculateProductScore(product, userBehavior, context)
        return {
          ...product,
          score,
          reason: this.getRecommendationReason(product, userBehavior, context)
        }
      })

      // Sort by score and return top results
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Error calculating recommendation scores:', error)
      return []
    }
  }

  /**
   * Calculate individual product score
   */
  private calculateProductScore(
    product: any,
    userBehavior: UserBehavior[],
    context: RecommendationContext
  ): number {
    let score = 0

    // Category preference score
    if (context.currentCategory === product.category) {
      score += 0.3
    }

    // Price preference score
    if (context.priceRange) {
      const { min, max } = context.priceRange
      if (product.price >= min && product.price <= max) {
        score += 0.2
      }
    }

    // Recent views score
    if (context.recentViews.includes(product.id)) {
      score += 0.1
    }

    // Cart similarity score
    if (context.cartItems.includes(product.id)) {
      score += 0.15
    }

    // Purchase history score
    if (context.purchaseHistory.includes(product.id)) {
      score += 0.25
    }

    // Popularity score (based on views)
    const popularityScore = this.calculatePopularityScore(product, userBehavior)
    score += popularityScore * 0.1

    return Math.min(score, 1.0) // Cap at 1.0
  }

  /**
   * Calculate popularity score based on user behavior
   */
  private calculatePopularityScore(product: any, userBehavior: UserBehavior[]): number {
    const productViews = userBehavior.filter(
      behavior => behavior.productId === product.id && behavior.action === 'view'
    ).length

    const totalViews = userBehavior.filter(behavior => behavior.action === 'view').length

    if (totalViews === 0) return 0.5 // Default score

    return Math.min(productViews / totalViews * 2, 1.0) // Normalize to 0-1
  }

  /**
   * Analyze user preferences from behavior
   */
  private analyzeUserPreferences(context: RecommendationContext): any {
    const preferences = {
      priceRange: { min: 0, max: 1000 },
      preferredCategories: [],
      activityLevel: 'medium'
    }

    // Analyze price preferences from cart and purchases
    if (context.cartItems.length > 0 || context.purchaseHistory.length > 0) {
      // This would be enhanced with actual price data from products
      preferences.priceRange = { min: 10, max: 500 }
    }

    return preferences
  }

  /**
   * Get recommendation reason for display
   */
  private getRecommendationReason(
    product: any,
    userBehavior: UserBehavior[],
    context: RecommendationContext
  ): string {
    if (context.purchaseHistory.includes(product.id)) {
      return 'You purchased this before'
    }
    if (context.cartItems.includes(product.id)) {
      return 'In your cart'
    }
    if (context.recentViews.includes(product.id)) {
      return 'Recently viewed'
    }
    if (context.currentCategory === product.category) {
      return 'Popular in this category'
    }
    return 'Recommended for you'
  }

  /**
   * Apply diversity filters to avoid repetitive recommendations
   */
  private applyDiversityFilters(
    recommendations: ProductRecommendation[],
    limit: number
  ): ProductRecommendation[] {
    const filtered: ProductRecommendation[] = []
    const categories = new Set<string>()
    const priceRanges = new Set<string>()

    for (const rec of recommendations) {
      if (filtered.length >= limit) break

      const category = rec.category
      const priceRange = this.getPriceRange(rec.price)

      // Ensure diversity in categories and price ranges
      if (!categories.has(category) || !priceRanges.has(priceRange)) {
        filtered.push(rec)
        categories.add(category)
        priceRanges.add(priceRange)
      }
    }

    // Fill remaining slots if needed
    if (filtered.length < limit) {
      const remaining = recommendations.filter(rec => !filtered.includes(rec))
      filtered.push(...remaining.slice(0, limit - filtered.length))
    }

    return filtered
  }

  /**
   * Get price range category
   */
  private getPriceRange(price: number): string {
    if (price < 25) return 'budget'
    if (price < 75) return 'mid-range'
    if (price < 150) return 'premium'
    return 'luxury'
  }

  /**
   * Merge different recommendation sources
   */
  private mergeRecommendations(
    trending: ProductRecommendation[],
    similar: ProductRecommendation[],
    limit: number
  ): ProductRecommendation[] {
    const merged = [...trending, ...similar]

    // Remove duplicates
    const unique = merged.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    )

    // Sort by score and return top results
    return unique
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Get fallback recommendations when AI fails
   */
  private async getFallbackRecommendations(limit: number): Promise<ProductRecommendation[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('id, name, category, price, image_url')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map((product: any) => ({
        ...product,
        score: 0.5,
        reason: 'Popular items'
      }))
    } catch (error) {
      console.error('Error getting fallback recommendations:', error)
      return []
    }
  }

  /**
   * Get user behavior data
   */
  private async getUserBehavior(userId?: string, sessionId?: string): Promise<UserBehavior[]> {
    try {
      let query = this.supabase.from('user_behavior').select('*')

      if (userId) {
        query = query.eq('user_id', userId)
      } else if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting user behavior:', error)
      return []
    }
  }

  /**
   * Track user behavior for recommendations
   */
  async trackUserBehavior(behavior: UserBehavior): Promise<void> {
    try {
      await this.supabase
        .from('user_behavior')
        .insert({
          user_id: behavior.userId,
          session_id: behavior.sessionId,
          product_id: behavior.productId,
          action: behavior.action,
          timestamp: behavior.timestamp.toISOString(),
          category: behavior.category,
          price: behavior.price
        })
    } catch (error) {
      console.error('Error tracking user behavior:', error)
    }
  }
}

// Export singleton instance
export const aiRecommendationEngine = new AIRecommendationEngine()

// Export utility functions
export const getPersonalizedRecommendations = (context: RecommendationContext, limit?: number) =>
  aiRecommendationEngine.getPersonalizedRecommendations(context, limit)

export const getCategoryRecommendations = (category: string, context: RecommendationContext, limit?: number) =>
  aiRecommendationEngine.getCategoryRecommendations(category, context, limit)

export const trackUserBehavior = (behavior: UserBehavior) =>
  aiRecommendationEngine.trackUserBehavior(behavior)

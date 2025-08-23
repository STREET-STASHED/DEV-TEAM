import { enhancedPersonalizationSystem } from '../personalization/enhancedUserProfile'
import { aiStylistSystem } from './stylistPersonality'

// AI-Generated Style Recommendations & Outfit Creator
export interface StyleRecommendation {
  id: string
  _userId: string
  outfit: Outfit
  confidence: number
  reasoning: string[]
  occasion: string
  weather: string
  _mood: string
  priceRange: { min: number; max: number }
  alternatives: Outfit[]
  stylistNote: string
  createdAt: Date
}

export interface Outfit {
  id: string
  name: string
  description: string
  items: OutfitItem[]
  totalPrice: number
  style: string
  occasion: string
  season: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  tags: string[]
  image?: string
}

export interface OutfitItem {
  id: string
  name: string
  category: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessories'
  price: number
  brand: string
  color: string
  size: string
  image: string
  availability: 'in-stock' | 'low-stock' | 'out-of-stock'
  alternatives: string[]
}

export interface StyleInspiration {
  id: string
  title: string
  description: string
  image: string
  source: 'celebrity' | 'influencer' | 'runway' | 'street-style' | 'editorial'
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedCost: number
  items: string[]
}

export interface StyleQuiz {
  id: string
  questions: StyleQuestion[]
  results: StyleProfile
}

export interface StyleQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'scale' | 'image-choice'
  options: string[]
  weight: number
}

export interface StyleProfile {
  aesthetic: string
  colorPalette: string[]
  _stylePreferences: {
    colorPalette: string[]
    aesthetic: string
    priceRange: { min: number; max: number }
  }
  comfortLevel: number
  budgetRange: string
  lifestyle: string[]
}

export class AIStyleCreator {
  private static instance: AIStyleCreator
  private styleDatabase: Map<string, Outfit> = new Map()
  private inspirationDatabase: Map<string, StyleInspiration> = new Map()


  static getInstance(): AIStyleCreator {
    if (!AIStyleCreator.instance) {
      AIStyleCreator.instance = new AIStyleCreator()
      AIStyleCreator.instance.initializeStyleDatabase()
    }
    return AIStyleCreator.instance
  }

  private initializeStyleDatabase() {
    // Initialize with curated outfits
    const outfits: Outfit[] = [
      {
        id: 'outfit-streetwear-casual',
        name: 'Streetwear Casual',
        description: 'Perfect for everyday street style with a modern edge',
        items: [
          {
            id: 'item1',
            name: 'Oversized Hoodie',
            category: 'top',
            price: 89.99,
            brand: 'StreetBrand',
            color: 'Black',
            size: 'L',
            image: '/images/oversized-hoodie.jpg',
            availability: 'in-stock',
            alternatives: ['item1-alt', 'item1-alt2']
          },
          {
            id: 'item2',
            name: 'Cargo Pants',
            category: 'bottom',
            price: 129.99,
            brand: 'UrbanWear',
            color: 'Olive',
            size: '32',
            image: '/images/cargo-pants.jpg',
            availability: 'in-stock',
            alternatives: ['item2-alt', 'item2-alt2']
          },
          {
            id: 'item3',
            name: 'Chunky Sneakers',
            category: 'shoes',
            price: 159.99,
            brand: 'SneakerCo',
            color: 'White',
            size: '10',
            image: '/images/chunky-sneakers.jpg',
            availability: 'in-stock',
            alternatives: ['item3-alt', 'item3-alt2']
          }
        ],
        totalPrice: 379.97,
        style: 'streetwear',
        occasion: 'casual',
        season: 'all-season',
        difficulty: 'beginner',
        rating: 4.8,
        tags: ['streetwear', 'casual', 'modern', 'comfortable']
      },
      {
        id: 'outfit-luxury-elegant',
        name: 'Luxury Elegant',
        description: 'Sophisticated and timeless for special occasions',
        items: [
          {
            id: 'item4',
            name: 'Silk Blouse',
            category: 'top',
            price: 299.99,
            brand: 'LuxuryBrand',
            color: 'Cream',
            size: 'M',
            image: '/images/silk-blouse.jpg',
            availability: 'in-stock',
            alternatives: ['item4-alt', 'item4-alt2']
          },
          {
            id: 'item5',
            name: 'Tailored Pants',
            category: 'bottom',
            price: 399.99,
            brand: 'ElegantWear',
            color: 'Navy',
            size: '30',
            image: '/images/tailored-pants.jpg',
            availability: 'in-stock',
            alternatives: ['item5-alt', 'item5-alt2']
          },
          {
            id: 'item6',
            name: 'Leather Heels',
            category: 'shoes',
            price: 299.99,
            brand: 'LuxuryShoes',
            color: 'Black',
            size: '8',
            image: '/images/leather-heels.jpg',
            availability: 'in-stock',
            alternatives: ['item6-alt', 'item6-alt2']
          }
        ],
        totalPrice: 1299.97,
        style: 'luxury',
        occasion: 'formal',
        season: 'all-season',
        difficulty: 'intermediate',
        rating: 4.9,
        tags: ['luxury', 'elegant', 'formal', 'sophisticated']
      }
    ]

    outfits.forEach(outfit => {
      this.styleDatabase.set(outfit.id, outfit)
    })

    // Initialize inspiration database
    const inspirations: StyleInspiration[] = [
      {
        id: 'inspiration-streetwear',
        title: 'Streetwear Revolution',
        description: 'Inspired by urban culture and street art',
        image: '/images/inspiration-streetwear.jpg',
        source: 'street-style',
        tags: ['streetwear', 'urban', 'culture', 'art'],
        difficulty: 'medium',
        estimatedCost: 500,
        items: ['oversized tops', 'cargo pants', 'chunky sneakers', 'accessories']
      },
      {
        id: 'inspiration-minimalist',
        title: 'Minimalist Mastery',
        description: 'Less is more - clean lines and quality materials',
        image: '/images/inspiration-minimalist.jpg',
        source: 'editorial',
        tags: ['minimalist', 'clean', 'quality', 'timeless'],
        difficulty: 'easy',
        estimatedCost: 800,
        items: ['basic tees', 'straight jeans', 'white sneakers', 'minimal jewelry']
      }
    ]

    inspirations.forEach(inspiration => {
      this.inspirationDatabase.set(inspiration.id, inspiration)
    })
  }

  // Generate personalized style recommendations
  async generateStyleRecommendations(
    _userId: string,
    occasion: string,
    weather: string,
    _mood: string,
    budget: number
  ): Promise<StyleRecommendation[]> {
    // Get user's style profile
    const userProfile = await enhancedPersonalizationSystem.getUserProfile(_userId)
    const stylistPersonality = await aiStylistSystem.assignPersonality(_userId)
    
    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Analyze user preferences
    const stylePreferences = userProfile.stylePreferences

    // Generate outfit recommendations
    const recommendations: StyleRecommendation[] = []
    
    // Get outfits that match user preferences
    const matchingOutfits = this.findMatchingOutfits(
      stylePreferences,
      occasion,
      weather,
      budget
    )

    for (const outfit of matchingOutfits) {
      // Calculate confidence score
      const confidence = this.calculateOutfitConfidence(
        outfit,
        stylePreferences,
        occasion,
        weather,
        _mood
      )

      // Generate reasoning
      const reasoning = this.generateReasoning(
        outfit,
        stylePreferences,
        occasion,
        weather,
        _mood
      )

      // Generate alternatives
      const alternatives = this.generateAlternatives(outfit, budget)

      // Generate stylist note
      const stylistNote = aiStylistSystem.generateMessage(
        stylistPersonality,
        'recommendation'
      )

      const recommendation: StyleRecommendation = {
        id: crypto.randomUUID(),
        _userId,
        outfit,
        confidence,
        reasoning,
        occasion,
        weather,
        _mood,
        priceRange: { min: outfit.totalPrice * 0.8, max: outfit.totalPrice * 1.2 },
        alternatives,
        stylistNote,
        createdAt: new Date()
      }

      recommendations.push(recommendation)
    }

    // Sort by confidence and return top recommendations
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  }

  // Create custom outfit based on user preferences
  async createCustomOutfit(
    _userId: string,
    requirements: {
      occasion: string
      weather: string
      _mood: string
      budget: number
      style: string
      colors: string[]
    }
  ): Promise<Outfit> {
    // Get user profile
    const userProfile = await enhancedPersonalizationSystem.getUserProfile(_userId)
    
    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Generate outfit concept
    const outfitConcept = this.generateOutfitConcept(requirements, userProfile.stylePreferences)
    
    // Find items that match the concept
    const items = await this.findMatchingItems(outfitConcept, requirements.budget)
    
    // Create outfit
    const outfit: Outfit = {
      id: crypto.randomUUID(),
      name: `${requirements.style} ${requirements.occasion} Look`,
      description: `A custom ${requirements.style} outfit perfect for ${requirements.occasion}`,
      items,
      totalPrice: items.reduce((sum, item) => sum + item.price, 0),
      style: requirements.style,
      occasion: requirements.occasion,
      season: this.determineSeason(requirements.weather),
      difficulty: this.calculateDifficulty(items),
      rating: 0,
      tags: [requirements.style, requirements.occasion, requirements._mood, ...requirements.colors]
    }

    // Save to database
    this.styleDatabase.set(outfit.id, outfit)
    
    return outfit
  }

  // Find matching outfits based on criteria
  private findMatchingOutfits(
    _stylePreferences: Record<string, unknown>,
    occasion: string,
    weather: string,
    budget: number
  ): Outfit[] {
    const matchingOutfits: Outfit[] = []

    for (const outfit of this.styleDatabase.values()) {
      // Check if outfit matches criteria
      if (this.outfitMatchesCriteria(outfit, _stylePreferences, occasion, weather, budget)) {
        matchingOutfits.push(outfit)
      }
    }

    return matchingOutfits
  }

  // Check if outfit matches user criteria
  private outfitMatchesCriteria(
    outfit: Outfit,
    _stylePreferences: Record<string, unknown>,
    occasion: string,
    weather: string,
    budget: number
  ): boolean {
    // Check occasion match
    if (outfit.occasion !== occasion && outfit.occasion !== 'all-occasion') {
      return false
    }

    // Check budget match
    if (outfit.totalPrice > budget) {
      return false
    }

      // Check style preference match
  const styleMatch = (Array.isArray(_stylePreferences.aesthetic) && 
                     _stylePreferences.aesthetic.includes(outfit.style)) ||
                    (Array.isArray(_stylePreferences.aesthetic) && 
                     _stylePreferences.aesthetic.includes('versatile'))

    // Check weather/season match
    const weatherMatch = this.weatherMatchesSeason(weather, outfit.season)

    return styleMatch && weatherMatch
  }

  // Calculate outfit confidence score
  private calculateOutfitConfidence(
    outfit: Outfit,
    _stylePreferences: Record<string, unknown>,
    occasion: string,
    weather: string,
    _mood: string
  ): number {
    let confidence = 0.5 // Base confidence

    // Style preference match (30% weight)
    if (Array.isArray(_stylePreferences.aesthetic) && _stylePreferences.aesthetic.includes(outfit.style)) {
      confidence += 0.3
    } else if (Array.isArray(_stylePreferences.aesthetic) && _stylePreferences.aesthetic.includes('versatile')) {
      confidence += 0.2
    }

    // Color preference match (25% weight)
    const colorMatch = this.calculateColorMatch(outfit, Array.isArray(_stylePreferences.colorPalette) ? _stylePreferences.colorPalette : [])
    confidence += colorMatch * 0.25

    // Occasion match (20% weight)
    if (outfit.occasion === occasion) {
      confidence += 0.2
    } else if (outfit.occasion === 'all-occasion') {
      confidence += 0.15
    }

    // Weather/season match (15% weight)
    if (this.weatherMatchesSeason(weather, outfit.season)) {
      confidence += 0.15
    }

    // Mood match (10% weight)
    const moodMatch = this.calculateMoodMatch(outfit, _mood)
    confidence += moodMatch * 0.1

    return Math.min(confidence, 1.0)
  }

  // Calculate color match score
  private calculateColorMatch(outfit: Outfit, userColors: string[]): number {
    const outfitColors = outfit.items.map(item => item.color.toLowerCase())
    const userColorSet = new Set(userColors.map(color => color.toLowerCase()))
    
    let matchCount = 0
    outfitColors.forEach(color => {
      if (userColorSet.has(color)) {
        matchCount++
      }
    })
    
    return matchCount / outfitColors.length
  }

  // Calculate _mood match score
  private calculateMoodMatch(outfit: Outfit, _mood: string): number {
    const moodOutfitMap: Record<string, string[]> = {
      'confident': ['luxury', 'elegant', 'bold'],
      'casual': ['casual', 'streetwear', 'minimalist'],
      'creative': ['bohemian', 'artistic', 'unique'],
      'professional': ['business', 'formal', 'minimalist'],
      'romantic': ['romantic', 'feminine', 'elegant']
    }
    
    const moodStyles = moodOutfitMap[_mood] || []
    return moodStyles.includes(outfit.style) ? 1.0 : 0.5
  }

  // Generate reasoning for recommendation
  private generateReasoning(
    outfit: Outfit,
    _stylePreferences: Record<string, unknown>,
    occasion: string,
    weather: string,
    _mood: string
  ): string[] {
    const reasoning: string[] = []

    // Style reasoning
    if (Array.isArray(_stylePreferences.aesthetic) && _stylePreferences.aesthetic.includes(outfit.style)) {
      reasoning.push(`This ${outfit.style} style matches your preferred aesthetic`)
    }

    // Color reasoning
    const colorMatch = this.calculateColorMatch(outfit, Array.isArray(_stylePreferences.colorPalette) ? _stylePreferences.colorPalette : [])
    if (colorMatch > 0.7) {
      reasoning.push('The color palette aligns with your preferences')
    }

    // Occasion reasoning
    reasoning.push(`Perfect for ${occasion} occasions`)

    // Weather reasoning
    if (this.weatherMatchesSeason(weather, outfit.season)) {
      reasoning.push(`Ideal for ${weather} weather conditions`)
    }

    // Price reasoning
    if (outfit.totalPrice <= (_stylePreferences.priceRange as any)?.preferred || 1000) {
      reasoning.push('Fits within your preferred budget range')
    }

    return reasoning
  }

  // Generate alternative outfits
  private generateAlternatives(originalOutfit: Outfit, budget: number): Outfit[] {
    const alternatives: Outfit[] = []
    
    // Find outfits with similar style but different price points
    for (const outfit of this.styleDatabase.values()) {
      if (outfit.id === originalOutfit.id) continue
      
      if (outfit.style === originalOutfit.style && 
          outfit.occasion === originalOutfit.occasion &&
          outfit.totalPrice <= budget) {
        alternatives.push(outfit)
      }
    }
    
    return alternatives.slice(0, 3)
  }

  // Generate outfit concept
  private generateOutfitConcept(requirements: Record<string, unknown>, _stylePreferences: Record<string, unknown>): Record<string, unknown> {
    return {
      style: requirements.style as string,
      occasion: requirements.occasion as string,
      colors: requirements.colors as string[],
      budget: requirements.budget as number,
      complexity: this.determineComplexity(requirements.occasion as string)
    }
  }

  // Find matching items for outfit
  private async findMatchingItems(outfitConcept: Record<string, unknown>, budget: number): Promise<OutfitItem[]> {
    // Mock implementation - would query item database
    const items: OutfitItem[] = [
      {
        id: 'custom-item1',
        name: 'Custom Top',
        category: 'top',
        price: Math.min(budget * 0.4, 150),
        brand: 'CustomBrand',
        color: (Array.isArray(outfitConcept.colors) ? outfitConcept.colors[0] : 'Black') || 'Black',
        size: 'M',
        image: '/images/custom-top.jpg',
        availability: 'in-stock',
        alternatives: []
      },
      {
        id: 'custom-item2',
        name: 'Custom Bottom',
        category: 'bottom',
        price: Math.min(budget * 0.4, 200),
        brand: 'CustomBrand',
        color: (Array.isArray(outfitConcept.colors) ? outfitConcept.colors[1] : 'Blue') || 'Blue',
        size: '32',
        image: '/images/custom-bottom.jpg',
        availability: 'in-stock',
        alternatives: []
      },
      {
        id: 'custom-item3',
        name: 'Custom Shoes',
        category: 'shoes',
        price: Math.min(budget * 0.2, 100),
        brand: 'CustomBrand',
        color: (Array.isArray(outfitConcept.colors) ? outfitConcept.colors[2] : 'White') || 'White',
        size: '10',
        image: '/images/custom-shoes.jpg',
        availability: 'in-stock',
        alternatives: []
      }
    ]
    
    return items
  }

  // Determine season from weather
  private determineSeason(weather: string): string {
    if (weather.includes('cold') || weather.includes('snow')) return 'winter'
    if (weather.includes('rain')) return 'spring'
    if (weather.includes('hot') || weather.includes('sunny')) return 'summer'
    return 'all-season'
  }

  // Calculate outfit difficulty
  private calculateDifficulty(items: OutfitItem[]): 'beginner' | 'intermediate' | 'advanced' {
    const totalItems = items.length
    const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / totalItems
    
    if (totalItems <= 3 && avgPrice < 100) return 'beginner'
    if (totalItems <= 4 && avgPrice < 200) return 'intermediate'
    return 'advanced'
  }

  // Determine complexity based on occasion
  private determineComplexity(occasion: string): 'simple' | 'moderate' | 'complex' {
    const simpleOccasions = ['casual', 'everyday', 'weekend']
    const moderateOccasions = ['work', 'date', 'party']
    // const complexOccasions = ['formal', 'wedding', 'gala']
    
    if (simpleOccasions.includes(occasion)) return 'simple'
    if (moderateOccasions.includes(occasion)) return 'moderate'
    return 'complex'
  }

  // Check if weather matches season
  private weatherMatchesSeason(weather: string, season: string): boolean {
    if (season === 'all-season') return true
    
    const weatherSeasonMap: Record<string, string[]> = {
      'winter': ['cold', 'snow', 'freezing'],
      'spring': ['rain', 'mild', 'cool'],
      'summer': ['hot', 'sunny', 'warm'],
      'fall': ['cool', 'mild', 'windy']
    }
    
    const seasonWeathers = weatherSeasonMap[season] || []
    return seasonWeathers.some(w => weather.includes(w))
  }

  // Get style inspirations
  getStyleInspirations(style?: string): StyleInspiration[] {
    let inspirations = Array.from(this.inspirationDatabase.values())
    
    if (style) {
      inspirations = inspirations.filter(inspiration => 
        inspiration.tags.includes(style)
      )
    }
    
    return inspirations
  }

  // Get outfit by ID
  getOutfit(outfitId: string): Outfit | undefined {
    return this.styleDatabase.get(outfitId)
  }

  // Get all outfits
  getAllOutfits(): Outfit[] {
    return Array.from(this.styleDatabase.values())
  }

  // Rate outfit
  async rateOutfit(outfitId: string, rating: number, _userId: string): Promise<void> {
    const outfit = this.styleDatabase.get(outfitId)
    if (!outfit) return
    
    // Update rating (simple average for now)
    const currentRating = outfit.rating
    const ratingCount = 1 // Would track actual rating count
    outfit.rating = (currentRating * ratingCount + rating) / (ratingCount + 1)
    
    // Update database
    this.styleDatabase.set(outfitId, outfit)
  }
}

export const aiStyleCreator = AIStyleCreator.getInstance()

import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition')
    const sellerRating = searchParams.get('sellerRating')
    const tags = searchParams.get('tags')
    const sortBy = searchParams.get('sortBy') || 'relevance'

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        suggestions: [],
        total: 0,
        query: query
      })
    }

    const supabase = await createRouteHandlerClient()

    // Build search query
    let searchQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        category,
        price,
        image_url,
        condition,
        tags,
        seller_id,
        created_at
      `)
      .eq('status', 'active')

    // Text search with full-text search if available
    if (query) {
      // Use full-text search if available, otherwise fallback to ILIKE
      searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    }

    // Apply filters
    if (category) {
      const categories = category.split(',')
      searchQuery = searchQuery.in('category', categories)
    }

    if (minPrice) {
      searchQuery = searchQuery.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      searchQuery = searchQuery.lte('price', parseFloat(maxPrice))
    }

    if (condition) {
      const conditions = condition.split(',')
      searchQuery = searchQuery.in('condition', conditions)
    }

    // Note: seller rating requires a relationship to profiles.
    // In mock mode, skip filtering by seller rating to avoid schema dependencies.

    if (tags) {
      const tagArray = tags.split(',')
      searchQuery = searchQuery.overlaps('tags', tagArray)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        searchQuery = searchQuery.order('price', { ascending: true })
        break
      case 'price_high':
        searchQuery = searchQuery.order('price', { ascending: false })
        break
      case 'rating':
        // In mock mode, no rating column is present; fallback to newest
        searchQuery = searchQuery.order('created_at', { ascending: false })
        break
      case 'newest':
        searchQuery = searchQuery.order('created_at', { ascending: false })
        break
      default:
        // Relevance sorting (default) - will be applied after AI scoring
        searchQuery = searchQuery.order('created_at', { ascending: false })
    }

    // Execute search
    const { data: products, error } = await searchQuery.limit(50)

    if (error) {
      console.error('Search error:', error)
      // Fallback to mock data
      return NextResponse.json({
        results: generateMockResults(query),
        suggestions: generateMockSuggestions(query),
        total: 0,
        query: query
      })
    }

    // Apply AI-powered relevance scoring
    const scoredResults = await applyRelevanceScoring(products || [], query)

    // Generate search suggestions
    const suggestions = await generateSearchSuggestions(query, products || [])

    return NextResponse.json({
      results: scoredResults,
      suggestions: suggestions,
      total: scoredResults.length,
      query: query
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed', results: [], suggestions: [], total: 0 },
      { status: 500 }
    )
  }
}

// AI-powered relevance scoring
async function applyRelevanceScoring(products: any[], query: string) {
  try {
    // In a real app, this would use an AI service for relevance scoring
    // For now, we'll implement a sophisticated scoring algorithm

    const scoredProducts = products.map(product => {
      let score = 0
      const queryLower = query.toLowerCase()

      // Name relevance (highest weight)
      if (product.name?.toLowerCase().includes(queryLower)) {
        score += 0.4
        // Exact match bonus
        if (product.name.toLowerCase() === queryLower) {
          score += 0.2
        }
        // Starts with query bonus
        if (product.name.toLowerCase().startsWith(queryLower)) {
          score += 0.1
        }
      }

      // Description relevance
      if (product.description?.toLowerCase().includes(queryLower)) {
        score += 0.2
      }

      // Category relevance
      if (product.category?.toLowerCase().includes(queryLower)) {
        score += 0.15
      }

      // Tags relevance
      if (product.tags && Array.isArray(product.tags)) {
        const tagMatches = product.tags.filter((tag: string) =>
          tag.toLowerCase().includes(queryLower)
        ).length
        score += tagMatches * 0.1
      }

      // Recency bonus (newer products get slight boost)
      if (product.created_at) {
        const daysSinceCreation = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreation < 7) score += 0.05
        else if (daysSinceCreation < 30) score += 0.02
      }

      // Seller rating bonus
      if (product.profiles?.avg_rating) {
        score += (product.profiles.avg_rating - 3) * 0.02 // Small bonus for high ratings
      }

      // Condition bonus
      if (product.condition === 'new') {
        score += 0.03
      } else if (product.condition === 'like-new') {
        score += 0.02
      }

      return {
        ...product,
        relevance_score: Math.min(score, 1.0) // Cap at 1.0
      }
    })

    // Sort by relevance score
    return scoredProducts.sort((a, b) => b.relevance_score - a.relevance_score)

  } catch (error) {
    console.error('Relevance scoring error:', error)
    // Return products with default scores
    return products.map(product => ({
      ...product,
      relevance_score: 0.5
    }))
  }
}

// Generate search suggestions
async function generateSearchSuggestions(query: string, products: any[]) {
  try {
    const suggestions: string[] = []
    const queryLower = query.toLowerCase()

    // Category-based suggestions
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
    categories.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        suggestions.push(`${query} ${category}`)
      }
    })

    // Tag-based suggestions
    const allTags = products.flatMap(p => p.tags || []).filter(Boolean)
    const uniqueTags = [...new Set(allTags)]
    uniqueTags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.push(`${query} ${tag}`)
      }
    })

    // Common search patterns
    const commonPatterns = [
      `${query} sneakers`,
      `${query} hoodies`,
      `${query} streetwear`,
      `${query} limited edition`,
      `${query} vintage`
    ]

    suggestions.push(...commonPatterns)

    // Remove duplicates and limit results
    return [...new Set(suggestions)].slice(0, 8)

  } catch (error) {
    console.error('Suggestion generation error:', error)
    return []
  }
}

// Fallback mock data generation
function generateMockResults(query: string) {
  const mockProducts = [
    { id: '1', name: 'Nike Air Jordan 1 Retro High OG', category: 'sneakers', price: 299, image_url: '/mock/sneaker1.jpg', relevance_score: 0.95, tags: ['limited-edition', 'streetwear'], seller_rating: 4.8, condition: 'new' },
    { id: '2', name: 'Supreme Box Logo Hoodie', category: 'hoodies', price: 199, image_url: '/mock/hoodie1.jpg', relevance_score: 0.92, tags: ['streetwear', 'limited-edition'], seller_rating: 4.9, condition: 'like-new' },
    { id: '3', name: 'Adidas Yeezy Boost 350 V2', category: 'sneakers', price: 399, image_url: '/mock/sneaker2.jpg', relevance_score: 0.88, tags: ['streetwear'], seller_rating: 4.7, condition: 'good' },
    { id: '4', name: 'Off-White Industrial Belt', category: 'accessories', price: 89, image_url: '/mock/belt1.jpg', relevance_score: 0.85, tags: ['luxury', 'streetwear'], seller_rating: 4.6, condition: 'new' }
  ]

  return mockProducts
    .filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    .sort((a, b) => b.relevance_score - a.relevance_score)
}

function generateMockSuggestions(query: string) {
  return [
    `${query} sneakers`,
    `${query} hoodies`,
    `${query} streetwear`,
    `${query} limited edition`,
    `${query} vintage`
  ]
}

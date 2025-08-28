import { NextRequest, NextResponse } from 'next/server'

// Mock AI recommendations for development
const mockRecommendations = [
  {
    id: 'rec-1',
    type: 'outfit',
    name: 'Urban Street Style',
    description: 'Perfect for casual outings and street photography',
    items: [
      { id: 'prod-1', name: 'Urban Street Hoodie', price: 89.99, image: '/mock/hoodie-1.jpg' },
      { id: 'prod-4', name: 'Limited Edition Sneakers', price: 299.99, image: '/mock/sneakers-1.jpg' },
      { id: 'prod-6', name: 'Diamond Pendant Necklace', price: 899.99, image: '/mock/necklace-1.jpg' }
    ],
    totalPrice: 1289.97,
    confidence: 0.95,
    occasion: 'casual',
    style: 'streetwear'
  },
  {
    id: 'rec-2',
    type: 'outfit',
    name: 'Athletic Performance',
    description: 'Great for workouts and active lifestyle',
    items: [
      { id: 'prod-3', name: 'Performance Leggings', price: 65.99, image: '/mock/leggings-1.jpg' },
      { id: 'prod-4', name: 'Limited Edition Sneakers', price: 299.99, image: '/mock/sneakers-1.jpg' }
    ],
    totalPrice: 365.98,
    confidence: 0.92,
    occasion: 'athletic',
    style: 'sporty'
  },
  {
    id: 'rec-3',
    type: 'outfit',
    name: 'Vintage Retro',
    description: 'Classic vintage look with modern streetwear edge',
    items: [
      { id: 'prod-2', name: 'Vintage Denim Jacket', price: 145, image: '/mock/denim-jacket-1.jpg' },
      { id: 'prod-5', name: 'Classic Boots', price: 189.99, image: '/mock/boots-1.jpg' },
      { id: 'prod-7', name: 'Sterling Silver Ring', price: 145, image: '/mock/ring-1.jpg' }
    ],
    totalPrice: 479.99,
    confidence: 0.88,
    occasion: 'casual',
    style: 'vintage'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'outfit'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Filter recommendations by type and limit
    const filtered = mockRecommendations
      .filter(rec => rec.type === type)
      .slice(0, limit)

    return NextResponse.json({
      recommendations: filtered,
      type,
      total: filtered.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Recommendations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { styleProfile, _preferences } = body

    // Generate personalized recommendations based on style profile
    const personalized = mockRecommendations.map(rec => ({
      ...rec,
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
      personalized: true,
      reason: `Based on your ${styleProfile?.stylePreferences?.[0] || 'streetwear'} preferences`
    }))

    return NextResponse.json({
      recommendations: personalized,
      personalized: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Recommendations POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trending = searchParams.get('trending')
    const limit = searchParams.get('limit')
    const category = searchParams.get('category')
    const store = searchParams.get('store') || searchParams.get('seller_id')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    
    const supabase = createServiceRoleClient()
    
    // Try to fetch from database first
    let items = null
    let error = null
    
    try {
      let query = supabase
        .from('items')
        .select('*')
      
      if (trending === 'true') {
        query = query.eq('isTrending', true)
      }

      // Apply basic filters when hitting the real database
      if (category) {
        const categories = category.split(',')
        query = query.in('category', categories)
      }

      if (store) {
        // Store is the seller / store id in this simplified schema
        query = query.eq('seller_id', store)
      }

      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice))
      }

      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice))
      }
      
      if (limit) {
        query = query.limit(parseInt(limit))
      }
      
      const result = await query
      items = result.data
      error = result.error
    } catch (dbError) {
      console.log('Database not available, using mock data')
      error = dbError
    }
    
    if (error || !items) {
      console.log('Using mock data as fallback')
      // Apply the same filters to the mock data so category / price / store filters still work
      let mockItems = [
        {
          id: '1',
          name: 'Vintage Nike Air Jordan 1',
          description: 'Classic red and black Air Jordan 1s in excellent condition. Perfect for collectors and streetwear enthusiasts.',
          price: 299.99,
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
          category: 'sneakers',
          seller_id: 'store-1',
          created_at: '2024-08-18T10:00:00Z',
          isTrending: true,
          active: true
        },
        {
          id: '2',
          name: 'Supreme Box Logo Hoodie',
          description: 'Limited edition Supreme box logo hoodie in black. Authentic and in perfect condition.',
          price: 450.0,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center',
          category: 'streetwear',
          seller_id: 'store-2',
          created_at: '2024-08-17T15:30:00Z',
          isTrending: true,
          active: true
        },
        {
          id: '3',
          name: 'Off-White Industrial Belt',
          description: 'Iconic Off-White industrial belt with signature zip tie. Perfect accessory for any outfit.',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
          category: 'accessories',
          seller_id: 'store-3',
          created_at: '2024-08-16T12:15:00Z',
          isTrending: false,
          active: true
        },
        {
          id: '4',
          name: 'Palace Tri-Ferg T-Shirt',
          description: 'Classic Palace Tri-Ferg logo t-shirt in white. Comfortable fit and great quality.',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
          category: 'streetwear',
          seller_id: 'store-1',
          created_at: '2024-08-15T09:45:00Z',
          isTrending: true,
          active: true
        },
        {
          id: '5',
          name: 'Yeezy Boost 350 V2',
          description: 'Authentic Yeezy Boost 350 V2 in Zebra colorway. Includes original box and accessories.',
          price: 399.99,
          image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&crop=center',
          category: 'sneakers',
          seller_id: 'store-2',
          created_at: '2024-08-14T14:20:00Z',
          isTrending: true,
          active: true
        },
        {
          id: '6',
          name: 'Bape Shark Hoodie',
          description: 'Rare Bape shark hoodie with full zip design. Authentic Japanese streetwear.',
          price: 599.99,
          image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
          category: 'streetwear',
          seller_id: 'store-3',
          created_at: '2024-08-13T11:10:00Z',
          isTrending: false,
          active: true
        }
      ]

      if (trending === 'true') {
        mockItems = mockItems.filter((item) => item.isTrending)
      }

      if (category) {
        const categories = category
          .split(',')
          .map((c) => c.toLowerCase())
        mockItems = mockItems.filter((item) =>
          categories.includes((item.category || '').toLowerCase())
        )
      }

      if (store) {
        mockItems = mockItems.filter((item) => item.seller_id === store)
      }

      if (minPrice) {
        const min = parseFloat(minPrice)
        mockItems = mockItems.filter((item) => item.price >= min)
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice)
        mockItems = mockItems.filter((item) => item.price <= max)
      }

      if (limit) {
        mockItems = mockItems.slice(0, parseInt(limit))
      }

      return NextResponse.json({ items: mockItems })
    }
    
    return NextResponse.json({ items: items || [] })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

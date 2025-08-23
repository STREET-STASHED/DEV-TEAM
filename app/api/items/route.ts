import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trending = searchParams.get('trending')
    const limit = searchParams.get('limit')
    
    const supabase = createServiceRoleClient()
    
    let query = supabase
      .from('items')
      .select('*')
      .eq('active', true)
    
    if (trending === 'true') {
      query = query.eq('isTrending', true)
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data: items, error } = await query
    
    if (error) {
      console.error('Error fetching items:', error)
      // Return mock data as fallback
      return NextResponse.json({
        items: [
          {
            id: '1',
            name: 'Vintage Nike Air Jordan 1',
            description: 'Classic red and black Air Jordan 1s in excellent condition. Perfect for collectors and streetwear enthusiasts.',
            price: 299.99,
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
            category: 'Sneakers',
            created_at: '2024-08-18T10:00:00Z',
            isTrending: true,
            active: true
          },
          {
            id: '2',
            name: 'Supreme Box Logo Hoodie',
            description: 'Limited edition Supreme box logo hoodie in black. Authentic and in perfect condition.',
            price: 450.00,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center',
            category: 'Streetwear',
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
            category: 'Accessories',
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
            category: 'Streetwear',
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
            category: 'Sneakers',
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
            category: 'Streetwear',
            created_at: '2024-08-13T11:10:00Z',
            isTrending: false,
            active: true
          }
        ]
      })
    }
    
    return NextResponse.json({ items: items || [] })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    
    const supabase = createServiceRoleClient()
    
    let query = supabase
      .from('stores')
      .select('*')
      .eq('active', true)
    
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data: stores, error } = await query
    
    if (error) {
      console.error('Error fetching stores:', error)
      // Return mock data as fallback
      return NextResponse.json({
        stores: [
          {
            id: 'store-1',
            name: 'Urban Threads Collective',
            description: 'Premium streetwear and urban fashion from local designers',
            rating: 4.8,
            reviewCount: 1247,
            deliveryTime: '45-75 min',
            minOrder: 25,
            categories: ['clothing', 'shoes', 'accessories'],
            image: 'https://picsum.photos/400/400?random=20',
            location: 'Downtown District',
            isVerified: true,
            active: true,
            featured: true
          },
          {
            id: 'store-2',
            name: 'Sneaker Haven',
            description: 'Exclusive sneakers and athletic wear from top brands',
            rating: 4.9,
            reviewCount: 892,
            deliveryTime: '30-60 min',
            minOrder: 50,
            categories: ['shoes', 'clothing'],
            image: 'https://picsum.photos/400/400?random=21',
            location: 'Sports District',
            isVerified: true,
            active: true,
            featured: true
          },
          {
            id: 'store-3',
            name: 'Luxe Jewelry Co.',
            description: 'Handcrafted jewelry and luxury accessories',
            rating: 4.7,
            reviewCount: 567,
            deliveryTime: '60-90 min',
            minOrder: 75,
            categories: ['jewelry', 'accessories'],
            image: 'https://picsum.photos/400/400?random=22',
            location: 'Fashion Quarter',
            isVerified: true,
            active: true,
            featured: true
          }
        ]
      })
    }
    
    return NextResponse.json({ stores: stores || [] })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

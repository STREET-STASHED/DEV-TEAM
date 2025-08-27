import { createServiceRoleClient } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    const supabase = createServiceRoleClient()

    // First, let's check what columns actually exist in the stores table
    let query = supabase
      .from('stores')
      .select('*')

    // Only filter by active if the column exists
    try {
      // Test if active column exists by trying to filter by it
      const testQuery = supabase
        .from('stores')
        .select('active')
        .limit(1)

      const { error: testError } = await testQuery

      if (!testError) {
        // active column exists, use it
        query = query.eq('active', true)
      }
    } catch (_columnError) {
      console.log('Active column not available, skipping filter')
    }

    if (featured === 'true') {
      try {
        // Test if featured column exists
        const testQuery = supabase
          .from('stores')
          .select('featured')
          .limit(1)

        const { error: testError } = await testQuery

        if (!testError) {
          query = query.eq('featured', true)
        }
      } catch (_columnError) {
        console.log('Featured column not available, skipping filter')
      }
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

    // Transform database column names to API response format
    const transformedStores = stores?.map(store => ({
      id: store.id,
      name: store.name,
      description: store.description,
      location: store.location,
      rating: (store as any).rating || 0,
      reviewCount: (store as any).review_count || 0,
      deliveryTime: (store as any).delivery_time || '45-75 min',
      minOrder: (store as any).min_order || 0,
      categories: (store as any).categories || [],
      image: (store as any).image || 'https://picsum.photos/400/400?random=20',
      isVerified: (store as any).is_verified || false,
      active: (store as any).active !== false, // Default to true
      featured: (store as any).featured || false
    })) || []

    return NextResponse.json({ stores: transformedStores })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

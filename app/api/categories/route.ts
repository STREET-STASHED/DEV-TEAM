import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    
    // Use mock data since categories table may not exist in schema
    const mockCategories = [
      {
        id: 'clothing',
        name: 'Clothing',
        icon: '👕',
        description: 'Fashion apparel and accessories',
        productCount: 1247,
        image: 'https://picsum.photos/400/400?random=1',
        active: true,
        featured: true
      },
      {
        id: 'shoes',
        name: 'Shoes',
        icon: '👟',
        description: 'Footwear for every occasion',
        productCount: 892,
        image: 'https://picsum.photos/400/400?random=2',
        active: true,
        featured: true
      },
      {
        id: 'accessories',
        name: 'Accessories',
        icon: '👜',
        description: 'Jewelry, bags, and style enhancers',
        productCount: 567,
        image: 'https://picsum.photos/400/400?random=3',
        active: true,
        featured: true
      },
      {
        id: 'jewelry',
        name: 'Jewelry',
        icon: '💍',
        description: 'Elegant jewelry and watches',
        productCount: 423,
        image: 'https://picsum.photos/400/400?random=4',
        active: true,
        featured: true
      },
      {
        id: 'activewear',
        name: 'Activewear',
        icon: '🏃',
        description: 'Performance and athletic wear',
        productCount: 345,
        image: 'https://picsum.photos/400/400?random=5',
        active: true,
        featured: true
      },
      {
        id: 'vintage',
        name: 'Vintage',
        icon: '🕰️',
        description: 'Timeless and retro fashion',
        productCount: 234,
        image: 'https://picsum.photos/400/400?random=6',
        active: true,
        featured: true
      }
    ]

    const categories = featured === 'true' 
      ? mockCategories.filter(cat => cat.featured)
      : mockCategories
    
    return NextResponse.json({ categories })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

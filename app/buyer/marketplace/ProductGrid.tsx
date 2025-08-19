import { ProductCard } from './ProductCard'

type Item = {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string | null
  created_at: string
}

async function getItems(): Promise<Item[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/items`, {
      next: { revalidate: 60 } // Cache for 1 minute
    })
    
    if (!response.ok) {
      console.error('Error fetching items:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.items ?? []
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

export async function ProductGrid() {
  const items = await getItems()

  if (!items.length) {
    return (
      <div className="text-center py-24">
        <div className="mx-auto h-24 w-24 text-ink-500 mb-8">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-ink-200 mb-4">No products found</h3>
        <p className="text-ink-400 mb-10 text-lg">
          Check back later for new arrivals from our amazing stylists!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-12">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          product={{
            id: item.id,
            name: item.name,
            description: item.description ?? '',
            price: Number(item.price ?? 0),
            image_url: item.image || '/mock/default-product.jpg',
            seller_id: '',
            category: item.category ?? 'General',
            created_at: item.created_at,
          }}
        />
      ))}
    </div>
  )
}

import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

type Item = {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string | null
  created_at: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Product ${id}`,
    description: 'Product details',
  }
}

async function getItem(id: string): Promise<Item | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/items`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const items: Item[] = data.items ?? []
    return items.find((item: Item) => item.id === id) || null
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const item = await getItem(id)

  if (!item) {
    return (
      <div className="container-premium py-8">
        <h1 className="text-xl font-semibold mb-2">Product not found</h1>
        <p>We couldn&apos;t find that item.</p>
      </div>
    )
  }

  return (
    <div className="container-premium py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Image */}
      <div className="aspect-square bg-ink-800 rounded-xl overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">{item.name}</h1>
        <p className="text-ink-400">{item.description}</p>
      </div>
    </div>
  )
}

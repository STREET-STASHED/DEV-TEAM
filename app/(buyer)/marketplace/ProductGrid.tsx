import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { ProductCard } from './ProductCard'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  seller_id: string
  category: string
  created_at: string
}

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      seller_id,
      category,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

export async function ProductGrid() {
  const products = await getProducts()

  if (products.length === 0) {
    return (
      <div className="empty-premium">
        <div className="empty-icon-premium">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="empty-title-premium">No products found</h3>
        <p className="empty-description-premium">
          Check back later for new arrivals from our amazing stylists!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <Link key={product.id} href={`/buyer/marketplace/product/${product.id}`}>
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  )
}

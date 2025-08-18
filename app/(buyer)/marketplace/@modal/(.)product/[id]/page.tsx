import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ProductModal } from './ProductModal'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  seller_id: string
  category: string
  stock: number
  created_at: string
  seller: {
    username: string
    full_name: string
  }
}

async function getProduct(id: string): Promise<Product | null> {
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
      stock,
      created_at,
      seller:profiles!products_seller_id_fkey (
        username,
        full_name
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function ProductModalPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return <ProductModal product={product} />
}

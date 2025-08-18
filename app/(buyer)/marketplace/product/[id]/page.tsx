import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ProductDetails } from './ProductDetails'
import { ProductDetailsSkeleton } from './ProductDetailsSkeleton'
import { Suspense } from 'react'

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id)
  
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails product={product} />
      </Suspense>
    </div>
  )
}

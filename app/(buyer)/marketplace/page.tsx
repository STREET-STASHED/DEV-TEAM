import { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductGrid } from './ProductGrid'
import { ProductGridSkeleton } from './ProductGridSkeleton'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Discover unique streetwear from local stylists',
}

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
          Discover Unique Streetwear
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Shop curated collections from local fashion stylists and discover your next favorite piece
        </p>
      </div>

      {/* Product Grid with Streaming */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  )
}

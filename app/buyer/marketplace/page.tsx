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
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
          Discover Unique Streetwear
        </h1>
        <p className="text-xl text-ink-400 max-w-4xl mx-auto leading-relaxed">
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

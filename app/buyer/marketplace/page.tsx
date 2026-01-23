'use client'

import { Suspense } from 'react'
import dynamicImport from 'next/dynamic'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Dynamically import the client component to avoid SSR issues
const MarketplaceContent = dynamicImport(() => import('./MarketplaceContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-ink-300">Loading marketplace...</p>
      </div>
    </div>
  )
})

export default function MarketplacePage() {
  console.log("MARKETPLACE PAGE RENDER", typeof window === "undefined" ? "server" : "client");

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-300">Loading marketplace...</p>
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  )
}

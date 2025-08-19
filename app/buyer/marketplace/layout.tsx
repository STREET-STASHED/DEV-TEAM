import { Metadata } from 'next'
import { Suspense } from 'react'
import { CartProvider } from '@/context/CartContext'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Discover unique streetwear from local stylists',
}

export default function MarketplaceLayout({
  children,
  cart,
  filters,
  modal,
}: {
  children: React.ReactNode
  cart: React.ReactNode
  filters: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-ink-black to-ink-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-14">
            {/* Filters Sidebar */}
            <aside className="xl:col-span-2">
              <Suspense fallback={<div className="bg-ink-900 rounded-3xl shadow-card border border-ink-800 p-8">Loading filters...</div>}>
                {filters}
              </Suspense>
            </aside>
            
            {/* Main Content */}
            <main className="xl:col-span-7">
              {children}
            </main>
            
            {/* Cart Sidebar */}
            <aside className="xl:col-span-3">
              {cart}
            </aside>
          </div>
        </div>
        
        {/* Modal */}
        {modal}
      </div>
    </CartProvider>
  )
}

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Discover unique streetwear from local stylists',
}

export default function MarketplaceLayout({
  children,
  cart,
  filters,
}: {
  children: React.ReactNode
  cart: React.ReactNode
  filters: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="container-premium py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            {filters}
          </aside>
          
          {/* Main Content */}
          <main className="lg:col-span-2">
            {children}
          </main>
          
          {/* Cart Sidebar */}
          <aside className="lg:col-span-1">
            {cart}
          </aside>
        </div>
      </div>
    </div>
  )
}

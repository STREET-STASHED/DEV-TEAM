import Link from 'next/link'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'
import { featuredProducts, featuredStores, mockCategories } from '@/lib/mockData'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <header className="bg-ink-900 border-b border-ink-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <StreetStashedLogo size="lg" />
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/buyer/marketplace" className="text-ink-300 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/signup" className="text-ink-300 hover:text-white transition-colors">
              Sign Up
            </Link>
            <Link href="/login" className="text-ink-300 hover:text-white transition-colors">
              Sign In
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/buyer/marketplace" className="bg-brand-500 hover:bg-brand-600 px-6 py-3 rounded-lg font-medium transition-colors">
              Shop Now
            </Link>
            <Link href="/signup" className="bg-ink-800 hover:bg-ink-700 px-6 py-3 rounded-lg font-medium transition-colors">
              Start Selling
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
            Discover Unique Streetwear
          </h1>
          <p className="text-xl text-ink-400 max-w-4xl mx-auto leading-relaxed mb-12">
            Shop curated collections from local fashion stylists and discover your next favorite piece
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/buyer/marketplace" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Shop Now
            </Link>
            <Link href="/signup" className="bg-ink-800 hover:bg-ink-700 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-ink-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {mockCategories.map((category) => (
              <Link
                key={category.id}
                href={`/buyer/marketplace?category=${category.id}`}
                className="bg-ink-800 rounded-lg p-6 text-center hover:bg-ink-700 transition-colors group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{category.name}</h3>
                <p className="text-sm text-ink-400">{category.productCount} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Trending Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-ink-900 rounded-lg overflow-hidden border border-ink-800 hover:border-brand-500 transition-colors group">
                {/* Product Image */}
                <div className="relative h-64 bg-ink-800 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-ink-700 to-ink-800 flex items-center justify-center">
                    <span className="text-4xl text-ink-500">
                      {product.category === 'clothing' && '👕'}
                      {product.category === 'shoes' && '👟'}
                      {product.category === 'jewelry' && '💍'}
                      {product.category === 'accessories' && '👜'}
                      {product.category === 'watches' && '⌚'}
                    </span>
                  </div>
                  
                  {/* Trending Badge */}
                  <div className="absolute top-2 left-2 bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    🔥 Trending
                  </div>
                  
                  {/* Sale Badge */}
                  {product.originalPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-ink-400">{product.storeName}</span>
                    <span className="text-xs bg-brand-500 text-white px-2 py-1 rounded-full">Verified</span>
                  </div>
                  
                  <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-brand-400">
                          {i < Math.floor(product.rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-ink-400">({product.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-brand-400">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-ink-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href={`/buyer/marketplace?product=${product.id}`}
                    className="block w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/buyer/marketplace"
              className="bg-ink-800 hover:bg-ink-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section className="py-16 px-4 bg-ink-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Top Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStores.map((store) => (
              <div key={store.id} className="bg-ink-800 rounded-lg p-6 text-center hover:bg-ink-700 transition-colors">
                <div className="w-16 h-16 bg-brand-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                  🏪
                </div>
                <h3 className="font-semibold text-white mb-2">{store.name}</h3>
                <p className="text-sm text-ink-400 mb-3 line-clamp-2">{store.description}</p>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-brand-400 text-sm">
                        {i < Math.floor(store.rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-ink-400">({store.reviewCount})</span>
                </div>
                <div className="text-xs text-ink-400 mb-4">
                  🚚 {store.deliveryTime} • Min ${store.minOrder}
                </div>
                <Link
                  href={`/buyer/marketplace?store=${store.id}`}
                  className="block w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Shop Store
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Fashion Journey?
          </h2>
          <p className="text-lg text-ink-400 mb-8">
            Join thousands of fashion enthusiasts discovering unique styles and supporting local creators
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Get Started
            </Link>
            <Link href="/buyer/marketplace" className="bg-ink-800 hover:bg-ink-700 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-900 border-t border-ink-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <StreetStashedLogo size="md" />
          <p className="text-ink-400 mt-4">
            © 2024 StreetStashed. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

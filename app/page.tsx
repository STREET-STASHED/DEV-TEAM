import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'StreetStashed - Premium Streetwear Marketplace',
  description: 'Discover unique streetwear from local stylists. Shop the latest trends with premium quality and authentic style.',
  keywords: 'streetwear, fashion, marketplace, local stylists, premium clothing',
  openGraph: {
    title: 'StreetStashed - Premium Streetwear Marketplace',
    description: 'Discover unique streetwear from local stylists',
    type: 'website',
    locale: 'en_US',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Hero Section */}
      <section className="hero-premium">
        <div className="container-premium">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                StreetStashed
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Discover unique streetwear from local stylists. 
                <span className="text-primary-600 font-semibold"> Premium quality.</span> 
                <span className="text-neutral-800 font-semibold"> Authentic style.</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/buyer/marketplace"
                className="btn-primary text-lg px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Shop Now
              </Link>
              <Link 
                href="/seller/upload"
                className="btn-secondary text-lg px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-premium">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Why Choose StreetStashed?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Experience the future of streetwear shopping with our premium marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-hover p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Curated Collections</h3>
              <p className="text-neutral-600 leading-relaxed">
                Handpicked streetwear from verified local stylists and fashion enthusiasts
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Authentic Quality</h3>
              <p className="text-neutral-600 leading-relaxed">
                Every item is verified for authenticity and quality before listing
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-warning-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Lightning Fast</h3>
              <p className="text-neutral-600 leading-relaxed">
                Instant checkout and same-day shipping from local sellers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-premium bg-white">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Shop by Category
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Find exactly what you're looking for in our carefully organized categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Sneakers', icon: '👟', color: 'bg-blue-100', textColor: 'text-blue-600' },
              { name: 'Streetwear', icon: '👕', color: 'bg-green-100', textColor: 'text-green-600' },
              { name: 'Accessories', icon: '👜', color: 'bg-purple-100', textColor: 'text-purple-600' },
              { name: 'Vintage', icon: '🕰️', color: 'bg-orange-100', textColor: 'text-orange-600' },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/buyer/marketplace?category=${category.name}`}
                className="card card-hover p-6 text-center space-y-4 group"
              >
                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors duration-300">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-premium bg-gradient-primary">
        <div className="container-premium">
          <div className="text-center text-white space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of fashion enthusiasts discovering unique streetwear every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/buyer/marketplace"
                className="bg-white text-primary-600 hover:bg-neutral-100 text-lg px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Browse Marketplace
              </Link>
              <Link 
                href="/auth/signup"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-premium">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">StreetStashed</h3>
              <p className="text-neutral-300">
                The premium marketplace for authentic streetwear from local stylists.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Shop</h4>
              <ul className="space-y-2 text-neutral-300">
                <li><Link href="/buyer/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/buyer/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/buyer/orders" className="hover:text-white transition-colors">Orders</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Sell</h4>
              <ul className="space-y-2 text-neutral-300">
                <li><Link href="/seller/upload" className="hover:text-white transition-colors">Upload Products</Link></li>
                <li><Link href="/seller/dashboard" className="hover:text-white transition-colors">Seller Dashboard</Link></li>
                <li><Link href="/seller/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Support</h4>
              <ul className="space-y-2 text-neutral-300">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 mt-12 pt-8 text-center text-neutral-300">
            <p>&copy; 2024 StreetStashed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

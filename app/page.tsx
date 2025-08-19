import { Metadata } from 'next'
import Link from 'next/link'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'

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
    <div className="min-h-screen bg-gradient-to-br from-ink-black to-ink-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-black to-ink-900 py-24">
        <div className="container-premium">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              {/* Hero Logo */}
              <div className="flex justify-center">
                <StreetStashedLogo size="lg" variant="gold" showText={false} />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                StreetStashed
              </h1>
              <p className="text-xl md:text-2xl text-ink-300 max-w-3xl mx-auto leading-relaxed">
                Discover unique streetwear from local stylists. 
                <span className="text-brand-500 font-semibold"> Premium quality.</span> 
                <span className="text-white font-semibold"> Authentic style.</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/buyer/marketplace"
                className="bg-brand-600 text-ink-black hover:bg-brand-500 focus:ring-brand-400 shadow-card hover:shadow-hover transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-2xl font-semibold focus-visible:shadow-ring"
              >
                Shop Now
              </Link>
              <Link 
                href="/seller/upload"
                className="bg-ink-800 text-ink-100 hover:bg-ink-700 focus:ring-ink-600 border border-ink-700 text-lg px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose StreetStashed?
            </h2>
            <p className="text-xl text-ink-400 max-w-2xl mx-auto">
              Experience the future of streetwear shopping with our premium marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-ink-900 rounded-2xl shadow-card border border-ink-800 hover:shadow-hover transition-all duration-300 overflow-hidden p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto border border-brand-500/30">
                <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Curated Collections</h3>
              <p className="text-ink-400 leading-relaxed">
                Handpicked streetwear from verified local stylists and fashion enthusiasts
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-ink-900 rounded-2xl shadow-card border border-ink-800 hover:shadow-hover transition-all duration-300 overflow-hidden p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-success-500/20 rounded-2xl flex items-center justify-center mx-auto border border-success-500/30">
                <svg className="w-8 h-8 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Authentic Quality</h3>
              <p className="text-ink-400 leading-relaxed">
                Every item is verified for authenticity and quality before listing
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-ink-900 rounded-2xl shadow-card border border-ink-800 hover:shadow-hover transition-all duration-300 overflow-hidden p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-warning-500/20 rounded-2xl flex items-center justify-center mx-auto border border-warning-500/30">
                <svg className="w-8 h-8 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Lightning Fast</h3>
              <p className="text-ink-400 leading-relaxed">
                Instant checkout and same-day shipping from local sellers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-ink-900">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Shop by Category
            </h2>
            <p className="text-xl text-ink-400 max-w-2xl mx-auto">
              Find exactly what you&apos;re looking for in our carefully organized categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Sneakers', icon: '👟', color: 'bg-brand-500/20', textColor: 'text-brand-400', borderColor: 'border-brand-500/30' },
              { name: 'Streetwear', icon: '👕', color: 'bg-success-500/20', textColor: 'text-success-400', borderColor: 'border-success-500/30' },
              { name: 'Accessories', icon: '👜', color: 'bg-warning-500/20', textColor: 'text-warning-400', borderColor: 'border-warning-500/30' },
              { name: 'Vintage', icon: '🕰️', color: 'bg-error-500/20', textColor: 'text-error-400', borderColor: 'border-error-500/30' },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/buyer/marketplace?category=${category.name}`}
                className="bg-ink-black rounded-2xl shadow-card border border-ink-800 hover:shadow-hover transition-all duration-300 overflow-hidden p-6 text-center space-y-4 group"
              >
                <div className={`w-16 h-16 ${category.color} ${category.borderColor} border rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors duration-300">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-brand-500 to-brand-600">
        <div className="container-premium">
          <div className="text-center text-ink-black space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of fashion enthusiasts discovering unique streetwear every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/buyer/marketplace"
                className="bg-ink-black text-white hover:bg-ink-900 text-lg px-8 py-4 rounded-2xl font-semibold shadow-card hover:shadow-hover transform hover:scale-105 transition-all duration-300"
              >
                Browse Marketplace
              </Link>
              <Link 
                href="/auth/signup"
                className="border-2 border-ink-black text-ink-black hover:bg-ink-black hover:text-white text-lg px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-black text-ink-100 py-16 border-t border-ink-800">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <StreetStashedLogo size="md" variant="gold" />
              <p className="text-ink-300">
                The premium marketplace for authentic streetwear from local stylists.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Shop</h4>
              <ul className="space-y-2 text-ink-300">
                <li><Link href="/buyer/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/buyer/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/buyer/orders" className="hover:text-white transition-colors">Orders</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Sell</h4>
              <ul className="space-y-2 text-ink-300">
                <li><Link href="/seller/upload" className="hover:text-white transition-colors">Upload Products</Link></li>
                <li><Link href="/seller/dashboard" className="hover:text-white transition-colors">Seller Dashboard</Link></li>
                <li><Link href="/seller/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Support</h4>
              <ul className="space-y-2 text-ink-300">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-ink-800 mt-12 pt-8 text-center text-ink-300">
            <p>&copy; 2024 StreetStashed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import Link from 'next/link'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'
import { featuredProducts, featuredStores } from '@/lib/mockData'

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

      {/* Live Updates Bar */}
      <div className="bg-gradient-to-r from-brand-500 to-purple-600 p-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
            </svg>
            <span>LIVE UPDATES</span>
            <div className="flex space-x-4">
              <span className="text-xs opacity-90">New drop: Limited Edition Sneakers just added!</span>
              <span className="text-xs opacity-90">StyleMaster Pro just restocked their collection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Super Dope */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/10 to-ink-900"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black text-white leading-tight mb-8 bg-gradient-to-r from-white via-brand-100 to-brand-200 bg-clip-text text-transparent">
            STREETSTASHED
          </h1>
          <p className="text-2xl md:text-3xl text-ink-300 max-w-5xl mx-auto leading-relaxed mb-12 font-light">
            The ultimate social commerce platform where fashion meets community, creativity earns rewards, and every interaction builds your influence
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/buyer/marketplace" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
              EXPLORE MARKETPLACE
            </Link>
            <Link href="/signup" className="bg-gradient-to-r from-ink-800 to-ink-700 hover:from-ink-700 hover:to-ink-600 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-500/30">
              START SELLING
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-400 mb-2">50K+</div>
              <div className="text-ink-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-400 mb-2">1.2M+</div>
              <div className="text-ink-400">Products Sold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-400 mb-2">$2.8M</div>
              <div className="text-ink-400">Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-400 mb-2">98%</div>
              <div className="text-ink-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Showcase */}
      <section className="py-20 px-4 bg-gradient-to-r from-ink-900 to-ink-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">REVOLUTIONARY FEATURES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* AI Stylist */}
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl p-8 border border-blue-400/30 relative overflow-hidden group hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Stylist</h3>
                <p className="text-ink-300 mb-6">Get personalized style recommendations powered by advanced AI that learns your preferences</p>
                <Link href="/ai-stylist" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
                  Try AI Stylist
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Blockchain Rewards */}
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl p-8 border border-green-400/30 relative overflow-hidden group hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Blockchain Rewards</h3>
                <p className="text-ink-300 mb-6">Earn crypto rewards for shopping, challenges, and community engagement</p>
                <Link href="/blockchain-rewards" className="inline-flex items-center text-green-400 hover:text-green-300 font-medium">
                  View Rewards
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* AR Try-On */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-400/30 relative overflow-hidden group hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AR Try-On</h3>
                <p className="text-ink-300 mb-6">Virtual fitting room with augmented reality technology</p>
                <Link href="/ar-tryon" className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium">
                  Try AR
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Live Streaming */}
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-8 border border-red-400/30 relative overflow-hidden group hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Live Shows</h3>
                <p className="text-ink-300 mb-6">Watch live fashion shows and exclusive product drops</p>
                <Link href="/live-shows" className="inline-flex items-center text-red-400 hover:text-red-300 font-medium">
                  Watch Live
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* NFT Marketplace */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-8 border border-yellow-400/30 relative overflow-hidden group hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">NFT Collection</h3>
                <p className="text-ink-300 mb-6">Exclusive digital fashion NFTs and collectibles</p>
                <Link href="/nft-marketplace" className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium">
                  Browse NFTs
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Smart Contracts */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-8 border border-cyan-400/30 relative overflow-hidden group hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Contracts</h3>
                <p className="text-ink-300 mb-6">Automated escrow and secure payment processing</p>
                <Link href="/smart-contracts" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium">
                  Learn More
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="py-16 px-4 bg-ink-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">LIVE ACTIVITY</h2>
            <div className="flex items-center space-x-2">
              <span className="text-ink-400 text-sm">Real-time updates</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">LIVE</span>
              </div>
              <p className="text-white text-lg mb-2">StyleMaster just dropped 50 new pieces</p>
              <span className="text-ink-400 text-sm">2 minutes ago</span>
            </div>
            <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">AI</span>
              </div>
              <p className="text-white text-lg mb-2">AI Stylist generated 127 new outfit combinations</p>
              <span className="text-ink-400 text-sm">5 minutes ago</span>
            </div>
            <div className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-purple-400 text-sm font-medium">NFT</span>
              </div>
              <p className="text-white text-lg mb-2">New NFT collection minted: Streetwear Legends</p>
              <span className="text-ink-400 text-sm">8 minutes ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Super Dope Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">TRENDING PRODUCTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-ink-900 rounded-2xl overflow-hidden border border-ink-800 hover:border-brand-500 transition-all duration-500 group hover:scale-105 shadow-2xl">
                {/* Product Image */}
                <div className="relative h-80 bg-ink-800 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-ink-700 to-ink-800 flex items-center justify-center">
                    <svg className="w-24 h-24 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  {/* Trending Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-3 py-2 rounded-full text-sm font-bold">
                    TRENDING
                  </div>
                  
                  {/* Sale Badge */}
                  {product.originalPrice && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-full text-sm font-bold">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-8 space-y-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-ink-400">{product.storeName}</span>
                    <span className="text-xs bg-gradient-to-r from-brand-500 to-brand-600 text-white px-3 py-1 rounded-full font-bold">VERIFIED</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-brand-400 text-lg">
                          {i < Math.floor(product.rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-ink-400">({product.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-brand-400">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl text-ink-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href={`/buyer/marketplace?product=${product.id}`}
                    className="block w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link
              href="/buyer/marketplace"
              className="bg-gradient-to-r from-ink-800 to-ink-700 hover:from-ink-700 hover:to-ink-600 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-500/30"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stores - Premium Grid */}
      <section className="py-20 px-4 bg-gradient-to-r from-ink-900 to-ink-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">TOP STORES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredStores.map((store) => (
              <div key={store.id} className="bg-ink-800 rounded-2xl p-8 text-center hover:bg-ink-700 transition-all duration-500 group hover:scale-105 border border-ink-700 hover:border-brand-500/30">
                <div className="w-20 h-20 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{store.name}</h3>
                <p className="text-sm text-ink-400 mb-6 line-clamp-2">{store.description}</p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-brand-400 text-sm">
                        {i < Math.floor(store.rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-ink-400">({store.reviewCount})</span>
                </div>
                <div className="text-xs text-ink-400 mb-6">
                  <span className="text-brand-400">FAST DELIVERY</span> • Min ${store.minOrder}
                </div>
                <Link
                  href={`/buyer/marketplace?store=${store.id}`}
                  className="block w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all duration-300 transform hover:scale-105"
                >
                  SHOP STORE
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Super Dope */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-purple-500/20 to-ink-900"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-8">
            READY TO JOIN THE REVOLUTION?
          </h2>
          <p className="text-xl text-ink-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of fashion enthusiasts discovering unique styles, earning rewards, and building the future of social commerce
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
              GET STARTED NOW
            </Link>
            <Link href="/buyer/marketplace" className="bg-gradient-to-r from-ink-800 to-ink-700 hover:from-ink-700 hover:to-ink-600 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-500/30">
              EXPLORE MARKETPLACE
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-900 border-t border-ink-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <StreetStashedLogo size="lg" />
          <p className="text-ink-400 mt-6 text-lg">
            © 2024 StreetStashed. All rights reserved.
          </p>
          <p className="text-ink-500 mt-2 text-sm">
            The future of fashion commerce is here
          </p>
        </div>
      </footer>
    </div>
  )
}

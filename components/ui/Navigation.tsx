'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'

interface NavigationProps {
  userRole?: 'buyer' | 'seller' | 'stylist' | 'driver' | 'admin'
  isAuthenticated?: boolean
}

export function Navigation({ userRole, isAuthenticated = false }: NavigationProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const handleButtonClick = (action: string, path?: string) => {
    switch (action) {
      case 'marketplace':
        handleNavigation('/buyer/marketplace')
        break
      case 'dashboard':
        if (userRole === 'buyer') handleNavigation('/buyer/dashboard')
        else if (userRole === 'seller') handleNavigation('/seller/dashboard')
        else if (userRole === 'stylist') handleNavigation('/stylist/dashboard')
        else if (userRole === 'driver') handleNavigation('/driver-dashboard')
        else if (userRole === 'admin') handleNavigation('/admin')
        break
      case 'profile':
        handleNavigation('/profile')
        break
      case 'orders':
        handleNavigation('/buyer/orders')
        break
      case 'wishlist':
        handleNavigation('/buyer/wishlist')
        break
      case 'rewards':
        handleNavigation('/rewards')
        break
      case 'referrals':
        handleNavigation('/referrals')
        break
      case 'challenges':
        handleNavigation('/social/challenges')
        break
      case 'stylists':
        handleNavigation('/stylist/browse')
        break
      case 'book-session':
        handleNavigation('/stylist/book-session')
        break
      case 'view-collection':
        handleNavigation('/stylist/collections')
        break
      case 'join-challenge':
        handleNavigation('/social/challenges/join')
        break
      case 'start-shopping':
        handleNavigation('/buyer/marketplace')
        break
      case 'track-order':
        handleNavigation('/buyer/orders/track')
        break
      case 'review-order':
        handleNavigation('/buyer/orders/review')
        break
      case 'view-all-stylists':
        handleNavigation('/stylist/browse')
        break
      case 'view-all-challenges':
        handleNavigation('/social/challenges')
        break
      case 'view-all-orders':
        handleNavigation('/buyer/orders')
        break
      case 'custom':
        if (path) handleNavigation(path)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  return (
    <header className="bg-ink-900 border-b border-ink-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <StreetStashedLogo size="lg" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              <Link href="/buyer/marketplace" className="text-ink-300 hover:text-white transition-colors">
                Marketplace
              </Link>
              {userRole === 'buyer' && (
                <>
                  <Link href="/buyer/dashboard" className="text-ink-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/rewards" className="text-ink-300 hover:text-white transition-colors">
                    Rewards
                  </Link>
                </>
              )}
              {userRole === 'stylist' && (
                <Link href="/stylist/dashboard" className="text-ink-300 hover:text-white transition-colors">
                  Stylist Hub
                </Link>
              )}
              {userRole === 'seller' && (
                <Link href="/seller/dashboard" className="text-ink-300 hover:text-white transition-colors">
                  Seller Hub
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/buyer/marketplace" className="text-ink-300 hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/signup" className="text-ink-300 hover:text-white transition-colors">
                Sign Up
              </Link>
              <Link href="/login" className="text-ink-300 hover:text-white transition-colors">
                Sign In
              </Link>
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleButtonClick('dashboard')}
                className="bg-brand-500 hover:bg-brand-600 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleButtonClick('profile')}
                className="bg-ink-800 hover:bg-ink-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Profile
              </button>
            </div>
          ) : (
            <>
              <Link href="/buyer/marketplace" className="bg-brand-500 hover:bg-brand-600 px-6 py-3 rounded-lg font-medium transition-colors">
                Shop Now
              </Link>
              <Link href="/signup" className="bg-ink-800 hover:bg-ink-700 px-6 py-3 rounded-lg font-medium transition-colors">
                Start Selling
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-ink-800 border-t border-ink-700">
          <div className="px-4 py-2 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleButtonClick('dashboard')}
                  className="block w-full text-left px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleButtonClick('marketplace')}
                  className="block w-full text-left px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors"
                >
                  Marketplace
                </button>
                <button
                  onClick={() => handleButtonClick('profile')}
                  className="block w-full text-left px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors"
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <Link href="/buyer/marketplace" className="block px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors">
                  Marketplace
                </Link>
                <Link href="/signup" className="block px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors">
                  Sign Up
                </Link>
                <Link href="/login" className="block px-4 py-2 text-ink-300 hover:text-white hover:bg-ink-700 rounded-lg transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// Button component with built-in navigation
export function NavigationButton({ 
  action, 
  path, 
  children, 
  className = "", 
  ...props 
}: {
  action: string
  path?: string
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  const router = useRouter()

  const handleClick = () => {
    switch (action) {
      case 'marketplace':
        router.push('/buyer/marketplace')
        break
      case 'dashboard':
        router.push('/buyer/dashboard')
        break
      case 'orders':
        router.push('/buyer/orders')
        break
      case 'wishlist':
        router.push('/buyer/wishlist')
        break
      case 'rewards':
        router.push('/rewards')
        break
      case 'referrals':
        router.push('/referrals')
        break
      case 'challenges':
        router.push('/social/challenges')
        break
      case 'stylists':
        router.push('/stylist/browse')
        break
      case 'book-session':
        router.push('/stylist/book-session')
        break
      case 'view-collection':
        router.push('/stylist/collections')
        break
      case 'join-challenge':
        router.push('/social/challenges/join')
        break
      case 'start-shopping':
        router.push('/buyer/marketplace')
        break
      case 'track-order':
        router.push('/buyer/orders/track')
        break
      case 'review-order':
        router.push('/buyer/orders/review')
        break
      case 'view-all-stylists':
        router.push('/stylist/browse')
        break
      case 'view-all-challenges':
        router.push('/social/challenges')
        break
      case 'view-all-orders':
        router.push('/buyer/orders')
        break
      case 'custom':
        if (path) router.push(path)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

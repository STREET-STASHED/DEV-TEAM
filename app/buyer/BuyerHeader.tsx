'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingBagIcon, 
  UserIcon, 
  HomeIcon, 
  MagnifyingGlassIcon,
  HeartIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'

export function BuyerHeader() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Marketplace', href: '/buyer/marketplace', icon: ShoppingBagIcon },
    { name: 'Dashboard', href: '/buyer/dashboard', icon: UserIcon },
  ]

  return (
    <header className="bg-ink-black/90 backdrop-blur-md border-b border-ink-800 sticky top-0 z-40">
      <div className="container-premium">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <StreetStashedLogo href="/" size="md" variant="light" />
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="search-premium w-full relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 bg-transparent border-none outline-none text-sm text-white placeholder-ink-400"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400 hover:text-brand-500 transition-colors duration-200">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-400 border-b-2 border-brand-500'
                      : 'text-ink-300 hover:text-brand-400 hover:bg-ink-800/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <button className="p-2 text-ink-300 hover:text-brand-500 hover:bg-ink-800/50 rounded-xl transition-all duration-200">
              <HeartIcon className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-ink-300 hover:text-brand-500 hover:bg-ink-800/50 rounded-xl transition-all duration-200 relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <Link
              href="/buyer/dashboard"
              className="p-2 text-ink-300 hover:text-brand-500 hover:bg-ink-800/50 rounded-xl transition-all duration-200"
            >
              <UserIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-ink-800">
        <div className="px-4 py-2">
          <div className="search-premium mb-4">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-2 bg-transparent border-none outline-none text-sm text-white placeholder-ink-400"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400 hover:text-brand-500 transition-colors duration-200">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex items-center justify-around">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-ink-400 hover:text-brand-400'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

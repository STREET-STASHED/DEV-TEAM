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

export function BuyerHeader() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Marketplace', href: '/buyer/marketplace', icon: ShoppingBagIcon },
    { name: 'Dashboard', href: '/buyer/dashboard', icon: UserIcon },
  ]

  return (
    <header className="nav-premium">
      <div className="container-premium">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gradient">StreetStashed</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="search-premium w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 bg-transparent border-none outline-none text-sm"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors duration-200">
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
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
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
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200">
              <HeartIcon className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <Link
              href="/buyer/dashboard"
              className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
            >
              <UserIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-neutral-200">
        <div className="px-4 py-2">
          <div className="search-premium mb-4">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-3 bg-transparent border-none outline-none text-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors duration-200">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex justify-around">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}

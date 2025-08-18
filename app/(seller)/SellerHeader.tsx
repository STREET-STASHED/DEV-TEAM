'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingBagIcon, 
  UserIcon, 
  HomeIcon, 
  PlusIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

export function SellerHeader() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: HomeIcon },
    { name: 'Products', href: '/seller/upload', icon: ShoppingBagIcon },
    { name: 'Analytics', href: '/seller/analytics', icon: ChartBarIcon },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">StreetStashed</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <Link
              href="/seller/dashboard"
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}

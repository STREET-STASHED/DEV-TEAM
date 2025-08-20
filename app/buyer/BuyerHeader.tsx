'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingBagIcon, 
  UserIcon, 
  HomeIcon, 
  MagnifyingGlassIcon,
  HeartIcon,
  BellIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'
import { useWishlist } from '@/context/WishlistContext'
import { useNotifications } from '@/context/NotificationsContext'
import { useState, useRef, useEffect } from 'react'

export function BuyerHeader() {
  const pathname = usePathname()
  const { items: wishlistItems, totalCount: wishlistCount, isOpen: wishlistOpen, toggleWishlist, removeItem } = useWishlist()
  const { notifications, unreadCount, isOpen: notificationsOpen, toggleNotifications, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  
  const wishlistRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Marketplace', href: '/buyer/marketplace', icon: ShoppingBagIcon },
    { name: 'Dashboard', href: '/buyer/dashboard', icon: UserIcon },
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wishlistRef.current && !wishlistRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the toggle button
        if (!(event.target as Element).closest('[data-wishlist-toggle]')) {
          // Close wishlist dropdown
        }
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the toggle button
        if (!(event.target as Element).closest('[data-notifications-toggle]')) {
          // Close notifications dropdown
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update': return '📦'
      case 'price_drop': return '💰'
      case 'new_arrival': return '🆕'
      case 'sale': return '🏷️'
      default: return '🔔'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

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
            <div className="relative" ref={wishlistRef}>
              <button 
                data-wishlist-toggle
                onClick={toggleWishlist}
                className="p-2 text-ink-300 hover:text-brand-500 hover:bg-ink-800/50 rounded-xl transition-all duration-200 relative"
              >
                <HeartIcon className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full"></span>
                )}
              </button>

              {/* Wishlist Dropdown */}
              {wishlistOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-ink-900 rounded-xl shadow-2xl border border-ink-800 p-4 z-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Wishlist ({wishlistCount})</h3>
                    <button 
                      onClick={toggleWishlist}
                      className="text-ink-400 hover:text-white"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {wishlistCount === 0 ? (
                    <div className="text-center py-8">
                      <HeartIcon className="w-12 h-12 text-ink-500 mx-auto mb-3" />
                      <p className="text-ink-400 mb-2">Your wishlist is empty</p>
                      <p className="text-sm text-ink-500">Start adding items you love!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-ink-800 rounded-lg">
                          <div className="w-12 h-12 bg-ink-700 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🛍️</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-sm truncate">{item.name}</h4>
                            <p className="text-xs text-ink-400">{item.storeName}</p>
                            <p className="text-brand-400 font-semibold">${item.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-ink-400 hover:text-red-400 hover:bg-ink-700 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button 
                data-notifications-toggle
                onClick={toggleNotifications}
                className="p-2 text-ink-300 hover:text-brand-500 hover:bg-ink-800/50 rounded-xl transition-all duration-200 relative"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-ink-900 rounded-xl shadow-2xl border border-ink-800 p-4 z-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-brand-400 hover:text-brand-300"
                      >
                        Mark all read
                      </button>
                      <button 
                        onClick={toggleNotifications}
                        className="text-ink-400 hover:text-white"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <BellIcon className="w-12 h-12 text-ink-500 mx-auto mb-3" />
                      <p className="text-ink-400 mb-2">No notifications</p>
                      <p className="text-sm text-ink-500">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.read ? 'bg-ink-800' : 'bg-brand-500/20 border border-brand-500/30'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm ${notification.read ? 'text-ink-300' : 'text-white'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-xs ${notification.read ? 'text-ink-400' : 'text-ink-300'} mt-1`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-ink-500 mt-2">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="p-1 text-ink-400 hover:text-red-400 hover:bg-ink-700 rounded"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-brand-400'
                    : 'text-ink-400 hover:text-ink-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}

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
  TrashIcon,
  SparklesIcon,
  UserGroupIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { StreetStashedLogo } from '@/components/StreetStashedLogo'
import { useWishlist } from '@/context/WishlistContext'
import { useNotifications } from '@/context/NotificationsContext'
import { useRef, useEffect } from 'react'

export function BuyerHeader() {
  const pathname = usePathname()
  const { items: wishlistItems, totalCount: wishlistCount, isOpen: wishlistOpen, toggleWishlist, removeItem } = useWishlist()
  const { notifications, unreadCount, isOpen: notificationsOpen, toggleNotifications, markAsRead, markAllAsRead } = useNotifications()
  
  const wishlistRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Marketplace', href: '/buyer/marketplace', icon: ShoppingBagIcon },
    { name: 'Challenges', href: '/challenges', icon: TrophyIcon },
    { name: 'Stylists', href: '/stylists', icon: UserGroupIcon },
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
      case 'challenge':
        return <TrophyIcon className="w-5 h-5 text-yellow-500" />
      case 'stylist':
        return <UserGroupIcon className="w-5 h-5 text-purple-500" />
      case 'reward':
        return <SparklesIcon className="w-5 h-5 text-green-500" />
      default:
        return <BellIcon className="w-5 h-5 text-brand-500" />
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
    <header className="bg-black/90 backdrop-blur-md border-b border-ink-800 sticky top-0 z-40">
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
                placeholder="Search for products, stylists, or challenges..."
                className="w-full px-4 py-2 bg-transparent border-none outline-none text-sm text-white placeholder-ink-400"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400 hover:text-brand-500 transition-colors duration-200">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
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
            {/* Challenges Badge */}
            <Link
              href="/challenges"
              className="relative p-2 text-ink-300 hover:text-brand-400 transition-colors"
            >
              <TrophyIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                3
              </span>
            </Link>

            {/* Wishlist */}
            <div className="relative" ref={wishlistRef}>
              <button
                data-wishlist-toggle
                onClick={toggleWishlist}
                className="relative p-2 text-ink-300 hover:text-brand-400 transition-colors"
              >
                <HeartIcon className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Wishlist Dropdown */}
              {wishlistOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-ink-900 rounded-xl shadow-xl border border-ink-700 z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Wishlist</h3>
                      <button
                        onClick={toggleWishlist}
                        className="text-ink-400 hover:text-white transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-8">
                        <HeartIcon className="w-12 h-12 text-ink-600 mx-auto mb-3" />
                        <p className="text-ink-400">Your wishlist is empty</p>
                        <p className="text-ink-500 text-sm">Start adding items you love!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 bg-ink-800 rounded-lg">
                            <img
                              src={item.image_url || '/mock/default-product.jpg'}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                              <p className="text-brand-400 font-semibold text-sm">${item.price}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-ink-400 hover:text-red-400 transition-colors p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Chat */}
            <button className="relative p-2 text-ink-300 hover:text-brand-400 transition-colors">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                data-notifications-toggle
                onClick={toggleNotifications}
                className="relative p-2 text-ink-300 hover:text-brand-400 transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-ink-900 rounded-xl shadow-xl border border-ink-700 z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={markAllAsRead}
                          className="text-brand-400 hover:text-brand-300 text-sm font-medium"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={toggleNotifications}
                          className="text-ink-400 hover:text-white transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <BellIcon className="w-12 h-12 text-ink-600 mx-auto mb-3" />
                        <p className="text-ink-400">No notifications</p>
                        <p className="text-ink-500 text-sm">You&apos;re all caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg transition-colors ${
                              notification.read ? 'bg-ink-800' : 'bg-brand-500/10'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{notification.title}</p>
                                <p className="text-ink-300 text-xs mt-1">{notification.message}</p>
                                <p className="text-ink-400 text-xs mt-2">{formatTimeAgo(notification.created_at)}</p>
                              </div>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-brand-400 hover:text-brand-300 text-xs font-medium"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <Link
              href="/buyer/dashboard"
              className="p-2 text-ink-300 hover:text-brand-400 transition-colors"
            >
              <UserIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

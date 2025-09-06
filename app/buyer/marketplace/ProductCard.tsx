'use client'

import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  seller_id: string
  category: string
  created_at: string
  storeName?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState('')
  const { addItem, hasItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, hasItem: hasWishlistItem } = useWishlist()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    setIsAdding(true)
    setMessage('')

    try {
      // Check if already in cart
      if (hasItem(product.id)) {
        setMessage('Already in cart!')
        setTimeout(() => setMessage(''), 2000)
        return
      }

      // Add to cart using context
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url || '/mock/default-product.jpg',
        category: product.category,
      })
      
      setMessage('Added to cart!')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setMessage('Failed to add to cart')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsAdding(false)
    }
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (hasWishlistItem(product.id)) {
      removeFromWishlist(product.id)
      setMessage('Removed from wishlist')
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || '/mock/default-product.jpg',
        storeName: product.storeName || 'Unknown Store',
        category: product.category,
      })
      setMessage('Added to wishlist')
    }
    
    setTimeout(() => setMessage(''), 2000)
  }

  const isInWishlist = hasWishlistItem(product.id)

  return (
    <div className="bg-black rounded-3xl shadow-card border border-ink-800 hover:shadow-hover transition-all duration-500 hover:scale-[1.02] overflow-hidden relative group mx-auto w-full">
      {/* Product Image */}
      <div className="relative aspect-square bg-ink-900 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="img-premium w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full shadow-card transition-all duration-300 transform scale-0 group-hover:scale-100 focus-visible:shadow-ring ${
            isInWishlist 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
          }`}
        >
          {isInWishlist ? (
            <HeartSolidIcon className="w-5 h-5 mx-auto mt-2.5" />
          ) : (
            <HeartIcon className="w-5 h-5 mx-auto mt-2.5" />
          )}
        </button>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || hasItem(product.id)}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full shadow-card transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform scale-0 group-hover:scale-100 focus-visible:shadow-ring ${
            hasItem(product.id) 
              ? 'bg-success-500 text-white' 
              : 'bg-white/90 backdrop-blur-sm text-brand-600 hover:bg-brand-600 hover:text-white'
          }`}
        >
          {isAdding ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mx-auto mt-2.5"></div>
          ) : hasItem(product.id) ? (
            <svg className="w-5 h-5 mx-auto mt-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mx-auto mt-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-primary text-xs font-medium px-2 py-1">
            {product.category}
          </span>
        </div>

        {/* New Badge */}
        {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <div className="absolute top-3 left-3 ml-16">
            <span className="badge badge-success text-xs font-medium px-2 py-1">
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-brand-400 transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-ink-400 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-brand-600">
            ${product.price.toFixed(2)}
          </div>
          
          {message && (
            <div className={`text-sm px-3 py-1 rounded-full ${
              message.includes('Added') || message.includes('Already')
                ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                : message.includes('wishlist')
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'bg-error-500/20 text-error-400 border border-error-500/30'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

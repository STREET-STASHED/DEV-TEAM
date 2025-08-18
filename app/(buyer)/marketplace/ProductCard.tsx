'use client'

import { addToCart } from '@/app/actions/cart'
import { useState } from 'react'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  seller_id: string
  category: string
  created_at: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    setIsAdding(true)
    setMessage('')

    try {
      const result = await addToCart(product.id, 1)
      
      if (result.success) {
        setMessage('Added to cart!')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage(result.error || 'Failed to add to cart')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to add to cart')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="product-card-premium group">
      {/* Product Image */}
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="img-premium w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="absolute bottom-3 right-3 w-12 h-12 bg-white/90 backdrop-blur-sm text-primary-600 rounded-full shadow-lg hover:bg-primary-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform scale-0 group-hover:scale-100"
        >
          {isAdding ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mx-auto mt-2.5"></div>
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
          <div className="absolute top-3 right-3">
            <span className="badge badge-success text-xs font-medium px-2 py-1">
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
            {product.name}
          </h3>
          
          <p className="text-sm text-neutral-600 line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="price-premium">
              ${product.price.toFixed(2)}
            </span>
            <p className="text-xs text-neutral-500">Free shipping</p>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="rating-premium">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`star-premium ${star <= 4 ? 'filled' : ''}`}
                  fill={star <= 4 ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-neutral-500">(24)</span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`alert-premium ${
            message.includes('Added') 
              ? 'alert-success' 
              : 'alert-error'
          }`}>
            {message}
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none">
          <div className="absolute bottom-6 left-6 right-6">
            <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-300 transform translate-y-2 group-hover:translate-y-0">
              Quick View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

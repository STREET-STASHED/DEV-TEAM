'use client'

import { updateCartQuantity, removeFromCart } from '@/app/actions/cart'
import { useState } from 'react'

type CartItemType = {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image_url: string
  }
}

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === quantity) return
    
    setIsUpdating(true)
    try {
      const result = await updateCartQuantity(item.id, newQuantity)
      if (result.success) {
        setQuantity(newQuantity)
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      await removeFromCart(item.id)
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-300">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <h4 className="text-sm font-semibold text-neutral-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-sm font-medium text-primary-600">
          ${item.price.toFixed(2)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end space-y-2">
        <div className="quantity-premium">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isUpdating || quantity <= 1}
            className="quantity-btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-sm font-medium w-8 text-center">
            {isUpdating ? '...' : quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isUpdating}
            className="quantity-btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-error-500 hover:text-error-700 disabled:opacity-50 p-1 rounded-lg hover:bg-error-50 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

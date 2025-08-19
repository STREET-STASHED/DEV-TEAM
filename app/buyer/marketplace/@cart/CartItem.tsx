'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'

type CartItemType = {
  id: string
  name: string
  price: number
  quantity: number
  image_url: string
  category?: string
  delivery_tier?: string
}

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === item.quantity) return
    
    setIsUpdating(true)
    try {
      updateQuantity(item.id, newQuantity)
    } catch (error) {
      console.error('CartItem: Failed to update quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      removeItem(item.id)
    } catch (error) {
      console.error('CartItem: Failed to remove item:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-start space-x-4 p-4 bg-ink-900 rounded-xl border border-ink-800 hover:border-ink-700 transition-all duration-300">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-ink-800 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <h4 className="text-sm font-semibold text-white truncate">
          {item.name}
        </h4>
        <p className="text-sm font-medium text-brand-600">
          ${item.price.toFixed(2)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="w-8 h-8 rounded-lg border border-ink-600 bg-ink-800 text-ink-300 hover:bg-ink-700 hover:scale-110 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            title="Decrease quantity"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-sm font-medium w-8 text-center text-white">
            {isUpdating ? '...' : item.quantity}
          </span>
          
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            className="w-8 h-8 rounded-lg border border-ink-600 bg-ink-800 text-ink-300 hover:bg-ink-700 hover:scale-110 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            title="Increase quantity"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-xs text-ink-400 hover:text-error-400 hover:bg-ink-800/50 px-2 py-1 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          title="Remove item"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

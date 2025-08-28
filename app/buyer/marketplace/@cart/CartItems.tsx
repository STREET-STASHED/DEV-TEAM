'use client'

import { useCart } from '@/context/CartContext'
import { computeStashedSupportFee } from '@/lib/feeConfig'
import { useRouter } from 'next/navigation'
import { CartItem } from './CartItem'

export function CartItems() {
  const { items, totalCount, totalPrice, totalAmount } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    if (items.length === 0) return
    router.push('/buyer/checkout')
  }

  const handleContinue = () => {
    router.push('/buyer/marketplace')
  }

  // Calculate Stashed Support Fee using the new comprehensive structure
  const defaultDistanceMiles = 8.0 // Default distance for cart preview
  const currentHour = new Date().getHours()

  const feeBreakdown = items.length > 0 ? computeStashedSupportFee({
    distanceMiles: defaultDistanceMiles,
    cartSubtotal: totalPrice,
    localHour: currentHour
  }) : null

  const stashedSupportFee = feeBreakdown?.buyer || 0

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ink-200 mb-2">Your cart is empty</h3>
        <p className="text-ink-400">Add some products to get started!</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleContinue}
            className="px-4 py-2 rounded-lg bg-brand-600 text-ink-black hover:bg-brand-500 focus-visible:shadow-ring shadow-card transition"
          >
            Browse products
          </button>
        </div>
      </div>
    )
  }

  const itemCount = totalCount

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-ink-700 pt-6 space-y-4">
        {/* Item Count */}
        <div className="flex items-center justify-between text-sm text-ink-400">
          <span>Items ({itemCount})</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>

        {/* Stashed Support Fee */}
        <div className="flex items-center justify-between text-sm text-ink-400">
          <span>Stashed Support Fee</span>
          <span className="text-brand-400 font-medium">${stashedSupportFee.toFixed(2)}</span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between text-lg font-bold text-white pt-2 border-t border-ink-700">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="w-full bg-brand-600 text-ink-black hover:bg-brand-500 focus:ring-brand-400 shadow-card hover:shadow-hover transform hover:scale-105 transition-all duration-300 py-4 rounded-xl text-lg font-semibold focus-visible:shadow-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>

        {/* Continue Shopping */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full text-ink-300 hover:text-brand-400 hover:bg-ink-800/50 focus:ring-brand-400 py-3 rounded-xl text-sm font-medium transition-all duration-200"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

import { Suspense } from 'react'
import { CartItems } from './CartItems'
import { CartSkeleton } from './CartSkeleton'

export function CartSidebar() {
  return (
    <div className="cart-premium p-6 sticky top-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">
            Shopping Cart
          </h2>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
        </div>
        
        {/* Cart Items */}
        <Suspense fallback={<CartSkeleton />}>
          <CartItems />
        </Suspense>
      </div>
    </div>
  )
}

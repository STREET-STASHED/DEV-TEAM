import { supabase } from '@/lib/supabase/client'
import { CartItem } from './CartItem'

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

async function getCartItems(): Promise<CartItemType[]> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      price,
      product:products (
        id,
        name,
        image_url
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching cart items:', error)
    return []
  }

  return data || []
}

export async function CartItems() {
  const cartItems = await getCartItems()

  if (cartItems.length === 0) {
    return (
      <div className="empty-premium">
        <div className="empty-icon-premium">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </div>
        <h3 className="empty-title-premium">Your cart is empty</h3>
        <p className="empty-description-premium">Add some products to get started!</p>
      </div>
    )
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-neutral-200 pt-6 space-y-4">
        {/* Item Count */}
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>Items ({itemCount})</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>Shipping</span>
          <span className="text-success-600 font-medium">Free</span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-200">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        <button className="w-full btn-primary py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          Proceed to Checkout
        </button>

        {/* Continue Shopping */}
        <button className="w-full btn-ghost py-3 rounded-xl text-sm font-medium">
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

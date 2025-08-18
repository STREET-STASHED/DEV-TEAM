'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase/client'

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'User not authenticated' }
    }

    // Validate product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return { error: 'Product not found' }
    }

    if (product.stock < quantity) {
      return { error: 'Insufficient stock' }
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      // Update existing item
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)

      if (error) {
        return { error: 'Failed to update cart' }
      }
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          price: product.price
        })

      if (error) {
        return { error: 'Failed to add to cart' }
      }
    }

    revalidatePath('/buyer/marketplace')
    revalidatePath('/buyer/dashboard')
    
    return { success: true, message: 'Added to cart' }
  } catch (error) {
    console.error('Add to cart error:', error)
    return { error: 'Failed to add to cart' }
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.id)

    if (error) {
      return { error: 'Failed to remove from cart' }
    }

    revalidatePath('/buyer/marketplace')
    revalidatePath('/buyer/dashboard')
    
    return { success: true, message: 'Removed from cart' }
  } catch (error) {
    console.error('Remove from cart error:', error)
    return { error: 'Failed to remove from cart' }
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'User not authenticated' }
    }

    if (quantity <= 0) {
      return removeFromCart(cartItemId)
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', user.id)

    if (error) {
      return { error: 'Failed to update cart' }
    }

    revalidatePath('/buyer/marketplace')
    revalidatePath('/buyer/dashboard')
    
    return { success: true, message: 'Cart updated' }
  } catch (error) {
    console.error('Update cart error:', error)
    return { error: 'Failed to update cart' }
  }
}

export async function clearCart() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return { error: 'Failed to clear cart' }
    }

    revalidatePath('/buyer/marketplace')
    revalidatePath('/buyer/dashboard')
    
    return { success: true, message: 'Cart cleared' }
  } catch (error) {
    console.error('Clear cart error:', error)
    return { error: 'Failed to clear cart' }
  }
}

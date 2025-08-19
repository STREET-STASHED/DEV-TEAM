	'use server'

	import { revalidatePath } from 'next/cache'
	import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'User not authenticated' }
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('id', productId)
      .single()

    if (existingItem) {
      // Update existing item
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)

      if (error) {
        console.error('Update cart error:', error)
        return { error: 'Failed to update cart' }
      }
    } else {
      // Look up the item details from items table
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('id,name,price,image,category,active')
        .eq('id', productId)
        .single()

      if (itemError || !item) {
        console.error('Fetch item error:', itemError)
        return { error: 'Item not found' }
      }

      if (item.active === false) {
        return { error: 'Item is not available' }
      }

      // Add new item with real details
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          id: item.id,
          quantity,
          price: item.price ?? 0,
          name: item.name ?? 'Product',
          image: item.image ?? '',
          category: item.category ?? 'General'
        })

      if (error) {
        console.error('Add to cart error:', error)
        return { error: 'Failed to add to cart' }
      }
    }

    revalidatePath('/marketplace')
    revalidatePath('/dashboard')
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
      console.error('Remove from cart error:', error)
      return { error: 'Failed to remove from cart' }
    }

    revalidatePath('/marketplace')
    revalidatePath('/dashboard')
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
      console.error('Update cart quantity error:', error)
      return { error: 'Failed to update quantity' }
    }

    revalidatePath('/marketplace')
    revalidatePath('/dashboard')
    return { success: true, message: 'Quantity updated' }
  } catch (error) {
    console.error('Update cart quantity error:', error)
    return { error: 'Failed to update quantity' }
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
      console.error('Clear cart error:', error)
      return { error: 'Failed to clear cart' }
    }

    revalidatePath('/marketplace')
    revalidatePath('/dashboard')
    return { success: true, message: 'Cart cleared' }
  } catch (error) {
    console.error('Clear cart error:', error)
    return { error: 'Failed to clear cart' }
  }
}

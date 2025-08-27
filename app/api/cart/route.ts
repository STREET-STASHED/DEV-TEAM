export const runtime = 'nodejs';
import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';




export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's shopping cart with item details
    const { data: cartItems, error: cartError } = await (supabase as any)
      .from('cart_items')
      .select(`
        *,
        items (
          id,
          name,
          price,
          category,
          seller_id,
          profiles!items_seller_id_fkey (
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', session.user.id)

    if (cartError) {
      return NextResponse.json(
        { error: 'Failed to fetch cart', details: cartError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      cart: cartItems || []
    })

  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { itemId, quantity = 1 } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const { data: existingItem } = await (supabase as any)
      .from('cart_items')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('item_id', itemId)
      .maybeSingle()

    if (existingItem) {
      // Update quantity
      const { data, error } = await (supabase as any)
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select('*')
      if (error) {
        return NextResponse.json(
          { error: 'Failed to update cart', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully',
        item: data[0]
      })
    } else {
      // Add new item to cart
      const { data, error } = await (supabase as any)
        .from('cart_items')
        .insert({
          user_id: session.user.id,
          item_id: itemId,
          quantity: quantity
        })
        .select('*')
      if (error) {
        return NextResponse.json(
          { error: 'Failed to add item to cart', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Item added to cart successfully',
        item: data[0]
      })
    }

  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { itemId, quantity } = await request.json()

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      // Remove item from cart
      const { error } = await (supabase as any)
        .from('cart_items')
        .delete()
        .eq('user_id', session.user.id)
        .eq('item_id', itemId)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to remove item from cart', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart successfully'
      })
    } else {
      // Update quantity
      const { data, error } = await (supabase as any)
        .from('cart_items')
        .update({ quantity: quantity })
        .eq('user_id', session.user.id)
        .eq('item_id', itemId)
        .select('*')
      if (error) {
        return NextResponse.json(
          { error: 'Failed to update cart', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully',
        item: data[0]
      })
    }

  } catch (error) {
    console.error('Update cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Remove item from cart
    const { error } = await (supabase as any)
      .from('cart_items')
      .delete()
      .eq('user_id', session.user.id)
      .eq('item_id', itemId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove item from cart', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    })

  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

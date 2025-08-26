import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler'
import { cookies } from 'next/headers'

async function createSupabaseClient() {
  return createRouteHandlerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
    return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, _options }) => cookieStore.set(name, value, _options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

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
    const { data: cartItems, error: cartError } = await supabase
      supabase.from('shopping_cart')
      .select(`
        *,
        items (
          id,
          name,
          price,
          image,
          category,
          colors,
          sizes,
          rating,
          store
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
    const { data: existingItem } = await supabase
      supabase.from('shopping_cart')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('item_id', itemId)
      .single()

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        supabase.from('shopping_cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()

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
      const { data, error } = await supabase
        supabase.from('shopping_cart')
        .insert({
          user_id: session.user.id,
          item_id: itemId,
          quantity: quantity
        })
        .select()

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
      const { error } = await supabase
        supabase.from('shopping_cart')
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
      const { data, error } = await supabase
        supabase.from('shopping_cart')
        .update({ quantity: quantity })
        .eq('user_id', session.user.id)
        .eq('item_id', itemId)
        .select()

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
    const { error } = await supabase
      supabase.from('shopping_cart')
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

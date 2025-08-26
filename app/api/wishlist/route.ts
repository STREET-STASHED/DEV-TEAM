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

    // Get the user's wishlist with item details
    const { data: wishlistItems, error: wishlistError } = await supabase
      supabase.from('wishlist')
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

    if (wishlistError) {
      return NextResponse.json(
        { error: 'Failed to fetch wishlist', details: wishlistError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      wishlist: wishlistItems || []
    })

  } catch (error) {
    console.error('Get wishlist error:', error)
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

    const { itemId } = await request.json()
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Check if item already exists in wishlist
    const { data: existingItem } = await supabase
      supabase.from('wishlist')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('item_id', itemId)
      .single()

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      )
    }

    // Add item to wishlist
    const { data, error } = await supabase
      supabase.from('wishlist')
      .insert({
        user_id: session.user.id,
        item_id: itemId
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add item to wishlist', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to wishlist successfully',
      item: data[0]
    })

  } catch (error) {
    console.error('Add to wishlist error:', error)
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

    // Remove item from wishlist
    const { error } = await supabase
      supabase.from('wishlist')
      .delete()
      .eq('user_id', session.user.id)
      .eq('item_id', itemId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove item from wishlist', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    })

  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

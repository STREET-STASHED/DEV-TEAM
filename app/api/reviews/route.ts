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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Return mock data for now to get the API working
    const mockReviews = [
      {
        id: '1',
        item_id: itemId,
        user_id: 'user-1',
        rating: 5,
        comment: 'Amazing quality! Exactly as described.',
        created_at: '2024-08-20T10:00:00Z',
        profiles: {
          username: 'fashionista123',
          full_name: 'Sarah Johnson',
          avatar_url: 'https://picsum.photos/100/100?random=1'
        }
      },
      {
        id: '2',
        item_id: itemId,
        user_id: 'user-2',
        rating: 4,
        comment: 'Great item, fast shipping. Would recommend!',
        created_at: '2024-08-19T15:30:00Z',
        profiles: {
          username: 'streetwear_lover',
          full_name: 'Mike Chen',
          avatar_url: 'https://picsum.photos/100/100?random=2'
        }
      },
      {
        id: '3',
        item_id: itemId,
        user_id: 'user-3',
        rating: 5,
        comment: 'Perfect fit and excellent condition. Love it!',
        created_at: '2024-08-18T12:15:00Z',
        profiles: {
          username: 'trend_setter',
          full_name: 'Alex Rodriguez',
          avatar_url: 'https://picsum.photos/100/100?random=3'
        }
      }
    ]

    return NextResponse.json({
      reviews: mockReviews
    })

  } catch (error) {
    console.error('Get reviews error:', error)
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

    const reviewData = await request.json()
    
    // Validate required fields
    if (!reviewData.itemId || !reviewData.rating) {
      return NextResponse.json(
        { error: 'Item ID and rating are required' },
        { status: 400 }
      )
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this item
    const { data: existingReview } = await supabase
      supabase.from('user_reviews')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('item_id', reviewData.itemId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this item' },
        { status: 400 }
      )
    }

    // Create the review
    const { data, error } = await supabase
      supabase.from('user_reviews')
      .insert({
        user_id: session.user.id,
        item_id: reviewData.itemId,
        rating: reviewData.rating,
        review_text: reviewData.reviewText || null
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create review', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      review: data[0]
    })

  } catch (error) {
    console.error('Create review error:', error)
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

    const { reviewId, rating, reviewText } = await request.json()
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Update the review
    const { data, error } = await supabase
      supabase.from('user_reviews')
      .update({
        rating: rating || undefined,
        review_text: reviewText || undefined
      })
      .eq('id', reviewId)
      .eq('user_id', session.user.id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update review', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: data[0]
    })

  } catch (error) {
    console.error('Update review error:', error)
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
    const reviewId = searchParams.get('reviewId')
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    // Delete the review
    const { error } = await supabase
      supabase.from('user_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', session.user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete review', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

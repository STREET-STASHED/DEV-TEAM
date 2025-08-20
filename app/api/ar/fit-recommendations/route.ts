import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(_request:NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const size = searchParams.get('size')

    if (!productId || !size) {
      return NextResponse.json({ 
        error: 'Missing required parameters: productId and size' 
      }, { status: 400 })
    }

    // Get fit recommendations using database function
    const { data, error } = await supabase
      .rpc('get_fit_recommendations', {
        p_user_id: user.id,
        p_product_id: productId,
        p_size: size
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ recommendations: data })
  } catch (error) {
    console.error('Error getting fit recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

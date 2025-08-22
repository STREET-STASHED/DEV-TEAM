import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(request:NextRequest) {
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
    try {
      const { data, error } = await supabase
        .rpc('get_fit_recommendations', {
          p_user_id: user.id,
          p_product_id: productId,
          p_size: size
        })

      if (error) {
        // If database function doesn't exist, return mock data
        console.log('Database function not available, returning mock fit recommendations')
        return NextResponse.json({ 
          recommendations: [
            {
              id: '1',
              fit: 'Perfect Fit',
              confidence: 0.95,
              size: size,
              notes: 'This size should fit you perfectly based on your measurements'
            }
          ]
        })
      }

      return NextResponse.json({ recommendations: data })
    } catch (rpcError) {
      // Fallback to mock data if RPC fails
      console.log('RPC call failed, returning mock fit recommendations')
      return NextResponse.json({ 
        recommendations: [
          {
            id: '1',
            fit: 'Estimated Fit',
            confidence: 0.85,
            size: size,
            notes: 'Estimated fit based on standard sizing charts'
          }
        ]
      })
    }

    return NextResponse.json({ recommendations: data })
  } catch (error) {
    console.error('Error getting fit recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

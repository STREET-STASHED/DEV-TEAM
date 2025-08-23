import { NextRequest, NextResponse } from 'next/server'

export async function GET(request:NextRequest) {
  try {
    // Check for test authentication header
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader && authHeader.startsWith('Bearer test-token-')) {
      // Test user authentication
      const token = authHeader.replace('Bearer ', '')
      if (token.includes('buyer')) {
        user = { id: 'test-buyer-1', role: 'buyer' }
      } else if (token.includes('stylist')) {
        user = { id: 'test-stylist-1', role: 'stylist' }
      } else if (token.includes('driver')) {
        user = { id: 'test-driver-1', role: 'driver' }
      }
    }

    if (!user) {
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

    // Return mock fit recommendations for test users
    return NextResponse.json({ 
      recommendations: [
        {
          id: '1',
          fit: 'Perfect Fit',
          confidence: 0.95,
          size: size,
          notes: 'This size should fit you perfectly based on your measurements'
        },
        {
          id: '2',
          fit: 'Estimated Fit',
          confidence: 0.85,
          size: size,
          notes: 'Estimated fit based on standard sizing charts'
        }
      ]
    })
  } catch (error) {
    console.error('Error getting fit recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

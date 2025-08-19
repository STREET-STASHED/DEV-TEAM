import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Parse request body (required for API route)
    await request.json()
    
    // Mock order creation for demo purposes
    // In production, this would save to database
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return NextResponse.json({ 
      orderId,
      success: true,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Parse request body (required for API route)
    await request.json()
    
    // Mock distance calculation for demo purposes
    // In production, this would use Google Maps Distance Matrix API
    const mockDistanceMiles = Math.random() * 15 + 2 // 2-17 miles
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return NextResponse.json({ 
      distanceMiles: mockDistanceMiles,
      minutes: Math.round(mockDistanceMiles * 3) // Rough ETA estimate
    })
  } catch (error) {
    console.error('Distance calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate distance' }, { status: 500 })
  }
}

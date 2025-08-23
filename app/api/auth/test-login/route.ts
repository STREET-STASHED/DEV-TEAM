import { NextRequest, NextResponse } from 'next/server'

// Test user data for development
const TEST_USERS = {
  'buyer@test.com': {
    id: 'test-buyer-1',
    email: 'buyer@test.com',
    role: 'buyer',
    profile: {
      name: 'Test Buyer',
      avatar: '/mock/avatar-buyer.jpg',
      preferences: ['streetwear', 'sneakers'],
      measurements: {
        height: 175,
        weight: 70,
        chest: 95,
        waist: 80,
        inseam: 80
      }
    }
  },
  'stylist@test.com': {
    id: 'test-stylist-1',
    email: 'stylist@test.com',
    role: 'stylist',
    profile: {
      name: 'Test Stylist',
      avatar: '/mock/avatar-stylist.jpg',
      specialties: ['streetwear', 'luxury'],
      rating: 4.8,
      clients: 24
    }
  },
  'driver@test.com': {
    id: 'test-driver-1',
    email: 'driver@test.com',
    role: 'driver',
    profile: {
      name: 'Test Driver',
      avatar: '/mock/avatar-driver.jpg',
      vehicle: 'Honda Civic',
      rating: 4.9,
      deliveries: 156
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Simple test authentication
    if (password === 'test123' && TEST_USERS[email as keyof typeof TEST_USERS]) {
      const user = TEST_USERS[email as keyof typeof TEST_USERS]
      
      // Create a mock session
      const session = {
        access_token: `test-token-${user.id}`,
        refresh_token: `test-refresh-${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
      
      return NextResponse.json({
        success: true,
        session,
        user: user.profile
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
      } catch (_error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test authentication endpoint',
    availableUsers: Object.keys(TEST_USERS),
    defaultPassword: 'test123'
  })
}

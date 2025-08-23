import { NextResponse } from 'next/server'

export async function GET(_request: Request) {
  try {
    // In a real implementation, you would fetch actual challenge data from the database
    // For now, we'll return mock data that can be easily replaced with real data
    
    const challenges = [
      {
        id: '1',
        title: 'Style Transformation Challenge',
        description: 'Transform 5 clients with complete style makeovers',
        participants: 47,
        deadline: '2024-02-15',
        prizePool: 2500,
        status: 'active',
        category: 'Transformation',
        isJoined: true
      },
      {
        id: '2',
        title: 'Client Satisfaction Master',
        description: 'Achieve 100% client satisfaction for 30 days',
        participants: 23,
        deadline: '2024-01-31',
        prizePool: 1500,
        status: 'active',
        category: 'Quality',
        isJoined: false
      },
      {
        id: '3',
        title: 'Social Media Influencer',
        description: 'Grow social media following by 1000+ followers',
        participants: 89,
        deadline: '2024-03-01',
        prizePool: 3000,
        status: 'upcoming',
        category: 'Marketing',
        isJoined: false
      }
    ]
    
    return NextResponse.json({ challenges })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

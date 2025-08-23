import { NextResponse } from 'next/server'

export async function GET(_request: Request) {
  try {
    // In a real implementation, you would fetch actual client data from the database
    // For now, we'll return mock data that can be easily replaced with real data
    
    const clients = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '/mock/avatar1.jpg',
        lastSession: '2024-01-15',
        nextSession: '2024-01-22',
        totalSpent: 450.00,
        rating: 5,
        status: 'active'
      },
      {
        id: '2',
        name: 'Michael Chen',
        avatar: '/mock/avatar2.jpg',
        lastSession: '2024-01-14',
        nextSession: '2024-01-21',
        totalSpent: 320.00,
        rating: 4,
        status: 'active'
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        avatar: '/mock/avatar3.jpg',
        lastSession: '2024-01-13',
        nextSession: '2024-01-20',
        totalSpent: 680.00,
        rating: 5,
        status: 'active'
      },
      {
        id: '4',
        name: 'David Kim',
        avatar: '/mock/avatar4.jpg',
        lastSession: '2024-01-12',
        nextSession: '2024-01-19',
        totalSpent: 240.00,
        rating: 4,
        status: 'new'
      },
      {
        id: '5',
        name: 'Lisa Thompson',
        avatar: '/mock/avatar5.jpg',
        lastSession: '2024-01-10',
        nextSession: '2024-01-17',
        totalSpent: 890.00,
        rating: 5,
        status: 'active'
      }
    ]
    
    return NextResponse.json({ clients })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

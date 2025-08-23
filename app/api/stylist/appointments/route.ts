import { NextResponse } from 'next/server'

export async function GET(_request: Request) {
  try {
    // In a real implementation, you would fetch actual appointment data from the database
    // For now, we'll return mock data that can be easily replaced with real data
    
    const appointments = [
      {
        id: '1',
        clientName: 'Sarah Johnson',
        clientAvatar: '/mock/avatar1.jpg',
        date: '2024-01-22',
        time: '10:00 AM',
        duration: 60,
        type: 'Style Consultation',
        status: 'confirmed',
        notes: 'Focus on professional wardrobe update'
      },
      {
        id: '2',
        clientName: 'Michael Chen',
        clientAvatar: '/mock/avatar2.jpg',
        date: '2024-01-21',
        time: '2:00 PM',
        duration: 90,
        type: 'Full Wardrobe Review',
        status: 'confirmed',
        notes: 'Preparing for job interview'
      },
      {
        id: '3',
        clientName: 'Emma Rodriguez',
        clientAvatar: '/mock/avatar3.jpg',
        date: '2024-01-20',
        time: '11:00 AM',
        duration: 60,
        type: 'Style Consultation',
        status: 'pending',
        notes: 'New client - first session'
      },
      {
        id: '4',
        clientName: 'David Kim',
        clientAvatar: '/mock/avatar4.jpg',
        date: '2024-01-19',
        time: '3:00 PM',
        duration: 45,
        type: 'Quick Style Update',
        status: 'confirmed',
        notes: 'Follow-up session'
      },
      {
        id: '5',
        clientName: 'Lisa Thompson',
        clientAvatar: '/mock/avatar5.jpg',
        date: '2024-01-17',
        time: '1:00 PM',
        duration: 75,
        type: 'Special Occasion Styling',
        status: 'confirmed',
        notes: 'Wedding guest outfit'
      }
    ]
    
    return NextResponse.json({ appointments })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    // In a real implementation, you would fetch actual leaderboard data from the database
    // For now, we'll return mock data that can be easily replaced with real data
    
    const leaderboard = [
      { rank: 1, username: 'StyleMaster', points: 2847, avatar: '/mock/avatar1.jpg', isCurrentUser: false },
      { rank: 2, username: 'FashionForward', points: 2156, avatar: '/mock/avatar2.jpg', isCurrentUser: false },
      { rank: 3, username: 'UrbanTrendsetter', points: 1892, avatar: '/mock/avatar3.jpg', isCurrentUser: false },
      { rank: 4, username: 'You', points: 1250, avatar: '/mock/current-user.jpg', isCurrentUser: true },
      { rank: 5, username: 'StreetwearKing', points: 1187, avatar: '/mock/avatar4.jpg', isCurrentUser: false },
      { rank: 6, username: 'Fashionista', points: 1056, avatar: '/mock/avatar5.jpg', isCurrentUser: false },
      { rank: 7, username: 'StyleGuru', points: 987, avatar: '/mock/avatar6.jpg', isCurrentUser: false },
      { rank: 8, username: 'TrendHunter', points: 876, avatar: '/mock/avatar7.jpg', isCurrentUser: false },
      { rank: 9, username: 'FashionExplorer', points: 765, avatar: '/mock/avatar8.jpg', isCurrentUser: false },
      { rank: 10, username: 'StyleSeeker', points: 654, avatar: '/mock/avatar9.jpg', isCurrentUser: false }
    ]
    
    return NextResponse.json({ leaderboard })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

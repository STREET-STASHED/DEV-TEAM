import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    // In a real implementation, you would fetch actual rewards data from the database
    // For now, we'll return mock data that can be easily replaced with real data
    
    const rewards = [
      {
        id: '1',
        name: 'First Purchase',
        description: 'Earn points for your first purchase on StreetStashed',
        points: 100,
        tokens: 10,
        status: 'available',
        expiresAt: '2024-12-31',
        category: 'shopping',
        requirements: ['Make first purchase'],
        progress: 0,
        icon: '🛍️'
      },
      {
        id: '2',
        name: 'Style Challenge Winner',
        description: 'Win the monthly style challenge and earn bonus rewards',
        points: 500,
        tokens: 50,
        status: 'locked',
        expiresAt: '2024-11-30',
        category: 'challenge',
        requirements: ['Participate in challenge', 'Win challenge'],
        progress: 0,
        icon: '🏆'
      },
      {
        id: '3',
        name: 'Referral Master',
        description: 'Invite friends and earn rewards for each successful referral',
        points: 250,
        tokens: 25,
        status: 'available',
        expiresAt: '2024-12-31',
        category: 'referral',
        requirements: ['Invite 3 friends'],
        progress: 0,
        icon: '👥'
      },
      {
        id: '4',
        name: 'Daily Streak',
        description: 'Visit the app daily for 7 consecutive days',
        points: 150,
        tokens: 15,
        status: 'locked',
        expiresAt: '2024-12-31',
        category: 'engagement',
        requirements: ['Visit app daily', 'Complete 7 days'],
        progress: 0,
        icon: '🔥'
      },
      {
        id: '5',
        name: 'Review Contributor',
        description: 'Write helpful product reviews and earn community points',
        points: 75,
        tokens: 8,
        status: 'available',
        expiresAt: '2024-12-31',
        category: 'community',
        requirements: ['Write 5 reviews'],
        progress: 0,
        icon: '✍️'
      },
      {
        id: '6',
        name: 'Social Media Star',
        description: 'Share your style on social media and tag StreetStashed',
        points: 200,
        tokens: 20,
        status: 'available',
        expiresAt: '2024-12-31',
        category: 'social',
        requirements: ['Share on Instagram', 'Tag @streetstashed'],
        progress: 0,
        icon: '📱'
      }
    ]
    
    return NextResponse.json({ rewards })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

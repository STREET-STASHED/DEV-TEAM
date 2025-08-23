'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  StarIcon, 
  GiftIcon, 
  TrophyIcon, 
  FireIcon,
  BoltIcon,
  SparklesIcon,
  UserGroupIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

interface Reward {
  id: string
  name: string
  description: string
  points: number
  tokens: number
  status: 'available' | 'claimed' | 'locked'
  expiresAt: string
  category: string
  requirements: string[]
  progress?: number
  icon: string
}

interface UserStats {
  totalPoints: number
  memberLevel: string
  nextLevelPoints: number
  currentLevelPoints: number
  totalRewards: number
  streakDays: number
  referralCount: number
  totalSpent: number
}

interface LeaderboardEntry {
  rank: number
  username: string
  points: number
  avatar: string
  isCurrentUser: boolean
}

export default function RewardsPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('rewards')
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMockRewards = () => {
    const mockRewards: Reward[] = [
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
        name: 'Social Butterfly',
        description: 'Share 5 items on social media',
        points: 50,
        tokens: 5,
        status: 'locked',
        expiresAt: '2024-12-31',
        category: 'social',
        requirements: ['Share 5 items'],
        progress: 0,
        icon: '🦋'
      },
      {
        id: '3',
        name: 'Review Master',
        description: 'Write 10 product reviews',
        points: 200,
        tokens: 20,
        status: 'locked',
        expiresAt: '2024-12-31',
        category: 'engagement',
        requirements: ['Write 10 reviews'],
        progress: 0,
        icon: '✍️'
      }
    ]
    setRewards(mockRewards)
  }

  const loadMockUserStats = () => {
    const mockStats: UserStats = {
      totalPoints: 1250,
      memberLevel: 'Gold',
      nextLevelPoints: 2000,
      currentLevelPoints: 1250,
      totalRewards: 8,
      streakDays: 5,
      referralCount: 3,
      totalSpent: 450.00
    }
    setUserStats(mockStats)
  }

  const loadMockLeaderboard = () => {
    const mockLeaderboard: LeaderboardEntry[] = [
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
    setLeaderboard(mockLeaderboard)
  }

  const loadRewards = useCallback(async () => {
    try {
      // Try to load from real API first
      const response = await fetch('/api/rewards')
      if (response.ok) {
        const data = await response.json()
        setRewards(data.rewards || [])
      } else {
        throw new Error('Failed to load rewards')
      }
    } catch (error) {
      console.error('Error loading rewards:', error)
      // Fallback to mock data
      loadMockRewards()
    }
  }, [])

  const loadUserStats = useCallback(async () => {
    try {
      // Try to load from real API first
      const response = await fetch('/api/rewards/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.stats || null)
      } else {
        throw new Error('Failed to load user stats')
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
      // Fallback to mock data
      loadMockUserStats()
    }
  }, [])

  const loadLeaderboard = useCallback(async () => {
    try {
      // Try to load from real API first
      const response = await fetch('/api/rewards/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      } else {
        throw new Error('Failed to load leaderboard')
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      // Fallback to mock data
      loadMockLeaderboard()
    }
  }, [])

  const loadMockData = useCallback(() => {
    loadMockRewards()
    loadMockUserStats()
    loadMockLeaderboard()
  }, [])

  const loadRewardsData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Load data from APIs with fallback to mock data
      await Promise.all([
        loadRewards(),
        loadUserStats(),
        loadLeaderboard()
      ])
    } catch (error) {
      console.error('Error loading rewards data:', error)
      setError('Failed to load some data. Showing demo content.')
      // Fallback to mock data for demo purposes
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }, [loadRewards, loadUserStats, loadLeaderboard, loadMockData])

  useEffect(() => {
    loadRewardsData()
  }, [loadRewardsData])

  const claimReward = async (rewardId: string) => {
    try {
      // In real implementation, this would call the API
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId })
      })

      if (response.ok) {
        // Update local state
        setRewards(prev => prev.map(reward => 
          reward.id === rewardId ? { ...reward, status: 'claimed' } : reward
        ))
        
        // Refresh user stats
        await loadUserStats()
        
        alert('Reward claimed successfully!')
      } else {
        throw new Error('Failed to claim reward')
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      alert('Failed to claim reward. Please try again.')
    }
  }

  const getLevelProgress = () => {
    if (!userStats) return 0
    const progress = (userStats.currentLevelPoints / userStats.nextLevelPoints) * 100
    return Math.min(progress, 100)
  }

  const getNextLevel = () => {
    if (!userStats) return 'Bronze'
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
    const currentIndex = levels.indexOf(userStats.memberLevel)
    return levels[currentIndex + 1] || 'Max Level'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-300">Loading rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎁 Rewards & Loyalty</h1>
              <p className="text-ink-300">Earn points, unlock rewards, and climb the leaderboard</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* User Stats Overview */}
      {userStats && (
        <div className="bg-ink-800 border-b border-ink-700 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Points */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-purple-400">{userStats.totalPoints}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Total Points</h3>
                <p className="text-ink-400 text-sm">Earned from activities</p>
              </div>

              {/* Member Level */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <TrophyIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-lg font-bold text-yellow-400">{userStats.memberLevel}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Member Level</h3>
                <p className="text-ink-400 text-sm">Next: {getNextLevel()}</p>
                <div className="mt-3 w-full bg-ink-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getLevelProgress()}%` }}
                  ></div>
                </div>
              </div>

              {/* Streak */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <FireIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-2xl font-bold text-red-400">{userStats.streakDays}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Day Streak</h3>
                <p className="text-ink-400 text-sm">Visit daily for bonus points</p>
              </div>

              {/* Referrals */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{userStats.referralCount}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Referrals</h3>
                <p className="text-ink-400 text-sm">Friends invited</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {[
              { id: 'rewards', name: 'Rewards', icon: GiftIcon },
              { id: 'leaderboard', name: 'Leaderboard', icon: TrophyIcon },
              { id: 'how-it-works', name: 'How It Works', icon: SparklesIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedTab === 'rewards' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Available Rewards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div key={reward.id} className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">{reward.icon}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reward.status === 'available' ? 'bg-green-500 text-white' :
                      reward.status === 'claimed' ? 'bg-blue-500 text-white' :
                      'bg-ink-700 text-ink-300'
                    }`}>
                      {reward.status === 'claimed' ? 'Claimed' : 
                       reward.status === 'available' ? 'Available' : 'Locked'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                  <p className="text-ink-300 text-sm mb-4">{reward.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Points:</span>
                      <span className="text-purple-400 font-semibold">{reward.points}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Tokens:</span>
                      <span className="text-yellow-400 font-semibold">{reward.tokens}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Expires:</span>
                      <span className="text-ink-300">{reward.expiresAt}</span>
                    </div>
                  </div>
                  
                  {reward.requirements && reward.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-ink-300 mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {reward.requirements.map((req, index) => (
                          <li key={index} className="text-xs text-ink-400 flex items-center space-x-2">
                            <span className="w-2 h-2 bg-ink-600 rounded-full"></span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {reward.status === 'available' && (
                    <button
                      onClick={() => claimReward(reward.id)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Claim Reward
                    </button>
                  )}
                  
                  {reward.status === 'claimed' && (
                    <button className="w-full bg-ink-700 text-ink-300 py-3 rounded-lg font-semibold cursor-not-allowed">
                      Already Claimed
                    </button>
                  )}
                  
                  {reward.status === 'locked' && (
                    <button className="w-full bg-ink-700 text-ink-400 py-3 rounded-lg font-semibold cursor-not-allowed">
                      Requirements Not Met
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'leaderboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
            
            <div className="bg-ink-900 rounded-xl border border-ink-800 overflow-hidden">
              <div className="p-6 border-b border-ink-800">
                <h3 className="text-lg font-semibold text-white mb-2">Top Performers</h3>
                <p className="text-ink-300 text-sm">Compete with other fashion enthusiasts</p>
              </div>
              
              <div className="divide-y divide-ink-800">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.rank} 
                    className={`p-4 flex items-center space-x-4 ${
                      entry.isCurrentUser ? 'bg-purple-500/10 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-black' :
                        entry.rank === 2 ? 'bg-gray-400 text-black' :
                        entry.rank === 3 ? 'bg-orange-500 text-black' :
                        'bg-ink-700 text-ink-300'
                      }`}>
                        {entry.rank}
                      </div>
                      
                      <img
                        src={entry.avatar}
                        alt={entry.username}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/mock/default-avatar.jpg'
                        }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${
                            entry.isCurrentUser ? 'text-purple-400' : 'text-white'
                          }`}>
                            {entry.username}
                          </span>
                          {entry.isCurrentUser && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-sm text-ink-400">
                          {entry.points.toLocaleString()} points
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-ink-400">Rank #{entry.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'how-it-works' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">How Rewards Work</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingBagIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Earn Points</h3>
                <ul className="space-y-2 text-ink-300">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Make purchases (1 point per $1)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Write product reviews (25 points)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Refer friends (100 points each)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Daily login streak (10 points/day)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                  <GiftIcon className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Redeem Rewards</h3>
                <ul className="space-y-2 text-ink-300">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Discount coupons</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Free shipping</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Exclusive products</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Early access to sales</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <TrophyIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Member Levels</h3>
                <ul className="space-y-2 text-ink-300">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Bronze: 0-499 points</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Silver: 500-999 points</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Gold: 1000-1999 points</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Platinum: 2000+ points</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <BoltIcon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Bonus Features</h3>
                <ul className="space-y-2 text-ink-300">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Double points weekends</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Birthday month bonuses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Seasonal challenges</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>VIP event access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

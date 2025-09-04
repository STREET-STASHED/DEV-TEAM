'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  TrophyIcon, 
  StarIcon, 
  GiftIcon, 
  FireIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  maxProgress: number
  reward?: {
    type: string
    value: string
    description: string
  }
}

interface Milestone {
  id: string
  name: string
  description: string
  target: number
  current: number
  reward: string
  completed: boolean
  completedAt?: Date
}

interface LeaderboardEntry {
  userId: string
  name: string
  role: string
  xp: number
  level: number
  achievements: number
  rank: number
  avatar?: string
}

interface OnboardingReward {
  id: string
  name: string
  description: string
  type: string
  value: string
  conditions: string[]
  claimed: boolean
  claimedAt?: Date
  expiresAt?: Date
}

interface GamificationDashboardProps {
  userId: string
  role: string
  className?: string
}

export default function GamificationDashboard({ 
  userId, 
  role, 
  className = '' 
}: GamificationDashboardProps) {
  const [progress, setProgress] = useState({
    currentLevel: 1,
    totalXP: 0,
    xpToNextLevel: 1000,
    completionPercentage: 0,
    achievements: [] as Achievement[],
    streak: 0,
    milestones: [] as Milestone[]
  })
  
  const [rewards, setRewards] = useState<OnboardingReward[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements' | 'rewards' | 'leaderboard'>('progress')
  const [isLoading, setIsLoading] = useState(true)

  const loadGamificationData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch progress data
      const progressResponse = await fetch(`/api/onboarding/streamlined?userId=${userId}&role=${role}`)
      const progressData = await progressResponse.json()
      
      if (progressData.success) {
        setProgress(progressData.data.progress)
        setRewards(progressData.data.rewards)
        setLeaderboard(progressData.data.leaderboard)
      }
    } catch (error) {
      console.error('Error loading gamification data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, role])

  useEffect(() => {
    loadGamificationData()
  }, [loadGamificationData])

  const claimReward = async (rewardId: string) => {
    try {
      const response = await fetch('/api/onboarding/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rewardId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update rewards list
        setRewards(prev => prev.map(reward => 
          reward.id === rewardId 
            ? { ...reward, claimed: true, claimedAt: new Date() }
            : reward
        ))
        
        // Show success message
        alert(`Reward claimed: ${result.reward?.name}`)
      } else {
        alert(`Failed to claim reward: ${result.message}`)
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      alert('Failed to claim reward')
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case 'seller': return 'from-green-500 to-green-600'
      case 'stylist': return 'from-purple-500 to-purple-600'
      case 'driver': return 'from-orange-500 to-orange-600'
      default: return 'from-blue-500 to-blue-600'
    }
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'seller': return '🏪'
      case 'stylist': return '✨'
      case 'driver': return '🚚'
      default: return '👤'
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-ink-900 rounded-xl p-6 border border-ink-800 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-ink-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-ink-700 rounded"></div>
            <div className="h-4 bg-ink-700 rounded w-3/4"></div>
            <div className="h-4 bg-ink-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-ink-900 rounded-xl border border-ink-800 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-ink-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full bg-gradient-to-r ${getRoleColor()}`}>
              <span className="text-2xl">{getRoleIcon()}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Onboarding Progress</h2>
              <p className="text-ink-400 capitalize">{role} Dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">Level {progress.currentLevel}</div>
            <div className="text-sm text-ink-400">{progress.totalXP} XP</div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-ink-400 mb-2">
            <span>Progress to Level {progress.currentLevel + 1}</span>
            <span>{progress.xpToNextLevel} XP to go</span>
          </div>
          <div className="w-full bg-ink-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${getRoleColor()} transition-all duration-500`}
              style={{ 
                width: `${Math.min(100, ((progress.totalXP % 1000) / 1000) * 100)}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-800">
        {[
          { id: 'progress', label: 'Progress', icon: TrophyIcon },
          { id: 'achievements', label: 'Achievements', icon: StarIcon },
          { id: 'rewards', label: 'Rewards', icon: GiftIcon },
          { id: 'leaderboard', label: 'Leaderboard', icon: UserGroupIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-brand-500'
                : 'text-ink-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>
              <div className="space-y-4">
                {progress.milestones.map((milestone) => (
                  <div key={milestone.id} className="bg-ink-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{milestone.name}</h4>
                      <span className="text-sm text-ink-400">
                        {milestone.current}/{milestone.target}
                      </span>
                    </div>
                    <p className="text-sm text-ink-300 mb-3">{milestone.description}</p>
                    <div className="w-full bg-ink-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getRoleColor()} transition-all duration-500`}
                        style={{ 
                          width: `${Math.min(100, (milestone.current / milestone.target) * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-400">Reward: {milestone.reward}</span>
                      {milestone.completed && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-r from-brand-600/20 to-brand-500/20 rounded-lg p-4 border border-brand-500/30">
              <div className="flex items-center space-x-3">
                <FireIcon className="w-6 h-6 text-brand-400" />
                <div>
                  <h4 className="font-medium text-white">Daily Streak</h4>
                  <p className="text-sm text-ink-300">{progress.streak} days in a row</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`bg-ink-800 rounded-lg p-4 border ${
                    achievement.unlocked 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-ink-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{achievement.name}</h4>
                      <p className="text-sm text-ink-300 mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-400">
                          {achievement.points} XP
                        </span>
                        {achievement.unlocked ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-ink-600 rounded-full" />
                        )}
                      </div>
                      {achievement.reward && (
                        <div className="mt-2 text-xs text-brand-400">
                          Reward: {achievement.reward.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Available Rewards</h3>
            {rewards.length === 0 ? (
              <div className="text-center py-8">
                <GiftIcon className="w-12 h-12 text-ink-600 mx-auto mb-4" />
                <p className="text-ink-400">No rewards available at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="bg-ink-800 rounded-lg p-4 border border-ink-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{reward.name}</h4>
                        <p className="text-sm text-ink-300 mb-2">{reward.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-ink-400">
                          <span>Type: {reward.type}</span>
                          <span>Value: {reward.value}</span>
                          {reward.expiresAt && (
                            <span>Expires: {new Date(reward.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => claimReward(reward.id)}
                        disabled={reward.claimed}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          reward.claimed
                            ? 'bg-ink-700 text-ink-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700'
                        }`}
                      >
                        {reward.claimed ? 'Claimed' : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Top {role}s</h3>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.userId} 
                  className={`bg-ink-800 rounded-lg p-4 flex items-center space-x-4 ${
                    index === 0 ? 'border border-yellow-500/50 bg-yellow-500/10' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {index === 0 ? (
                      <TrophyIcon className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-ink-400">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{entry.avatar}</span>
                      <h4 className="font-medium text-white">{entry.name}</h4>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-ink-400">
                      <span>Level {entry.level}</span>
                      <span>{entry.xp} XP</span>
                      <span>{entry.achievements} achievements</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

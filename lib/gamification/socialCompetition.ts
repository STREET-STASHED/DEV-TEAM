// import { enhancedPersonalizationSystem } from '../personalization/enhancedUserProfile'

// Gamification & Social Competition System
export interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  category: 'style' | 'social' | 'shopping' | 'creative'
  requirements: ChallengeRequirement[]
  rewards: Reward[]
  participants: string[]
  leaderboard: LeaderboardEntry[]
  startDate: Date
  endDate: Date
  isActive: boolean
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

export interface ChallengeRequirement {
  type: 'purchase' | 'like' | 'share' | 'review' | 'outfit' | 'referral'
  count: number
  description: string
}

export interface Reward {
  type: 'points' | 'badge' | 'discount' | 'exclusive' | 'status'
  value: string | number
  description: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar: string
  score: number
  rank: number
  progress: number
}

export interface UserAchievement {
  id: string
  userId: string
  type: 'badge' | 'title' | 'milestone' | 'challenge'
  name: string
  description: string
  icon: string
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface SocialFeed {
  id: string
  userId: string
  type: 'outfit' | 'purchase' | 'challenge' | 'achievement'
  content: string
  media?: string[]
  likes: number
  comments: Comment[]
  shares: number
  createdAt: Date
  tags: string[]
  location?: string
  mood?: string
}

export interface Comment {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  createdAt: Date
  likes: number
}

export class GamificationSystem {
  private static instance: GamificationSystem
  private challenges: Map<string, Challenge> = new Map()
  private achievements: Map<string, UserAchievement[]> = new Map()
  private socialFeed: SocialFeed[] = []

  static getInstance(): GamificationSystem {
    if (!GamificationSystem.instance) {
      GamificationSystem.instance = new GamificationSystem()
      GamificationSystem.instance.initializeChallenges()
    }
    return GamificationSystem.instance
  }

  private initializeChallenges() {
    const challenges: Challenge[] = [
      // Daily Challenges
      {
        id: 'daily-style-master',
        title: 'Style Master Daily',
        description: 'Create 3 amazing outfits and get 5 likes',
        type: 'daily',
        category: 'style',
        requirements: [
          { type: 'outfit', count: 3, description: 'Create 3 outfits' },
          { type: 'like', count: 5, description: 'Get 5 likes' }
        ],
        rewards: [
          { type: 'points', value: 100, description: '100 Style Points' },
          { type: 'badge', value: 'daily-master', description: 'Daily Master Badge' }
        ],
        participants: [],
        leaderboard: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        difficulty: 'easy'
      },
      {
        id: 'daily-shopping-spree',
        title: 'Shopping Spree',
        description: 'Make 2 purchases and share your haul',
        type: 'daily',
        category: 'shopping',
        requirements: [
          { type: 'purchase', count: 2, description: 'Make 2 purchases' },
          { type: 'share', count: 1, description: 'Share your haul' }
        ],
        rewards: [
          { type: 'points', value: 150, description: '150 Shopping Points' },
          { type: 'discount', value: '10%', description: '10% off next purchase' }
        ],
        participants: [],
        leaderboard: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        difficulty: 'medium'
      },

      // Weekly Challenges
      {
        id: 'weekly-fashion-influencer',
        title: 'Fashion Influencer',
        description: 'Gain 50 followers and create viral content',
        type: 'weekly',
        category: 'social',
        requirements: [
          { type: 'referral', count: 10, description: 'Refer 10 friends' },
          { type: 'share', count: 5, description: 'Share 5 posts' }
        ],
        rewards: [
          { type: 'points', value: 500, description: '500 Influence Points' },
          { type: 'status', value: 'influencer', description: 'Influencer Status' },
          { type: 'exclusive', value: 'early-access', description: 'Early Access to New Features' }
        ],
        participants: [],
        leaderboard: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        difficulty: 'hard'
      },

      // Monthly Challenges
      {
        id: 'monthly-style-evolution',
        title: 'Style Evolution',
        description: 'Complete a full wardrobe transformation',
        type: 'monthly',
        category: 'creative',
        requirements: [
          { type: 'purchase', count: 15, description: 'Purchase 15 items' },
          { type: 'outfit', count: 20, description: 'Create 20 outfits' },
          { type: 'review', count: 10, description: 'Write 10 reviews' }
        ],
        rewards: [
          { type: 'points', value: 2000, description: '2000 Evolution Points' },
          { type: 'badge', value: 'style-evolutionist', description: 'Style Evolutionist Badge' },
          { type: 'exclusive', value: 'personal-stylist', description: 'Free Personal Stylist Session' }
        ],
        participants: [],
        leaderboard: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        difficulty: 'expert'
      }
    ]

    challenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge)
    })
  }

  // Join a challenge
  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    const challenge = this.challenges.get(challengeId)
    if (!challenge || !challenge.isActive) return false

    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId)
      
      // Initialize leaderboard entry
      const leaderboardEntry: LeaderboardEntry = {
        userId,
        username: `User_${userId.slice(0, 8)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        score: 0,
        rank: challenge.leaderboard.length + 1,
        progress: 0
      }
      
      challenge.leaderboard.push(leaderboardEntry)
      this.updateLeaderboard(challengeId)
      
      return true
    }
    
    return false
  }

  // Update challenge progress
  async updateProgress(
    userId: string,
    challengeId: string,
    action: 'purchase' | 'like' | 'share' | 'review' | 'outfit' | 'referral'
  ): Promise<void> {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) return

    const leaderboardEntry = challenge.leaderboard.find(entry => entry.userId === userId)
    if (!leaderboardEntry) return

    // Update progress based on action
    const requirement = challenge.requirements.find(req => req.type === action)
    if (requirement) {
      leaderboardEntry.progress = Math.min(leaderboardEntry.progress + 1, requirement.count)
      leaderboardEntry.score = this.calculateScore(challenge, leaderboardEntry.progress)
    }

    // Check if challenge is completed
    if (this.isChallengeCompleted(userId, challengeId)) {
      await this.completeChallenge(userId, challengeId)
    }

    this.updateLeaderboard(challengeId)
  }

  // Calculate score for leaderboard
  private calculateScore(challenge: Challenge, progress: number): number {
    const totalRequired = challenge.requirements.reduce((sum, req) => sum + req.count, 0)
    const completionRate = progress / totalRequired
    
    // Base score + bonus for difficulty
    let baseScore = Math.floor(completionRate * 1000)
    
    switch (challenge.difficulty) {
      case 'easy': baseScore *= 1; break
      case 'medium': baseScore *= 1.5; break
      case 'hard': baseScore *= 2; break
      case 'expert': baseScore *= 3; break
    }
    
    return baseScore
  }

  // Check if challenge is completed
  private isChallengeCompleted(userId: string, challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) return false

    const leaderboardEntry = challenge.leaderboard.find(entry => entry.userId === userId)
    if (!leaderboardEntry) return false

    return challenge.requirements.every(req => leaderboardEntry.progress >= req.count)
  }

  // Complete challenge and award rewards
  private async completeChallenge(userId: string, challengeId: string): Promise<void> {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) return

    // Award rewards
    for (const reward of challenge.rewards) {
      await this.awardReward(userId, reward)
    }

    // Create achievement
    const achievement: UserAchievement = {
      id: crypto.randomUUID(),
      userId,
      type: 'challenge',
      name: `Completed: ${challenge.title}`,
      description: `Successfully completed the ${challenge.title} challenge`,
      icon: '🏆',
      unlockedAt: new Date(),
      rarity: this.calculateRarity(challenge.difficulty)
    }

    this.addAchievement(userId, achievement)

    // Add to social feed
    this.addToSocialFeed({
      id: crypto.randomUUID(),
      userId,
      type: 'achievement',
      content: `Just completed the ${challenge.title} challenge! 🎉`,
      likes: 0,
      comments: [],
      shares: 0,
      createdAt: new Date(),
      tags: ['challenge', 'achievement', challenge.category]
    })
  }

  // Award reward to user
  private async awardReward(userId: string, reward: Reward): Promise<void> {
    // This would integrate with your existing reward system
    console.log(`Awarding ${reward.type}: ${reward.value} to user ${userId}`)
  }

  // Calculate rarity based on difficulty
  private calculateRarity(difficulty: string): 'common' | 'rare' | 'epic' | 'legendary' {
    switch (difficulty) {
      case 'easy': return 'common'
      case 'medium': return 'rare'
      case 'hard': return 'epic'
      case 'expert': return 'legendary'
      default: return 'common'
    }
  }

  // Add achievement to user
  private addAchievement(userId: string, achievement: UserAchievement): void {
    if (!this.achievements.has(userId)) {
      this.achievements.set(userId, [])
    }
    
    this.achievements.get(userId)!.push(achievement)
  }

  // Update leaderboard rankings
  private updateLeaderboard(challengeId: string): void {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) return

    // Sort by score (descending)
    challenge.leaderboard.sort((a, b) => b.score - a.score)
    
    // Update rankings
    challenge.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1
    })
  }

  // Add post to social feed
  addToSocialFeed(post: SocialFeed): void {
    this.socialFeed.unshift(post)
    
    // Keep only last 1000 posts
    if (this.socialFeed.length > 1000) {
      this.socialFeed = this.socialFeed.slice(0, 1000)
    }
  }

  // Get social feed
  getSocialFeed(limit: number = 20): SocialFeed[] {
    return this.socialFeed.slice(0, limit)
  }

  // Get user achievements
  getUserAchievements(userId: string): UserAchievement[] {
    return this.achievements.get(userId) || []
  }

  // Get active challenges
  getActiveChallenges(): Challenge[] {
    return Array.from(this.challenges.values()).filter(challenge => challenge.isActive)
  }

  // Get challenge leaderboard
  getChallengeLeaderboard(challengeId: string): LeaderboardEntry[] {
    const challenge = this.challenges.get(challengeId)
    return challenge ? challenge.leaderboard : []
  }

  // Get trending challenges
  getTrendingChallenges(): Challenge[] {
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.isActive)
      .sort((a, b) => b.participants.length - a.participants.length)
      .slice(0, 5)
  }

  // Create custom challenge
  createCustomChallenge(
    creatorId: string,
    title: string,
    description: string,
    requirements: ChallengeRequirement[],
    rewards: Reward[],
    duration: number // days
  ): Challenge {
    const challenge: Challenge = {
      id: crypto.randomUUID(),
      title,
      description,
      type: 'special',
      category: 'creative',
      requirements,
      rewards,
      participants: [creatorId],
      leaderboard: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      isActive: true,
      difficulty: this.calculateDifficulty(requirements)
    }

    this.challenges.set(challenge.id, challenge)
    return challenge
  }

  // Calculate difficulty based on requirements
  private calculateDifficulty(requirements: ChallengeRequirement[]): 'easy' | 'medium' | 'hard' | 'expert' {
    const totalCount = requirements.reduce((sum, req) => sum + req.count, 0)
    
    if (totalCount <= 5) return 'easy'
    if (totalCount <= 15) return 'medium'
    if (totalCount <= 30) return 'hard'
    return 'expert'
  }

  // Get user stats
  getUserStats(_userId: string): {
    totalPoints: number
    achievements: number
    challengesCompleted: number
    currentRank: number
    followers: number
    following: number
  } {
    const userAchievements = this.getUserAchievements(_userId)
    const completedChallenges = Array.from(this.challenges.values())
      .filter(challenge => this.isChallengeCompleted(_userId, challenge.id))
    
    return {
      totalPoints: userAchievements.reduce((sum, achievement) => sum + (achievement.rarity === 'legendary' ? 1000 : 100), 0),
      achievements: userAchievements.length,
      challengesCompleted: completedChallenges.length,
      currentRank: this.calculateGlobalRank(_userId),
      followers: Math.floor(Math.random() * 1000), // Mock data
      following: Math.floor(Math.random() * 500)   // Mock data
    }
  }

  // Calculate global rank
  private calculateGlobalRank(_userId: string): number {
    // Mock implementation - would calculate based on all users
    return Math.floor(Math.random() * 10000) + 1
  }
}

export const gamificationSystem = GamificationSystem.getInstance()

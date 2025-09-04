/**
 * Onboarding Gamification System
 * Phase 3: Engagement and Motivation Features
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'onboarding' | 'profile' | 'verification' | 'first_action' | 'social'
  points: number
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  maxProgress: number
  reward?: {
    type: 'badge' | 'bonus' | 'feature' | 'discount'
    value: string
    description: string
  }
}

export interface OnboardingProgress {
  userId: string
  role: string
  currentLevel: number
  totalXP: number
  xpToNextLevel: number
  completionPercentage: number
  achievements: Achievement[]
  streak: number
  lastActivity: Date
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  name: string
  description: string
  target: number
  current: number
  reward: string
  completed: boolean
  completedAt?: Date
}

export interface LeaderboardEntry {
  userId: string
  name: string
  role: string
  xp: number
  level: number
  achievements: number
  rank: number
  avatar?: string
}

export interface OnboardingReward {
  id: string
  name: string
  description: string
  type: 'xp' | 'badge' | 'bonus' | 'feature' | 'discount'
  value: number | string
  conditions: string[]
  claimed: boolean
  claimedAt?: Date
  expiresAt?: Date
}

export class OnboardingGamification {
  private static instance: OnboardingGamification
  private achievements: Map<string, Achievement> = new Map()
  private milestones: Map<string, Milestone[]> = new Map()
  private rewards: Map<string, OnboardingReward[]> = new Map()

  private constructor() {
    this.initializeAchievements()
    this.initializeMilestones()
    this.initializeRewards()
  }

  public static getInstance(): OnboardingGamification {
    if (!OnboardingGamification.instance) {
      OnboardingGamification.instance = new OnboardingGamification()
    }
    return OnboardingGamification.instance
  }

  private initializeAchievements(): void {
    // Onboarding Achievements
    this.achievements.set('welcome_aboard', {
      id: 'welcome_aboard',
      name: 'Welcome Aboard!',
      description: 'Complete your account setup',
      icon: '🎉',
      category: 'onboarding',
      points: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: {
        type: 'badge',
        value: 'Newcomer',
        description: 'Welcome to StreetStashed!'
      }
    })

    this.achievements.set('profile_perfect', {
      id: 'profile_perfect',
      name: 'Profile Perfect',
      description: 'Complete your profile with photo and bio',
      icon: '👤',
      category: 'profile',
      points: 150,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      reward: {
        type: 'bonus',
        value: '$10',
        description: 'Profile completion bonus'
      }
    })

    this.achievements.set('verification_master', {
      id: 'verification_master',
      name: 'Verification Master',
      description: 'Complete all verification steps',
      icon: '✅',
      category: 'verification',
      points: 200,
      unlocked: false,
      progress: 0,
      maxProgress: 4,
      reward: {
        type: 'feature',
        value: 'Priority Support',
        description: 'Get priority customer support'
      }
    })

    // Role-specific achievements
    this.achievements.set('first_sale', {
      id: 'first_sale',
      name: 'First Sale',
      description: 'Make your first sale as a seller',
      icon: '💰',
      category: 'first_action',
      points: 300,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: {
        type: 'bonus',
        value: '$50',
        description: 'First sale bonus'
      }
    })

    this.achievements.set('first_client', {
      id: 'first_client',
      name: 'First Client',
      description: 'Book your first client as a stylist',
      icon: '👥',
      category: 'first_action',
      points: 250,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: {
        type: 'bonus',
        value: '$25',
        description: 'First client bonus'
      }
    })

    this.achievements.set('first_delivery', {
      id: 'first_delivery',
      name: 'First Delivery',
      description: 'Complete your first delivery as a stasher',
      icon: '🚚',
      category: 'first_action',
      points: 200,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: {
        type: 'bonus',
        value: '$20',
        description: 'First delivery bonus'
      }
    })

    // Social achievements
    this.achievements.set('social_butterfly', {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Connect your social media accounts',
      icon: '🦋',
      category: 'social',
      points: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      reward: {
        type: 'feature',
        value: 'Social Boost',
        description: 'Enhanced social features'
      }
    })

    this.achievements.set('early_adopter', {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Join within the first 1000 users',
      icon: '🚀',
      category: 'onboarding',
      points: 500,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: {
        type: 'badge',
        value: 'Pioneer',
        description: 'Early adopter exclusive badge'
      }
    })
  }

  private initializeMilestones(): void {
    // Seller milestones
    this.milestones.set('seller', [
      {
        id: 'upload_5_products',
        name: 'Product Power',
        description: 'Upload 5 products to your store',
        target: 5,
        current: 0,
        reward: 'Featured placement for 1 week',
        completed: false
      },
      {
        id: 'first_10_sales',
        name: 'Sales Success',
        description: 'Make your first 10 sales',
        target: 10,
        current: 0,
        reward: '0% commission for 1 month',
        completed: false
      },
      {
        id: 'reach_100_followers',
        name: 'Growing Audience',
        description: 'Reach 100 followers on your store',
        target: 100,
        current: 0,
        reward: 'Advanced analytics access',
        completed: false
      }
    ])

    // Stylist milestones
    this.milestones.set('stylist', [
      {
        id: 'book_10_clients',
        name: 'Client Magnet',
        description: 'Book 10 clients',
        target: 10,
        current: 0,
        reward: 'Premium stylist badge',
        completed: false
      },
      {
        id: 'earn_5_stars',
        name: 'Five Star Stylist',
        description: 'Maintain 5-star average rating',
        target: 5,
        current: 0,
        reward: 'Featured stylist placement',
        completed: false
      },
      {
        id: 'create_20_outfits',
        name: 'Style Creator',
        description: 'Create 20 outfit recommendations',
        target: 20,
        current: 0,
        reward: 'AI styling tools access',
        completed: false
      }
    ])

    // Driver milestones
    this.milestones.set('driver', [
      {
        id: 'complete_50_deliveries',
        name: 'Delivery Pro',
        description: 'Complete 50 deliveries',
        target: 50,
        current: 0,
        reward: 'Priority delivery assignments',
        completed: false
      },
      {
        id: 'maintain_98_rating',
        name: 'Top Performer',
        description: 'Maintain 98%+ customer rating',
        target: 98,
        current: 0,
        reward: 'Top stasher badge',
        completed: false
      },
      {
        id: 'earn_1000_total',
        name: 'Earning Champion',
        description: 'Earn $1000 total',
        target: 1000,
        current: 0,
        reward: 'Bonus delivery zones',
        completed: false
      }
    ])
  }

  private initializeRewards(): void {
    // Welcome rewards for all roles
    this.rewards.set('welcome', [
      {
        id: 'welcome_bonus',
        name: 'Welcome Bonus',
        description: 'Get started with extra credits',
        type: 'bonus',
        value: '$25',
        conditions: ['complete_onboarding'],
        claimed: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        id: 'early_access',
        name: 'Early Access',
        description: 'Access to new features first',
        type: 'feature',
        value: 'Beta Features',
        conditions: ['complete_onboarding', 'verify_account'],
        claimed: false
      }
    ])

    // Role-specific rewards
    this.rewards.set('seller', [
      {
        id: 'first_month_free',
        name: 'First Month Free',
        description: '0% commission for your first month',
        type: 'discount',
        value: '100%',
        conditions: ['upload_first_product'],
        claimed: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ])

    this.rewards.set('stylist', [
      {
        id: 'client_guarantee',
        name: 'Client Guarantee',
        description: 'Guaranteed first 5 clients',
        type: 'feature',
        value: '5 Clients',
        conditions: ['complete_profile', 'upload_portfolio'],
        claimed: false
      }
    ])

    this.rewards.set('driver', [
      {
        id: 'first_week_guarantee',
        name: 'First Week Guarantee',
        description: 'Guaranteed $200 earnings in first week',
        type: 'bonus',
        value: '$200',
        conditions: ['complete_verification', 'pass_background_check'],
        claimed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    ])
  }

  /**
   * Get user's onboarding progress
   */
  async getUserProgress(userId: string, role: string): Promise<OnboardingProgress> {
    // This would fetch from your database
    const achievements = Array.from(this.achievements.values())
    const milestones = this.milestones.get(role) || []
    
    return {
      userId,
      role,
      currentLevel: this.calculateLevel(0), // Calculate based on total XP
      totalXP: 0,
      xpToNextLevel: 1000,
      completionPercentage: 0,
      achievements,
      streak: 0,
      lastActivity: new Date(),
      milestones
    }
  }

  /**
   * Award XP for completing actions
   */
  async awardXP(userId: string, action: string, points: number): Promise<{
    newXP: number
    levelUp: boolean
    newLevel: number
    achievements: Achievement[]
  }> {
    // This would update the database
    const newXP = 0 + points // Get current XP from database
    const oldLevel = this.calculateLevel(newXP - points)
    const newLevel = this.calculateLevel(newXP)
    const levelUp = newLevel > oldLevel

    // Check for new achievements
    const newAchievements = await this.checkAchievements(userId, action)

    return {
      newXP,
      levelUp,
      newLevel,
      achievements: newAchievements
    }
  }

  /**
   * Check and unlock achievements
   */
  async checkAchievements(userId: string, action: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []

    // Check each achievement
    for (const achievement of this.achievements.values()) {
      if (achievement.unlocked) continue

      let shouldUnlock = false

      switch (achievement.id) {
        case 'welcome_aboard':
          if (action === 'complete_onboarding') {
            shouldUnlock = true
          }
          break
        case 'profile_perfect':
          if (action === 'complete_profile') {
            shouldUnlock = true
          }
          break
        case 'verification_master':
          if (action === 'complete_verification') {
            shouldUnlock = true
          }
          break
        case 'first_sale':
          if (action === 'make_sale') {
            shouldUnlock = true
          }
          break
        case 'first_client':
          if (action === 'book_client') {
            shouldUnlock = true
          }
          break
        case 'first_delivery':
          if (action === 'complete_delivery') {
            shouldUnlock = true
          }
          break
        case 'social_butterfly':
          if (action === 'connect_social') {
            shouldUnlock = true
          }
          break
      }

      if (shouldUnlock) {
        achievement.unlocked = true
        achievement.unlockedAt = new Date()
        achievement.progress = achievement.maxProgress
        newAchievements.push(achievement)
      }
    }

    return newAchievements
  }

  /**
   * Get available rewards for user
   */
  async getAvailableRewards(userId: string, role: string): Promise<OnboardingReward[]> {
    const allRewards = [
      ...(this.rewards.get('welcome') || []),
      ...(this.rewards.get(role) || [])
    ]

    return allRewards.filter(reward => 
      !reward.claimed && 
      (!reward.expiresAt || reward.expiresAt > new Date())
    )
  }

  /**
   * Claim a reward
   */
  async claimReward(userId: string, rewardId: string): Promise<{
    success: boolean
    reward?: OnboardingReward
    message: string
  }> {
    // Find the reward
    const allRewards = [
      ...(this.rewards.get('welcome') || []),
      ...(this.rewards.get('seller') || []),
      ...(this.rewards.get('stylist') || []),
      ...(this.rewards.get('driver') || [])
    ]

    const reward = allRewards.find(r => r.id === rewardId)
    if (!reward) {
      return {
        success: false,
        message: 'Reward not found'
      }
    }

    if (reward.claimed) {
      return {
        success: false,
        message: 'Reward already claimed'
      }
    }

    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return {
        success: false,
        message: 'Reward has expired'
      }
    }

    // Mark as claimed
    reward.claimed = true
    reward.claimedAt = new Date()

    return {
      success: true,
      reward,
      message: `Reward claimed: ${reward.name}`
    }
  }

  /**
   * Get leaderboard for role
   */
  async getLeaderboard(role: string, _limit: number = 10): Promise<LeaderboardEntry[]> {
    // This would query your database
    return [
      {
        userId: '1',
        name: 'Top Seller',
        role: 'seller',
        xp: 5000,
        level: 5,
        achievements: 8,
        rank: 1,
        avatar: '👑'
      },
      {
        userId: '2',
        name: 'Style Master',
        role: 'stylist',
        xp: 4500,
        level: 4,
        achievements: 7,
        rank: 2,
        avatar: '✨'
      },
      {
        userId: '3',
        name: 'Delivery King',
        role: 'driver',
        xp: 4000,
        level: 4,
        achievements: 6,
        rank: 3,
        avatar: '🚚'
      }
    ]
  }

  /**
   * Calculate level based on XP
   */
  private calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  /**
   * Get XP required for next level
   */
  getXPToNextLevel(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP)
    const nextLevelXP = Math.pow(currentLevel, 2) * 100
    return nextLevelXP - currentXP
  }

  /**
   * Get onboarding statistics
   */
  async getOnboardingStats(): Promise<{
    totalUsers: number
    completionRate: number
    averageCompletionTime: string
    topAchievements: Achievement[]
    activeUsers: number
  }> {
    // This would query your database
    return {
      totalUsers: 0,
      completionRate: 0,
      averageCompletionTime: '0 minutes',
      topAchievements: [],
      activeUsers: 0
    }
  }
}

// Export singleton instance
export const onboardingGamification = OnboardingGamification.getInstance()

// Export utility functions
export const getUserProgress = (userId: string, role: string) =>
  onboardingGamification.getUserProgress(userId, role)

export const awardXP = (userId: string, action: string, points: number) =>
  onboardingGamification.awardXP(userId, action, points)

export const getAvailableRewards = (userId: string, role: string) =>
  onboardingGamification.getAvailableRewards(userId, role)

export const claimReward = (userId: string, rewardId: string) =>
  onboardingGamification.claimReward(userId, rewardId)

export const getLeaderboard = (role: string, limit?: number) =>
  onboardingGamification.getLeaderboard(role, limit)

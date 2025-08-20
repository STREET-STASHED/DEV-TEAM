// Social Commerce & Viral Features System
// This system drives user engagement and viral growth through social features

export interface SocialPost {
  id: string
  _userId: string
  type: 'outfit' | 'review' | 'challenge' | 'haul' | 'styling'
  content: string
  images: string[]
  productIds: string[]
  likes: number
  shares: number
  comments: number
  views: number
  createdAt: Date
  tags: string[]
  location?: string
  isSponsored: boolean
  viralScore: number
}

export interface SocialChallenge {
  id: string
  title: string
  description: string
  hashtag: string
  startDate: Date
  endDate: Date
  prize: {
    type: 'cash' | 'products' | 'credits' | 'experience'
    value: number
    description: string
  }
  participants: number
  submissions: number
  rules: string[]
  featuredPosts: string[]
  isActive: boolean
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  followers: number
  following: number
  posts: number
  viralScore: number
  isVerified: boolean
  isInfluencer: boolean
  categories: string[]
  location?: string
  website?: string
  socialLinks: {
    instagram?: string
    tiktok?: string
    youtube?: string
    twitter?: string
  }
}

export interface ViralMetrics {
  totalViews: number
  totalLikes: number
  totalShares: number
  totalComments: number
  viralCoefficient: number
  engagementRate: number
  reachScore: number
  influenceScore: number
}

export interface SocialReward {
  id: string
  _userId: string
  type: 'referral' | '_post' | 'challenge' | 'engagement' | 'viral'
  amount: number
  currency: 'points' | 'credits' | 'cash'
  description: string
  status: 'pending' | 'approved' | 'paid'
  createdAt: Date
  paidAt?: Date
}

class SocialCommerceSystem {
  private posts: Map<string, SocialPost> = new Map()
  private challenges: Map<string, SocialChallenge> = new Map()
  private userProfiles: Map<string, UserProfile> = new Map()
  private rewards: Map<string, SocialReward> = new Map()

  // Create a new social _post
  async createPost(
    _userId: string,
    type: SocialPost['type'],
    content: string,
    images: string[],
    productIds: string[],
    tags: string[] = []
  ): Promise<SocialPost> {
    const _post: SocialPost = {
      id: crypto.randomUUID(),
      _userId,
      type,
      content,
      images,
      productIds,
      likes: 0,
      shares: 0,
      comments: 0,
      views: 0,
      createdAt: new Date(),
      tags,
      isSponsored: false,
      viralScore: 0
    }

    this.posts.set(_post.id, _post)
    
    // Calculate initial viral score
    _post.viralScore = this.calculateViralScore(_post)
    
    // Award points for creating content
    await this.awardPoints(_userId, '_post', 10)
    
    return _post
  }

  // Like a _post
  async likePost(postId: string, _userId: string): Promise<void> {
    const _post = this.posts.get(postId)
    if (!_post) throw new Error('Post not found')

    _post.likes++
    _post.viralScore = this.calculateViralScore(_post)
    
    // Award points for engagement
    await this.awardPoints(_userId, 'engagement', 1)
    
    // Award points to _post creator
    await this.awardPoints(_post._userId, 'engagement', 2)
  }

  // Share a _post
  async sharePost(postId: string, _userId: string, _platform: string): Promise<void> {
    const _post = this.posts.get(postId)
    if (!_post) throw new Error('Post not found')

    _post.shares++
    _post.viralScore = this.calculateViralScore(_post)
    
    // Award points for sharing
    await this.awardPoints(_userId, 'engagement', 3)
    
    // Award points to _post creator
    await this.awardPoints(_post._userId, 'viral', 5)
    
    // Track viral coefficient
    this.updateViralCoefficient(_post._userId)
  }

  // Comment on a _post
  async commentPost(postId: string, _userId: string, _comment: string): Promise<void> {
    const _post = this.posts.get(postId)
    if (!_post) throw new Error('Post not found')

    _post.comments++
    _post.viralScore = this.calculateViralScore(_post)
    
    // Award points for engagement
    await this.awardPoints(_userId, 'engagement', 2)
    
    // Award points to _post creator
    await this.awardPoints(_post._userId, 'engagement', 3)
  }

  // View a _post
  async viewPost(postId: string, _userId: string): Promise<void> {
    const _post = this.posts.get(postId)
    if (!_post) throw new Error('Post not found')

    _post.views++
    _post.viralScore = this.calculateViralScore(_post)
  }

  // Create a social challenge
  async createChallenge(
    title: string,
    description: string,
    hashtag: string,
    startDate: Date,
    endDate: Date,
    prize: SocialChallenge['prize'],
    rules: string[]
  ): Promise<SocialChallenge> {
    const challenge: SocialChallenge = {
      id: crypto.randomUUID(),
      title,
      description,
      hashtag,
      startDate,
      endDate,
      prize,
      participants: 0,
      submissions: 0,
      rules,
      featuredPosts: [],
      isActive: true
    }

    this.challenges.set(challenge.id, challenge)
    return challenge
  }

  // Participate in a challenge
  async participateInChallenge(challengeId: string, _userId: string, postId: string): Promise<void> {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) throw new Error('Challenge not found')

    if (!challenge.isActive) throw new Error('Challenge is not active')

    challenge.participants++
    challenge.submissions++
    
    // Award points for participation
    await this.awardPoints(_userId, 'challenge', 20)
    
    // Check if _post should be featured
    const _post = this.posts.get(postId)
    if (_post && _post.viralScore > 50) {
      challenge.featuredPosts.push(postId)
    }
  }

  // Calculate viral score for a _post
  private calculateViralScore(_post: SocialPost): number {
    const timeDecay = this.calculateTimeDecay(_post.createdAt)
    const engagementScore = (_post.likes * 1) + (_post.shares * 3) + (_post.comments * 2)
    const reachScore = _post.views * 0.1
    const qualityScore = _post.images.length * 5 + _post.productIds.length * 3
    
    return Math.floor((engagementScore + reachScore + qualityScore) * timeDecay)
  }

  // Calculate time decay factor
  private calculateTimeDecay(createdAt: Date): number {
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
    return Math.max(0.1, 1 - (hoursSinceCreation / 168)) // Decay over 1 week
  }

  // Update viral coefficient for a user
  private async updateViralCoefficient(_userId: string): Promise<void> {
    const userPosts = Array.from(this.posts.values()).filter(_post => _post._userId === _userId)
    const totalShares = userPosts.reduce((sum, _post) => sum + _post.shares, 0)
    const totalViews = userPosts.reduce((sum, _post) => sum + _post.views, 0)
    
    const viralCoefficient = totalViews > 0 ? totalShares / totalViews : 0
    
    // Update user profile
    const profile = this.userProfiles.get(_userId)
    if (profile) {
      profile.viralScore = Math.floor(viralCoefficient * 100)
    }
  }

  // Award points to user
  private async awardPoints(_userId: string, type: string, amount: number): Promise<void> {
    const reward: SocialReward = {
      id: crypto.randomUUID(),
      _userId,
      type: type as SocialReward['type'],
      amount,
      currency: 'points',
      description: `Earned ${amount} points for ${type}`,
      status: 'approved',
      createdAt: new Date()
    }

    this.rewards.set(reward.id, reward)
  }

  // Get trending posts
  async getTrendingPosts(limit: number = 10): Promise<SocialPost[]> {
    const posts = Array.from(this.posts.values())
    return posts
      .sort((a, b) => b.viralScore - a.viralScore)
      .slice(0, limit)
  }

  // Get user feed
  async getUserFeed(_userId: string, limit: number = 20): Promise<SocialPost[]> {
    const userProfile = this.userProfiles.get(_userId)
    if (!userProfile) return []

    // Get posts from followed users and trending posts
    const posts = Array.from(this.posts.values())
    const followedPosts = posts.filter(_post => 
      userProfile.following > 0 && Math.random() < 0.7 // 70% from followed users
    )
    const trendingPosts = posts.filter(_post => 
      _post.viralScore > 30 && _post._userId !== _userId
    )

    const feed = [...followedPosts, ...trendingPosts]
    return feed
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  // Get active challenges
  async getActiveChallenges(): Promise<SocialChallenge[]> {
    const now = new Date()
    return Array.from(this.challenges.values())
      .filter(challenge => 
        challenge.isActive && 
        challenge.startDate <= now && 
        challenge.endDate >= now
      )
      .sort((a, b) => b.participants - a.participants)
  }

  // Get user profile
  async getUserProfile(_userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(_userId) || null
  }

  // Update user profile
  async updateUserProfile(_userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = this.userProfiles.get(_userId)
    if (!profile) {
      throw new Error('User profile not found')
    }

    const updatedProfile = { ...profile, ...updates }
    this.userProfiles.set(_userId, updatedProfile)
    return updatedProfile
  }

  // Get viral metrics for a user
  async getViralMetrics(_userId: string): Promise<ViralMetrics> {
    const userPosts = Array.from(this.posts.values()).filter(_post => _post._userId === _userId)
    
    const totalViews = userPosts.reduce((sum, _post) => sum + _post.views, 0)
    const totalLikes = userPosts.reduce((sum, _post) => sum + _post.likes, 0)
    const totalShares = userPosts.reduce((sum, _post) => sum + _post.shares, 0)
    const totalComments = userPosts.reduce((sum, _post) => sum + _post.comments, 0)
    
    const viralCoefficient = totalViews > 0 ? totalShares / totalViews : 0
    const engagementRate = totalViews > 0 ? (totalLikes + totalComments) / totalViews : 0
    const reachScore = Math.log10(totalViews + 1) * 10
    const influenceScore = (viralCoefficient * 50) + (engagementRate * 30) + (reachScore * 20)

    return {
      totalViews,
      totalLikes,
      totalShares,
      totalComments,
      viralCoefficient,
      engagementRate,
      reachScore,
      influenceScore
    }
  }

  // Get user rewards
  async getUserRewards(_userId: string): Promise<SocialReward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward._userId === _userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Search posts by hashtag
  async searchPostsByHashtag(hashtag: string): Promise<SocialPost[]> {
    const posts = Array.from(this.posts.values())
    return posts.filter(_post => 
      _post.tags.some(tag => tag.toLowerCase().includes(hashtag.toLowerCase())) ||
      _post.content.toLowerCase().includes(`#${hashtag.toLowerCase()}`)
    ).sort((a, b) => b.viralScore - a.viralScore)
  }

  // Get recommended users to follow
  async getRecommendedUsers(_userId: string, limit: number = 10): Promise<UserProfile[]> {
    const userProfile = this.userProfiles.get(_userId)
    if (!userProfile) return []

    const allProfiles = Array.from(this.userProfiles.values())
    return allProfiles
      .filter(profile => 
        profile.id !== _userId && 
        profile.viralScore > 30 &&
        profile.categories.some(cat => userProfile.categories.includes(cat))
      )
      .sort((a, b) => b.viralScore - a.viralScore)
      .slice(0, limit)
  }

  // Generate viral hashtags
  generateViralHashtags(category: string): string[] {
    const baseHashtags = [
      '#streetstashed',
      '#streetwear',
      '#fashion',
      '#style',
      '#ootd',
      '#fashionista',
      '#trending',
      '#viral'
    ]

    const categoryHashtags = {
      'streetwear': ['#streetstyle', '#urbanfashion', '#sneakers', '#streetwearstyle'],
      'sneakers': ['#sneakerhead', '#kicks', '#sneakers', '#shoegame'],
      'hoodies': ['#hoodie', '#streetwear', '#casual', '#comfortable'],
      'jackets': ['#jacket', '#outerwear', '#streetstyle', '#fashion']
    }

    return [...baseHashtags, ...(categoryHashtags[category as keyof typeof categoryHashtags] || [])]
  }

  // Check if user is eligible for influencer program
  async checkInfluencerEligibility(_userId: string): Promise<boolean> {
    const metrics = await this.getViralMetrics(_userId)
    const profile = await this.getUserProfile(_userId)
    
    if (!profile) return false

    return (
      profile.followers >= 1000 &&
      metrics.engagementRate >= 0.05 &&
      metrics.influenceScore >= 50 &&
      profile.posts >= 10
    )
  }

  // Promote _post (sponsored)
  async promotePost(postId: string, _budget: number): Promise<void> {
    const _post = this.posts.get(postId)
    if (!_post) throw new Error('Post not found')

    _post.isSponsored = true
    _post.viralScore = _post.viralScore * 1.5 // Boost viral score for sponsored posts
  }
}

export const socialCommerceSystem = new SocialCommerceSystem()

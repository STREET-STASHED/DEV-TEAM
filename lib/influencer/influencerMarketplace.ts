/**
 * Influencer Marketplace System - Connect Brands with Influencers
 * This system creates viral marketing and massive brand exposure
 */

export interface InfluencerProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  category: 'fashion' | 'lifestyle' | 'beauty' | 'luxury' | 'streetwear' | 'jewelry';
  tier: 'mega' | 'macro' | 'micro' | 'nano';
  followers: {
    instagram: number;
    tiktok: number;
    youtube: number;
    twitter: number;
    total: number;
  };
  engagement: {
    rate: number;
    averageLikes: number;
    averageComments: number;
    averageShares: number;
  };
  demographics: {
    ageRange: string;
    gender: string;
    location: string;
    interests: string[];
  };
  brandCollaborations: number;
  averageROI: number;
  rating: number;
  verified: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface Collaboration {
  id: string;
  _brandId: string;
  influencerId: string;
  type: 'sponsored-post' | 'product-review' | 'brand-ambassador' | 'event-appearance' | 'custom-campaign';
  status: 'proposed' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  deliverables: string[];
  compensation: {
    type: 'fixed' | 'commission' | 'product' | 'hybrid';
    amount: number;
    currency: string;
    commissionRate?: number;
  };
  requirements: {
    posts: number;
    platforms: string[];
    hashtags: string[];
    mentions: string[];
    contentGuidelines: string[];
  };
  performance: {
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
  };
  content: {
    posts: InfluencerPost[];
    analytics: PostAnalytics[];
  };
}

export interface InfluencerPost {
  id: string;
  _collaborationId: string;
  platform: string;
  postUrl: string;
  postType: 'image' | 'video' | 'story' | 'reel' | 'live';
  caption: string;
  hashtags: string[];
  mentions: string[];
  postDate: Date;
  performance: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    impressions: number;
  };
  approved: boolean;
  brandFeedback?: string;
}

export interface PostAnalytics {
  postId: string;
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
  audienceQuality: number;
  brandSafety: number;
}

export interface CampaignBrief {
  id: string;
  _brandId: string;
  title: string;
  description: string;
  objectives: string[];
  targetAudience: {
    ageRange: string;
    gender: string;
    interests: string[];
    location: string;
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    duration: number; // in days
  };
  requirements: {
    platforms: string[];
    postTypes: string[];
    contentGuidelines: string[];
    deliverables: string[];
  };
  compensation: {
    type: 'fixed' | 'commission' | 'product' | 'hybrid';
    baseAmount: number;
    bonusCriteria: string[];
  };
  status: 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled';
  applications: string[]; // influencer IDs
  selectedInfluencers: string[];
}

export class InfluencerMarketplaceSystem {
  private static instance: InfluencerMarketplaceSystem;
  private influencers: Map<string, InfluencerProfile> = new Map();
  private collaborations: Map<string, Collaboration[]> = new Map();
  private campaigns: Map<string, CampaignBrief[]> = new Map();
  private posts: Map<string, InfluencerPost[]> = new Map();

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): InfluencerMarketplaceSystem {
    if (!InfluencerMarketplaceSystem.instance) {
      InfluencerMarketplaceSystem.instance = new InfluencerMarketplaceSystem();
    }
    return InfluencerMarketplaceSystem.instance;
  }

  private initializeMockData(): void {
    // Mega Influencers
    this.influencers.set('kylie-jenner', {
      id: 'kylie-jenner',
      name: 'Kylie Jenner',
      username: '@kyliejenner',
      avatar: '/influencers/kylie-jenner.jpg',
      bio: 'Fashion icon and beauty mogul',
      category: 'fashion',
      tier: 'mega',
      followers: {
        instagram: 400000000,
        tiktok: 50000000,
        youtube: 20000000,
        twitter: 45000000,
        total: 515000000
      },
      engagement: {
        rate: 0.045,
        averageLikes: 18000000,
        averageComments: 500000,
        averageShares: 200000
      },
      demographics: {
        ageRange: '18-34',
        gender: 'female',
        location: 'Los Angeles, CA',
        interests: ['fashion', 'beauty', 'luxury', 'lifestyle']
      },
      brandCollaborations: 150,
      averageROI: 850,
      rating: 4.9,
      verified: true,
      availability: 'available',
      priceRange: {
        min: 500000,
        max: 2000000,
        currency: 'USD'
      }
    });

    // Macro Influencers
    this.influencers.set('fashion-influencer-x', {
      id: 'fashion-influencer-x',
      name: 'Sarah Chen',
      username: '@sarahchenfashion',
      avatar: '/influencers/sarah-chen.jpg',
      bio: 'Sustainable fashion advocate and style expert',
      category: 'fashion',
      tier: 'macro',
      followers: {
        instagram: 2500000,
        tiktok: 1800000,
        youtube: 800000,
        twitter: 500000,
        total: 5600000
      },
      engagement: {
        rate: 0.078,
        averageLikes: 195000,
        averageComments: 15000,
        averageShares: 8000
      },
      demographics: {
        ageRange: '25-40',
        gender: 'female',
        location: 'New York, NY',
        interests: ['sustainable-fashion', 'luxury', 'minimalism', 'travel']
      },
      brandCollaborations: 45,
      averageROI: 320,
      rating: 4.8,
      verified: true,
      availability: 'available',
      priceRange: {
        min: 15000,
        max: 50000,
        currency: 'USD'
      }
    });

    // Micro Influencers
    this.influencers.set('streetwear-king', {
      id: 'streetwear-king',
      name: 'Marcus Rodriguez',
      username: '@streetwearking',
      avatar: '/influencers/marcus-rodriguez.jpg',
      bio: 'Streetwear enthusiast and sneaker collector',
      category: 'streetwear',
      tier: 'micro',
      followers: {
        instagram: 85000,
        tiktok: 120000,
        youtube: 45000,
        twitter: 30000,
        total: 280000
      },
      engagement: {
        rate: 0.125,
        averageLikes: 10625,
        averageComments: 1200,
        averageShares: 500
      },
      demographics: {
        ageRange: '18-28',
        gender: 'male',
        location: 'Miami, FL',
        interests: ['streetwear', 'sneakers', 'hip-hop', 'urban-culture']
      },
      brandCollaborations: 12,
      averageROI: 180,
      rating: 4.7,
      verified: false,
      availability: 'available',
      priceRange: {
        min: 2000,
        max: 8000,
        currency: 'USD'
      }
    });
  }

  // Core Influencer Management
  public getInfluencer(influencerId: string): InfluencerProfile | null {
    return this.influencers.get(influencerId) || null;
  }

  public getAllInfluencers(): InfluencerProfile[] {
    return Array.from(this.influencers.values());
  }

  public getInfluencersByCategory(category: string): InfluencerProfile[] {
    return Array.from(this.influencers.values()).filter(influencer => influencer.category === category);
  }

  public getInfluencersByTier(tier: string): InfluencerProfile[] {
    return Array.from(this.influencers.values()).filter(influencer => influencer.tier === tier);
  }

  public searchInfluencers(query: string, filters?: {
    category?: string;
    tier?: string;
    minFollowers?: number;
    maxPrice?: number;
    location?: string;
    availability?: string;
  }): InfluencerProfile[] {
    let results = Array.from(this.influencers.values());

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(influencer => 
        influencer.name.toLowerCase().includes(searchTerm) ||
        influencer.username.toLowerCase().includes(searchTerm) ||
        influencer.bio.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(influencer => influencer.category === filters.category);
      }
      if (filters.tier) {
        results = results.filter(influencer => influencer.tier === filters.tier);
      }
      if (filters.minFollowers) {
        results = results.filter(influencer => influencer.followers.total >= filters.minFollowers!);
      }
      if (filters.maxPrice) {
        results = results.filter(influencer => influencer.priceRange.max <= filters.maxPrice!);
      }
      if (filters.location) {
        results = results.filter(influencer => 
          influencer.demographics.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.availability) {
        results = results.filter(influencer => influencer.availability === filters.availability);
      }
    }

    return results;
  }

  // AI-Powered Influencer Matching
  public getAIRecommendations(_brandId: string, campaignBrief: CampaignBrief): InfluencerProfile[] {
    const allInfluencers = Array.from(this.influencers.values());
    
    return allInfluencers
      .map(influencer => {
        let score = 0;
        
        // Category match
        if (influencer.category === campaignBrief.targetAudience.interests[0]) {
          score += 30;
        }
        
        // Audience match
        const ageMatch = this.calculateAgeMatch(influencer.demographics.ageRange, campaignBrief.targetAudience.ageRange);
        score += ageMatch * 20;
        
        // Engagement quality
        score += influencer.engagement.rate * 100;
        
        // ROI potential
        score += influencer.averageROI * 0.1;
        
        // Availability
        if (influencer.availability === 'available') {
          score += 15;
        }
        
        // Budget fit
        if (influencer.priceRange.max <= campaignBrief.budget.max) {
          score += 20;
        }
        
        // Rating
        score += influencer.rating * 5;
        
        return { influencer, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.influencer);
  }

  private calculateAgeMatch(influencerAge: string, targetAge: string): number {
    // Simple age range matching - in real app, this would be more sophisticated
    const influencerRange = influencerAge.split('-').map(Number);
    const targetRange = targetAge.split('-').map(Number);
    
    const overlap = Math.max(0, 
      Math.min(influencerRange[1], targetRange[1]) - Math.max(influencerRange[0], targetRange[0])
    );
    
    const totalRange = Math.max(influencerRange[1], targetRange[1]) - Math.min(influencerRange[0], targetRange[0]);
    
    return overlap / totalRange;
  }

  // Campaign Management
  public createCampaign(_brandId: string, campaign: CampaignBrief): boolean {
    if (!this.campaigns.has(_brandId)) {
      this.campaigns.set(_brandId, []);
    }

    this.campaigns.get(_brandId)!.push(campaign);
    return true;
  }

  public getBrandCampaigns(_brandId: string): CampaignBrief[] {
    return this.campaigns.get(_brandId) || [];
  }

  public getActiveCampaigns(_brandId: string): CampaignBrief[] {
    const campaigns = this.campaigns.get(_brandId) || [];
    const _now = new Date();
    return campaigns.filter(campaign => 
      campaign.status === 'published' || campaign.status === 'in-progress'
    );
  }

  public applyToCampaign(campaignId: string, influencerId: string): boolean {
    // Find campaign across all brands
    for (const [_brandId, campaignList] of this.campaigns) {
      const campaign = campaignList.find(c => c.id === campaignId);
      if (campaign && campaign.status === 'published') {
        if (!campaign.applications.includes(influencerId)) {
          campaign.applications.push(influencerId);
          return true;
        }
      }
    }
    return false;
  }

  // Collaboration Management
  public createCollaboration(_brandId: string, collaboration: Collaboration): boolean {
    if (!this.collaborations.has(_brandId)) {
      this.collaborations.set(_brandId, []);
    }

    this.collaborations.get(_brandId)!.push(collaboration);
    return true;
  }

  public getBrandCollaborations(_brandId: string): Collaboration[] {
    return this.collaborations.get(_brandId) || [];
  }

  public getInfluencerCollaborations(influencerId: string): Collaboration[] {
    const allCollaborations: Collaboration[] = [];
    for (const collaborationList of this.collaborations.values()) {
      allCollaborations.push(...collaborationList.filter(c => c.influencerId === influencerId));
    }
    return allCollaborations;
  }

  public updateCollaborationStatus(_collaborationId: string, status: string): boolean {
    for (const [_brandId, collaborationList] of this.collaborations) {
      const collaboration = collaborationList.find(c => c.id === _collaborationId);
      if (collaboration) {
        collaboration.status = status as any;
        return true;
      }
    }
    return false;
  }

  // Content Management
  public addInfluencerPost(_collaborationId: string, post: InfluencerPost): boolean {
    if (!this.posts.has(_collaborationId)) {
      this.posts.set(_collaborationId, []);
    }

    this.posts.get(_collaborationId)!.push(post);
    return true;
  }

  public getCollaborationPosts(_collaborationId: string): InfluencerPost[] {
    return this.posts.get(_collaborationId) || [];
  }

  public approvePost(postId: string, feedback?: string): boolean {
    for (const [_collaborationId, postList] of this.posts) {
      const post = postList.find(p => p.id === postId);
      if (post) {
        post.approved = true;
        if (feedback) {
          post.brandFeedback = feedback;
        }
        return true;
      }
    }
    return false;
  }

  // Performance Analytics
  public getCollaborationPerformance(_collaborationId: string): Record<string, unknown> {
    const collaboration = this.findCollaboration(_collaborationId);
    if (!collaboration) return null;

    const posts = this.getCollaborationPosts(_collaborationId);
    const totalImpressions = posts.reduce((sum, post) => sum + post.performance.impressions, 0);
    const totalEngagement = posts.reduce((sum, post) => sum + post.performance.engagement, 0);
    const totalClicks = posts.reduce((sum, post) => sum + post.performance.clicks, 0);
    const totalConversions = posts.reduce((sum, post) => sum + post.performance.conversions, 0);
    const totalRevenue = posts.reduce((sum, post) => sum + post.performance.revenue, 0);

    const cost = collaboration.compensation.amount;
    const roi = cost > 0 ? ((totalRevenue - cost) / cost) * 100 : 0;

    return {
      overview: {
        totalPosts: posts.length,
        totalImpressions,
        totalEngagement,
        totalClicks,
        totalConversions,
        totalRevenue,
        cost,
        roi
      },
      performance: {
        averageImpressions: totalImpressions / posts.length || 0,
        averageEngagement: totalEngagement / posts.length || 0,
        engagementRate: totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0,
        clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      },
      posts: posts.map(post => ({
        id: post.id,
        platform: post.platform,
        postType: post.postType,
        performance: post.performance,
        approved: post.approved
      }))
    };
  }

  private findCollaboration(_collaborationId: string): Collaboration | null {
    for (const collaborationList of this.collaborations.values()) {
      const collaboration = collaborationList.find(c => c.id === _collaborationId);
      if (collaboration) return collaboration;
    }
    return null;
  }

  // Marketplace Analytics
  public getMarketplaceAnalytics(): Record<string, unknown> {
    const totalInfluencers = this.influencers.size;
    const totalCollaborations = Array.from(this.collaborations.values())
      .reduce((sum, list) => sum + list.length, 0);
    const totalCampaigns = Array.from(this.campaigns.values())
      .reduce((sum, list) => sum + list.length, 0);

    const categoryBreakdown = new Map<string, number>();
    const tierBreakdown = new Map<string, number>();

    this.influencers.forEach(influencer => {
      categoryBreakdown.set(influencer.category, (categoryBreakdown.get(influencer.category) || 0) + 1);
      tierBreakdown.set(influencer.tier, (tierBreakdown.get(influencer.tier) || 0) + 1);
    });

    return {
      overview: {
        totalInfluencers,
        totalCollaborations,
        totalCampaigns,
        averageCollaborationValue: totalCollaborations > 0 ? 5000 : 0 // Mock average
      },
      influencers: {
        byCategory: Object.fromEntries(categoryBreakdown),
        byTier: Object.fromEntries(tierBreakdown),
        averageEngagement: Array.from(this.influencers.values())
          .reduce((sum, inf) => sum + inf.engagement.rate, 0) / totalInfluencers || 0,
        averageROI: Array.from(this.influencers.values())
          .reduce((sum, inf) => sum + inf.averageROI, 0) / totalInfluencers || 0
      },
      performance: {
        totalImpressions: totalCollaborations * 100000, // Mock data
        totalEngagement: totalCollaborations * 5000,
        averageROI: 320, // Mock average
        topPerformingCategory: 'fashion'
      }
    };
  }

  // Automated Campaign Optimization
  public optimizeCampaign(campaignId: string): Record<string, unknown> {
    // Find campaign
    let campaign: CampaignBrief | null = null;
    for (const campaignList of this.campaigns.values()) {
      campaign = campaignList.find(c => c.id === campaignId) || null;
      if (campaign) break;
    }

    if (!campaign) return null;

    // Get AI recommendations
    const recommendations = this.getAIRecommendations('brand-id', campaign);
    
    // Calculate optimal budget allocation
    const totalBudget = campaign.budget.max;
    const influencerCount = Math.min(recommendations.length, 5); // Max 5 influencers
    const budgetPerInfluencer = totalBudget / influencerCount;

    return {
      campaignId,
      recommendations: recommendations.slice(0, influencerCount),
      budgetAllocation: recommendations.slice(0, influencerCount).map(influencer => ({
        influencerId: influencer.id,
        name: influencer.name,
        recommendedBudget: budgetPerInfluencer,
        expectedROI: influencer.averageROI,
        expectedReach: influencer.followers.total * 0.1 // 10% reach assumption
      })),
      optimization: {
        totalExpectedReach: recommendations.slice(0, influencerCount)
          .reduce((sum, inf) => sum + inf.followers.total * 0.1, 0),
        totalExpectedROI: recommendations.slice(0, influencerCount)
          .reduce((sum, inf) => sum + inf.averageROI, 0) / influencerCount,
        costPerReach: totalBudget / (recommendations.slice(0, influencerCount)
          .reduce((sum, inf) => sum + inf.followers.total * 0.1, 0))
      }
    };
  }
}

// Export singleton instance
export const influencerMarketplaceSystem = InfluencerMarketplaceSystem.getInstance();

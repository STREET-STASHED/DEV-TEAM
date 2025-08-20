/**
 * Brand Onboarding System - Makes Brands Sign Up IMMEDIATELY
 * This system is so good, brands will be BEGGING to join
 */

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  estimatedTime: number; // in minutes
  benefits: string[];
  helpText: string;
}

export interface OnboardingProgress {
  _brandId: string;
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  estimatedTimeRemaining: number;
  completedSteps: string[];
  pendingSteps: string[];
  rewards: OnboardingReward[];
}

export interface OnboardingReward {
  id: string;
  name: string;
  description: string;
  type: 'commission-reduction' | 'featured-placement' | 'marketing-support' | 'analytics-access' | 'priority-support';
  value: string;
  unlocked: boolean;
  unlockCondition: string;
}

export interface BrandIncentive {
  id: string;
  name: string;
  description: string;
  type: 'signup-bonus' | 'early-adopter' | 'performance-based' | 'loyalty' | 'referral';
  value: number;
  currency: string;
  conditions: string[];
  expiryDate: Date;
  claimed: boolean;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedSetupTime: number;
  features: string[];
  commissionRate: number;
  marketingSupport: boolean;
  analyticsAccess: boolean;
  prioritySupport: boolean;
}

export class BrandOnboardingSystem {
  private static instance: BrandOnboardingSystem;
  private onboardingSteps: OnboardingStep[] = [];
  private progress: Map<string, OnboardingProgress> = new Map();
  private incentives: Map<string, BrandIncentive[]> = new Map();
  private templates: OnboardingTemplate[] = [];

  private constructor() {
    this.initializeOnboardingSteps();
    this.initializeTemplates();
    this.initializeIncentives();
  }

  public static getInstance(): BrandOnboardingSystem {
    if (!BrandOnboardingSystem.instance) {
      BrandOnboardingSystem.instance = new BrandOnboardingSystem();
    }
    return BrandOnboardingSystem.instance;
  }

  private initializeOnboardingSteps(): void {
    this.onboardingSteps = [
      {
        id: 'brand-profile',
        name: 'Brand Profile Setup',
        description: 'Create your brand profile with logo, description, and story',
        required: true,
        completed: false,
        estimatedTime: 5,
        benefits: [
          'Professional brand presence',
          'SEO optimization',
          'Customer trust building'
        ],
        helpText: 'Upload high-quality images and write compelling descriptions to attract customers'
      },
      {
        id: 'product-catalog',
        name: 'Product Catalog Setup',
        description: 'Upload your products with images, descriptions, and pricing',
        required: true,
        completed: false,
        estimatedTime: 15,
        benefits: [
          'Immediate sales potential',
          'Inventory management',
          'Customer discovery'
        ],
        helpText: 'Start with your best-selling products and gradually expand your catalog'
      },
      {
        id: 'payment-setup',
        name: 'Payment & Banking',
        description: 'Set up payment processing and bank account for payouts',
        required: true,
        completed: false,
        estimatedTime: 10,
        benefits: [
          'Secure payment processing',
          'Fast payouts',
          'Financial transparency'
        ],
        helpText: 'We use industry-leading payment processors for maximum security'
      },
      {
        id: 'shipping-config',
        name: 'Shipping Configuration',
        description: 'Configure shipping rates, zones, and delivery options',
        required: true,
        completed: false,
        estimatedTime: 8,
        benefits: [
          'Same-day delivery options',
          'Competitive shipping rates',
          'Customer satisfaction'
        ],
        helpText: 'Configure shipping to match your business model and customer expectations'
      },
      {
        id: 'ai-personalization',
        name: 'AI Personalization Setup',
        description: 'Configure AI stylist personality and recommendation settings',
        required: false,
        completed: false,
        estimatedTime: 12,
        benefits: [
          'Higher conversion rates',
          'Personalized customer experience',
          'Increased average order value'
        ],
        helpText: 'Let our AI help customers discover your products through personalized recommendations'
      },
      {
        id: 'marketing-tools',
        name: 'Marketing Tools Setup',
        description: 'Set up email campaigns, social media integration, and promotions',
        required: false,
        completed: false,
        estimatedTime: 20,
        benefits: [
          'Customer retention',
          'Brand awareness',
          'Sales growth'
        ],
        helpText: 'Use our advanced marketing tools to grow your customer base and increase sales'
      },
      {
        id: 'analytics-dashboard',
        name: 'Analytics Dashboard',
        description: 'Configure your analytics dashboard and reporting preferences',
        required: false,
        completed: false,
        estimatedTime: 8,
        benefits: [
          'Data-driven decisions',
          'Performance insights',
          'Growth optimization'
        ],
        helpText: 'Track your performance and optimize your business with real-time analytics'
      },
      {
        id: 'team-access',
        name: 'Team Access Setup',
        description: 'Invite team members and set up roles and permissions',
        required: false,
        completed: false,
        estimatedTime: 5,
        benefits: [
          'Collaborative workflow',
          'Role-based access',
          'Team efficiency'
        ],
        helpText: 'Invite your team members to help manage your store efficiently'
      }
    ];
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'luxury-boutique',
        name: 'Luxury Boutique',
        description: 'Perfect for high-end fashion, jewelry, and luxury accessories',
        category: 'luxury',
        estimatedSetupTime: 30,
        features: [
          'Premium storefront design',
          'VIP customer management',
          'Exclusive event hosting',
          'Personal stylist services',
          'Limited edition drops'
        ],
        commissionRate: 8.0,
        marketingSupport: true,
        analyticsAccess: true,
        prioritySupport: true
      },
      {
        id: 'streetwear-brand',
        name: 'Streetwear Brand',
        description: 'Ideal for contemporary streetwear and urban fashion',
        category: 'streetwear',
        estimatedSetupTime: 25,
        features: [
          'Trend-focused design',
          'Social media integration',
          'Influencer collaboration tools',
          'Limited quantity releases',
          'Community engagement'
        ],
        commissionRate: 10.0,
        marketingSupport: true,
        analyticsAccess: true,
        prioritySupport: false
      },
      {
        id: 'jewelry-artisan',
        name: 'Jewelry Artisan',
        description: 'Perfect for handmade jewelry and accessories',
        category: 'jewelry',
        estimatedSetupTime: 20,
        features: [
          'Handmade product showcase',
          'Custom design tools',
          'Storytelling features',
          'Quality assurance tools',
          'Customer testimonials'
        ],
        commissionRate: 12.0,
        marketingSupport: true,
        analyticsAccess: true,
        prioritySupport: false
      },
      {
        id: 'accessories-brand',
        name: 'Accessories Brand',
        description: 'Great for bags, shoes, and fashion accessories',
        category: 'accessories',
        estimatedSetupTime: 22,
        features: [
          'Product bundling tools',
          'Seasonal collections',
          'Size and fit guides',
          'Customer reviews',
          'Inventory management'
        ],
        commissionRate: 11.0,
        marketingSupport: true,
        analyticsAccess: true,
        prioritySupport: false
      }
    ];
  }

  private initializeIncentives(): void {
    this.incentives.set('new-signup', [
      {
        id: 'signup-bonus-1',
        name: 'Welcome Bonus',
        description: 'Get $500 in marketing credits when you complete onboarding',
        type: 'signup-bonus',
        value: 500,
        currency: 'USD',
        conditions: ['Complete all required onboarding steps', 'Upload minimum 10 products'],
        expiryDate: new Date('2024-12-31'),
        claimed: false
      },
      {
        id: 'early-adopter-1',
        name: 'Early Adopter Discount',
        description: '50% off commission rates for the first 3 months',
        type: 'early-adopter',
        value: 50,
        currency: 'PERCENT',
        conditions: ['Sign up within first 30 days of platform launch'],
        expiryDate: new Date('2024-06-30'),
        claimed: false
      },
      {
        id: 'performance-1',
        name: 'Performance Bonus',
        description: 'Earn up to $2000 in bonuses based on first month sales',
        type: 'performance-based',
        value: 2000,
        currency: 'USD',
        conditions: ['Achieve $10,000 in first month sales', 'Maintain 4.5+ rating'],
        expiryDate: new Date('2024-12-31'),
        claimed: false
      }
    ]);
  }

  // Core Onboarding Management
  public startOnboarding(_brandId: string, templateId?: string): OnboardingProgress {
    const template = templateId ? this.templates.find(t => t.id === templateId) : null;
    
    const progress: OnboardingProgress = {
      _brandId,
      currentStep: 0,
      totalSteps: this.onboardingSteps.length,
      completionPercentage: 0,
      estimatedTimeRemaining: this.onboardingSteps.reduce((sum, step) => sum + step.estimatedTime, 0),
      completedSteps: [],
      pendingSteps: this.onboardingSteps.map(step => step.id),
      rewards: this.generateRewards(_brandId, template)
    };

    this.progress.set(_brandId, progress);
    return progress;
  }

  public getOnboardingProgress(_brandId: string): OnboardingProgress | null {
    return this.progress.get(_brandId) || null;
  }

  public completeStep(_brandId: string, stepId: string): { success: boolean; message: string; progress: OnboardingProgress } {
    const progress = this.progress.get(_brandId);
    if (!progress) {
      return { success: false, message: 'Onboarding not started', progress: null as any };
    }

    const step = this.onboardingSteps.find(s => s.id === stepId);
    if (!step) {
      return { success: false, message: 'Step not found', progress };
    }

    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
      progress.pendingSteps = progress.pendingSteps.filter(id => id !== stepId);
      progress.completionPercentage = (progress.completedSteps.length / progress.totalSteps) * 100;
      
      // Update estimated time remaining
      progress.estimatedTimeRemaining = this.onboardingSteps
        .filter(s => progress.pendingSteps.includes(s.id))
        .reduce((sum, s) => sum + s.estimatedTime, 0);

      // Check for rewards
      this.checkAndUnlockRewards(_brandId, progress);
    }

    return { success: true, message: 'Step completed successfully', progress };
  }

  public getCurrentStep(_brandId: string): OnboardingStep | null {
    const progress = this.progress.get(_brandId);
    if (!progress) return null;

    const nextStep = this.onboardingSteps.find(step => 
      progress.pendingSteps.includes(step.id)
    );

    return nextStep || null;
  }

  public getNextSteps(_brandId: string, count: number = 3): OnboardingStep[] {
    const progress = this.progress.get(_brandId);
    if (!progress) return [];

    return this.onboardingSteps
      .filter(step => progress.pendingSteps.includes(step.id))
      .slice(0, count);
  }

  // Template Management
  public getOnboardingTemplates(): OnboardingTemplate[] {
    return this.templates;
  }

  public getTemplateByCategory(category: string): OnboardingTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  public getTemplateById(templateId: string): OnboardingTemplate | null {
    return this.templates.find(template => template.id === templateId) || null;
  }

  // Incentive Management
  public getBrandIncentives(_brandId: string): BrandIncentive[] {
    return this.incentives.get('new-signup') || [];
  }

  public claimIncentive(_brandId: string, incentiveId: string): { success: boolean; message: string } {
    const incentives = this.incentives.get('new-signup') || [];
    const incentive = incentives.find(i => i.id === incentiveId);

    if (!incentive) {
      return { success: false, message: 'Incentive not found' };
    }

    if (incentive.claimed) {
      return { success: false, message: 'Incentive already claimed' };
    }

    if (incentive.expiryDate < new Date()) {
      return { success: false, message: 'Incentive has expired' };
    }

    // Check if conditions are met
    const progress = this.progress.get(_brandId);
    if (!progress) {
      return { success: false, message: 'Onboarding not started' };
    }

    // Simple condition checking - in real app, this would be more sophisticated
    if (incentive.conditions.some(condition => condition.includes('complete all required steps'))) {
      const requiredSteps = this.onboardingSteps.filter(step => step.required);
      const completedRequiredSteps = requiredSteps.filter(step => 
        progress.completedSteps.includes(step.id)
      );
      
      if (completedRequiredSteps.length < requiredSteps.length) {
        return { success: false, message: 'Requirements not met yet' };
      }
    }

    incentive.claimed = true;
    return { success: true, message: `Successfully claimed ${incentive.name}` };
  }

  // Reward System
  private generateRewards(_brandId: string, template: OnboardingTemplate | null): OnboardingReward[] {
    const rewards: OnboardingReward[] = [
      {
        id: 'reward-1',
        name: 'Commission Reduction',
        description: 'Get 2% off commission rates for completing onboarding',
        type: 'commission-reduction',
        value: '2% off commission',
        unlocked: false,
        unlockCondition: 'Complete all required onboarding steps'
      },
      {
        id: 'reward-2',
        name: 'Featured Placement',
        description: 'Get featured placement in search results for 1 week',
        type: 'featured-placement',
        value: '1 week featured placement',
        unlocked: false,
        unlockCondition: 'Complete onboarding and upload 20+ products'
      },
      {
        id: 'reward-3',
        name: 'Marketing Support',
        description: 'Get $200 in marketing credits',
        type: 'marketing-support',
        value: '$200 marketing credits',
        unlocked: false,
        unlockCondition: 'Complete onboarding within 7 days'
      },
      {
        id: 'reward-4',
        name: 'Analytics Access',
        description: 'Get advanced analytics dashboard access',
        type: 'analytics-access',
        value: 'Advanced analytics',
        unlocked: false,
        unlockCondition: 'Complete onboarding and maintain 4.5+ rating'
      },
      {
        id: 'reward-5',
        name: 'Priority Support',
        description: 'Get priority customer support access',
        type: 'priority-support',
        value: 'Priority support',
        unlocked: false,
        unlockCondition: 'Complete onboarding and achieve $1000+ in sales'
      }
    ];

    // Apply template-specific rewards
    if (template) {
      if (template.commissionRate <= 10) {
        rewards.push({
          id: 'reward-template',
          name: 'Premium Tier Benefits',
          description: `Access to ${template.name} template benefits`,
          type: 'commission-reduction',
          value: `${template.commissionRate}% commission rate`,
          unlocked: false,
          unlockCondition: 'Complete onboarding with this template'
        });
      }
    }

    return rewards;
  }

  private checkAndUnlockRewards(_brandId: string, progress: OnboardingProgress): void {
    const requiredSteps = this.onboardingSteps.filter(step => step.required);
    const completedRequiredSteps = requiredSteps.filter(step => 
      progress.completedSteps.includes(step.id)
    );

    // Unlock commission reduction reward
    if (completedRequiredSteps.length === requiredSteps.length) {
      const commissionReward = progress.rewards.find(r => r.id === 'reward-1');
      if (commissionReward) {
        commissionReward.unlocked = true;
      }
    }

    // Unlock featured placement reward
    if (progress.completedSteps.length >= 5) {
      const featuredReward = progress.rewards.find(r => r.id === 'reward-2');
      if (featuredReward) {
        featuredReward.unlocked = true;
      }
    }

    // Unlock marketing support reward
    const onboardingStartDate = new Date(); // In real app, this would be stored
    const daysSinceStart = (Date.now() - onboardingStartDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart <= 7 && progress.completionPercentage >= 80) {
      const marketingReward = progress.rewards.find(r => r.id === 'reward-3');
      if (marketingReward) {
        marketingReward.unlocked = true;
      }
    }
  }

  // Onboarding Analytics
  public getOnboardingAnalytics(): Record<string, unknown> {
    const totalBrands = this.progress.size;
    const completedOnboarding = Array.from(this.progress.values()).filter(p => p.completionPercentage === 100).length;
    const averageCompletionTime = Array.from(this.progress.values())
      .filter(p => p.completionPercentage === 100)
      .reduce((sum, p) => sum + (p.estimatedTimeRemaining || 0), 0) / completedOnboarding || 0;

    return {
      overview: {
        totalBrands,
        completedOnboarding,
        inProgress: totalBrands - completedOnboarding,
        completionRate: (completedOnboarding / totalBrands) * 100 || 0
      },
      performance: {
        averageCompletionTime: Math.round(averageCompletionTime),
        averageStepsCompleted: Array.from(this.progress.values())
          .reduce((sum, p) => sum + p.completedSteps.length, 0) / totalBrands || 0,
        mostCompletedStep: this.getMostCompletedStep(),
        leastCompletedStep: this.getLeastCompletedStep()
      },
      templates: {
        usage: this.templates.map(template => ({
          name: template.name,
          usage: Array.from(this.progress.values()).filter(p => 
            p.rewards.some(r => r.name.includes(template.name))
          ).length
        }))
      }
    };
  }

  private getMostCompletedStep(): string {
    const stepCounts = new Map<string, number>();
    
    this.onboardingSteps.forEach(step => {
      stepCounts.set(step.id, 0);
    });

    Array.from(this.progress.values()).forEach(progress => {
      progress.completedSteps.forEach(stepId => {
        stepCounts.set(stepId, (stepCounts.get(stepId) || 0) + 1);
      });
    });

    let mostCompleted = '';
    let maxCount = 0;
    
    stepCounts.forEach((count, stepId) => {
      if (count > maxCount) {
        maxCount = count;
        mostCompleted = stepId;
      }
    });

    return mostCompleted;
  }

  private getLeastCompletedStep(): string {
    const stepCounts = new Map<string, number>();
    
    this.onboardingSteps.forEach(step => {
      stepCounts.set(step.id, 0);
    });

    Array.from(this.progress.values()).forEach(progress => {
      progress.completedSteps.forEach(stepId => {
        stepCounts.set(stepId, (stepCounts.get(stepId) || 0) + 1);
      });
    });

    let leastCompleted = '';
    let minCount = Infinity;
    
    stepCounts.forEach((count, stepId) => {
      if (count < minCount) {
        minCount = count;
        leastCompleted = stepId;
      }
    });

    return leastCompleted;
  }

  // Quick Start Features
  public getQuickStartGuide(_brandId: string): Record<string, unknown> {
    const progress = this.progress.get(_brandId);
    if (!progress) return null;

    const currentStep = this.getCurrentStep(_brandId);
    const nextSteps = this.getNextSteps(_brandId, 3);

    return {
      currentStep: currentStep ? {
        ...currentStep,
        estimatedTime: currentStep.estimatedTime,
        tips: this.getStepTips(currentStep.id)
      } : null,
      nextSteps: nextSteps.map(step => ({
        ...step,
        estimatedTime: step.estimatedTime,
        tips: this.getStepTips(step.id)
      })),
      shortcuts: this.getQuickShortcuts(_brandId),
      estimatedTotalTime: progress.estimatedTimeRemaining,
      completionPercentage: progress.completionPercentage
    };
  }

  private getStepTips(stepId: string): string[] {
    const tips: Record<string, string[]> = {
      'brand-profile': [
        'Use high-quality, professional images',
        'Write compelling brand story',
        'Include your unique selling points',
        'Add social media links'
      ],
      'product-catalog': [
        'Start with your best-selling products',
        'Use professional product photography',
        'Write detailed, SEO-friendly descriptions',
        'Set competitive pricing'
      ],
      'payment-setup': [
        'Have your business documents ready',
        'Use a business bank account',
        'Verify your identity quickly',
        'Set up multiple payment methods'
      ]
    };

    return tips[stepId] || ['Take your time and do it right', 'Quality over speed'];
  }

  private getQuickShortcuts(_brandId: string): any[] {
    return [
      {
        name: 'Bulk Product Upload',
        description: 'Upload multiple products at once using CSV',
        timeSaved: 'Save 2-3 hours',
        available: true
      },
      {
        name: 'Template Store Setup',
        description: 'Use pre-designed store templates',
        timeSaved: 'Save 1-2 hours',
        available: true
      },
      {
        name: 'AI Content Generation',
        description: 'Generate product descriptions with AI',
        timeSaved: 'Save 30-60 minutes',
        available: true
      }
    ];
  }
}

// Export singleton instance
export const brandOnboardingSystem = BrandOnboardingSystem.getInstance();

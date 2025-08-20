/**
 * Brand Exclusivity System - Creates Scarcity and Premium Feel
 * Makes brands feel like they're part of an exclusive club
 */

export interface ExclusiveAccess {
  id: string;
  _brandId: string;
  type: 'early-access' | 'vip-sale' | 'limited-edition' | 'custom-design' | 'personal-styling';
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  requirements: {
    minSpend: number;
    loyaltyLevel: number;
    invitationOnly: boolean;
    brandFollowing: boolean;
  };
  benefits: {
    discount: number;
    freeShipping: boolean;
    prioritySupport: boolean;
    exclusiveContent: boolean;
    meetAndGreet: boolean;
  };
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface BrandInvitation {
  id: string;
  _brandId: string;
  inviteeEmail: string;
  inviteeName: string;
  invitationType: 'vip-customer' | 'influencer' | 'celebrity' | 'press' | 'partner';
  status: 'sent' | 'accepted' | 'declined' | 'expired';
  sentDate: Date;
  expiresDate: Date;
  acceptedDate?: Date;
  specialCode: string;
  benefits: string[];
}

export interface ExclusiveEvent {
  id: string;
  _brandId: string;
  name: string;
  description: string;
  type: 'fashion-show' | 'product-launch' | 'meet-and-greet' | 'private-sale' | 'brand-party';
  date: Date;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  ticketPrice: number;
  invitationOnly: boolean;
  specialGuests: string[];
  exclusivityLevel: 'ultra-exclusive' | 'very-exclusive' | 'exclusive' | 'semi-exclusive';
}

export interface BrandPartnership {
  id: string;
  _brandId: string;
  partnerType: 'influencer' | 'celebrity' | 'other-brand' | 'charity' | 'event';
  partnerName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  exclusivity: 'exclusive' | 'non-exclusive';
  revenueShare: number;
  marketingSupport: boolean;
  coBranding: boolean;
  status: 'active' | 'planned' | 'completed' | 'cancelled';
}

export class BrandExclusivitySystem {
  private static instance: BrandExclusivitySystem;
  private exclusiveAccess: Map<string, ExclusiveAccess[]> = new Map();
  private invitations: Map<string, BrandInvitation[]> = new Map();
  private events: Map<string, ExclusiveEvent[]> = new Map();
  private partnerships: Map<string, BrandPartnership[]> = new Map();

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): BrandExclusivitySystem {
    if (!BrandExclusivitySystem.instance) {
      BrandExclusivitySystem.instance = new BrandExclusivitySystem();
    }
    return BrandExclusivitySystem.instance;
  }

  private initializeMockData(): void {
    // Initialize exclusive access for luxury brands
    this.exclusiveAccess.set('gucci', [
      {
        id: 'gucci-vip-1',
        _brandId: 'gucci',
        type: 'early-access',
        name: 'Gucci VIP Early Access',
        description: 'Exclusive 48-hour early access to new collections before public release',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-12-31'),
        maxParticipants: 1000,
        currentParticipants: 750,
        requirements: {
          minSpend: 5000,
          loyaltyLevel: 5,
          invitationOnly: true,
          brandFollowing: true
        },
        benefits: {
          discount: 15,
          freeShipping: true,
          prioritySupport: true,
          exclusiveContent: true,
          meetAndGreet: false
        },
        status: 'active'
      },
      {
        id: 'gucci-limited-1',
        _brandId: 'gucci',
        type: 'limited-edition',
        name: 'Gucci Artisan Collection',
        description: 'Handcrafted limited edition pieces by master artisans',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        maxParticipants: 100,
        currentParticipants: 45,
        requirements: {
          minSpend: 10000,
          loyaltyLevel: 7,
          invitationOnly: true,
          brandFollowing: true
        },
        benefits: {
          discount: 0,
          freeShipping: true,
          prioritySupport: true,
          exclusiveContent: true,
          meetAndGreet: true
        },
        status: 'active'
      }
    ]);

    // Initialize exclusive events
    this.events.set('gucci', [
      {
        id: 'gucci-event-1',
        _brandId: 'gucci',
        name: 'Gucci Milan Fashion Week Experience',
        description: 'Exclusive front-row access to Gucci\'s Milan Fashion Week show',
        type: 'fashion-show',
        date: new Date('2024-09-20'),
        location: 'Milan, Italy',
        maxAttendees: 50,
        currentAttendees: 25,
        ticketPrice: 5000,
        invitationOnly: true,
        specialGuests: ['Alessandro Michele', 'Celebrity Guest 1', 'Celebrity Guest 2'],
        exclusivityLevel: 'ultra-exclusive'
      }
    ]);

    // Initialize partnerships
    this.partnerships.set('gucci', [
      {
        id: 'gucci-partnership-1',
        _brandId: 'gucci',
        partnerType: 'influencer',
        partnerName: 'Fashion Influencer X',
        description: 'Exclusive collaboration for sustainable fashion campaign',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        exclusivity: 'exclusive',
        revenueShare: 20,
        marketingSupport: true,
        coBranding: true,
        status: 'active'
      }
    ]);
  }

  // Exclusive Access Management
  public createExclusiveAccess(_brandId: string, access: ExclusiveAccess): boolean {
    if (!this.exclusiveAccess.has(_brandId)) {
      this.exclusiveAccess.set(_brandId, []);
    }

    this.exclusiveAccess.get(_brandId)!.push(access);
    return true;
  }

  public getBrandExclusiveAccess(_brandId: string): ExclusiveAccess[] {
    return this.exclusiveAccess.get(_brandId) || [];
  }

  public getActiveExclusiveAccess(_brandId: string): ExclusiveAccess[] {
    const access = this.exclusiveAccess.get(_brandId) || [];
    const now = new Date();
    return access.filter(a => 
      a.status === 'active' && 
      a.startDate <= now && 
      a.endDate >= now
    );
  }

  public joinExclusiveAccess(accessId: string, _userId: string): { success: boolean; message: string } {
    // Find the access across all brands
    for (const [_brandId, accessList] of this.exclusiveAccess) {
      const access = accessList.find(a => a.id === accessId);
      if (access) {
        if (access.currentParticipants >= access.maxParticipants) {
          return { success: false, message: 'This exclusive access is full' };
        }
        
        if (access.status !== 'active') {
          return { success: false, message: 'This exclusive access is not active' };
        }

        access.currentParticipants++;
        return { success: true, message: 'Successfully joined exclusive access' };
      }
    }

    return { success: false, message: 'Exclusive access not found' };
  }

  // Invitation Management
  public sendInvitation(_brandId: string, invitation: BrandInvitation): boolean {
    if (!this.invitations.has(_brandId)) {
      this.invitations.set(_brandId, []);
    }

    this.invitations.get(_brandId)!.push(invitation);
    return true;
  }

  public getBrandInvitations(_brandId: string): BrandInvitation[] {
    return this.invitations.get(_brandId) || [];
  }

  public acceptInvitation(invitationId: string): boolean {
    for (const [_brandId, invitationList] of this.invitations) {
      const invitation = invitationList.find(i => i.id === invitationId);
      if (invitation && invitation.status === 'sent') {
        invitation.status = 'accepted';
        invitation.acceptedDate = new Date();
        return true;
      }
    }
    return false;
  }

  // Event Management
  public createExclusiveEvent(_brandId: string, event: ExclusiveEvent): boolean {
    if (!this.events.has(_brandId)) {
      this.events.set(_brandId, []);
    }

    this.events.get(_brandId)!.push(event);
    return true;
  }

  public getBrandEvents(_brandId: string): ExclusiveEvent[] {
    return this.events.get(_brandId) || [];
  }

  public getUpcomingEvents(_brandId: string): ExclusiveEvent[] {
    const events = this.events.get(_brandId) || [];
    const now = new Date();
    return events.filter(e => e.date > now).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  public registerForEvent(eventId: string, _userId: string): { success: boolean; message: string } {
    for (const [_brandId, eventList] of this.events) {
      const event = eventList.find(e => e.id === eventId);
      if (event) {
        if (event.currentAttendees >= event.maxAttendees) {
          return { success: false, message: 'Event is full' };
        }

        if (event.date <= new Date()) {
          return { success: false, message: 'Event has already passed' };
        }

        event.currentAttendees++;
        return { success: true, message: 'Successfully registered for event' };
      }
    }

    return { success: false, message: 'Event not found' };
  }

  // Partnership Management
  public createPartnership(_brandId: string, partnership: BrandPartnership): boolean {
    if (!this.partnerships.has(_brandId)) {
      this.partnerships.set(_brandId, []);
    }

    this.partnerships.get(_brandId)!.push(partnership);
    return true;
  }

  public getBrandPartnerships(_brandId: string): BrandPartnership[] {
    return this.partnerships.get(_brandId) || [];
  }

  public getActivePartnerships(_brandId: string): BrandPartnership[] {
    const partnerships = this.partnerships.get(_brandId) || [];
    return partnerships.filter(p => p.status === 'active');
  }

  // Exclusivity Analytics
  public getExclusivityMetrics(_brandId: string): Record<string, unknown> {
    const access = this.exclusiveAccess.get(_brandId) || [];
    const events = this.events.get(_brandId) || [];
    const partnerships = this.partnerships.get(_brandId) || [];

    const totalAccess = access.length;
    const activeAccess = access.filter(a => a.status === 'active').length;
    const totalParticipants = access.reduce((sum, a) => sum + a.currentParticipants, 0);
    const maxParticipants = access.reduce((sum, a) => sum + a.maxParticipants, 0);

    const upcomingEvents = events.filter(e => e.date > new Date()).length;
    const totalEventAttendees = events.reduce((sum, e) => sum + e.currentAttendees, 0);
    const maxEventAttendees = events.reduce((sum, e) => sum + e.maxAttendees, 0);

    const activePartnerships = partnerships.filter(p => p.status === 'active').length;
    const exclusivePartnerships = partnerships.filter(p => p.exclusivity === 'exclusive').length;

    return {
      access: {
        total: totalAccess,
        active: activeAccess,
        participationRate: totalParticipants / maxParticipants,
        averageParticipants: totalParticipants / totalAccess || 0
      },
      events: {
        upcoming: upcomingEvents,
        total: events.length,
        attendanceRate: totalEventAttendees / maxEventAttendees,
        averageAttendees: totalEventAttendees / events.length || 0
      },
      partnerships: {
        total: partnerships.length,
        active: activePartnerships,
        exclusive: exclusivePartnerships,
        exclusivityRate: exclusivePartnerships / partnerships.length || 0
      },
      overall: {
        exclusivityScore: Math.min(100, (activeAccess * 20) + (upcomingEvents * 15) + (exclusivePartnerships * 25)),
        engagementLevel: totalParticipants + totalEventAttendees,
        premiumFeel: (totalAccess + events.length + partnerships.length) * 10
      }
    };
  }

  // Platform Exclusivity Features
  public getPlatformExclusivityFeatures(): Record<string, unknown> {
    return {
      features: [
        {
          name: 'Brand Tier System',
          description: 'Exclusive tiers with decreasing commission rates and increasing benefits',
          exclusivity: 'High'
        },
        {
          name: 'VIP Customer Access',
          description: 'Exclusive early access and special events for high-value customers',
          exclusivity: 'Very High'
        },
        {
          name: 'Limited Edition Drops',
          description: 'Exclusive product releases with limited quantities',
          exclusivity: 'Ultra High'
        },
        {
          name: 'Celebrity Collaborations',
          description: 'Exclusive partnerships with A-list celebrities and influencers',
          exclusivity: 'Ultra High'
        },
        {
          name: 'Private Events',
          description: 'Exclusive fashion shows, launches, and meet-and-greets',
          exclusivity: 'Very High'
        },
        {
          name: 'Custom Design Services',
          description: 'Exclusive access to custom design and personalization services',
          exclusivity: 'Ultra High'
        }
      ],
      benefits: {
        brandRetention: '95%+ retention rate for exclusive brands',
        customerLoyalty: '3x higher customer lifetime value',
        marketPositioning: 'Premium positioning in the market',
        competitiveAdvantage: 'Unique features not available elsewhere',
        revenueGrowth: '40%+ higher revenue per brand'
      }
    };
  }

  // Create Scarcity and FOMO
  public createScarcity(_brandId: string): Record<string, unknown> {
    const access = this.getActiveExclusiveAccess(_brandId);
    const events = this.getUpcomingEvents(_brandId);
    
    const limitedAccess = access.filter(a => 
      a.currentParticipants >= a.maxParticipants * 0.8
    );
    
    const almostFullEvents = events.filter(e => 
      e.currentAttendees >= e.maxAttendees * 0.9
    );

    return {
      scarcity: {
        limitedAccess: limitedAccess.length,
        almostFullEvents: almostFullEvents.length,
        totalScarcity: limitedAccess.length + almostFullEvents.length
      },
      fomoTriggers: [
        ...limitedAccess.map(a => `${a.name} is ${Math.round((a.currentParticipants / a.maxParticipants) * 100)}% full!`),
        ...almostFullEvents.map(e => `${e.name} is almost sold out!`)
      ],
      urgency: {
        level: limitedAccess.length + almostFullEvents.length > 0 ? 'high' : 'normal',
        message: limitedAccess.length + almostFullEvents.length > 0 
          ? 'Limited availability - act fast!' 
          : 'Plenty of availability'
      }
    };
  }
}

// Export singleton instance
export const brandExclusivitySystem = BrandExclusivitySystem.getInstance();

/**
 * AI-Powered Auto-Approval System
 * Phase 2: Smart Automation for Instant Onboarding
 */

export interface ApprovalCriteria {
  role: 'seller' | 'stylist' | 'driver'
  riskScore: number
  confidence: number
  autoApprove: boolean
  conditions: string[]
  verificationLevel: 'basic' | 'standard' | 'premium'
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: string
  phone?: string
  businessName?: string
  vehicleType?: string
  experience?: number
  documents?: {
    idVerified: boolean
    businessLicense?: boolean
    license?: boolean
    insurance?: boolean
    backgroundCheck?: boolean
  }
  socialProof?: {
    linkedin?: string
    instagram?: string
    website?: string
    portfolio?: string
    followers?: number
  }
}

export interface ApprovalResult {
  approved: boolean
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  verificationRequired: string[]
  autoApprovedFeatures: string[]
  restrictions: string[]
  nextSteps: string[]
  estimatedApprovalTime: string
}

export class AutoApprovalSystem {
  private static instance: AutoApprovalSystem
  private approvalRules: Map<string, ApprovalCriteria> = new Map()

  private constructor() {
    this.initializeApprovalRules()
  }

  public static getInstance(): AutoApprovalSystem {
    if (!AutoApprovalSystem.instance) {
      AutoApprovalSystem.instance = new AutoApprovalSystem()
    }
    return AutoApprovalSystem.instance
  }

  private initializeApprovalRules(): void {
    // Seller Auto-Approval Rules
    this.approvalRules.set('seller', {
      role: 'seller',
      riskScore: 0.3, // 30% risk threshold
      confidence: 0.8, // 80% confidence required
      autoApprove: true,
      conditions: [
        'email_verified',
        'phone_verified',
        'business_name_provided',
        'stripe_account_created'
      ],
      verificationLevel: 'standard'
    })

    // Stylist Auto-Approval Rules
    this.approvalRules.set('stylist', {
      role: 'stylist',
      riskScore: 0.2, // 20% risk threshold (lower risk)
      confidence: 0.75, // 75% confidence required
      autoApprove: true,
      conditions: [
        'email_verified',
        'portfolio_uploaded',
        'specialties_selected',
        'pricing_configured'
      ],
      verificationLevel: 'basic'
    })

    // Driver Auto-Approval Rules
    this.approvalRules.set('driver', {
      role: 'driver',
      riskScore: 0.4, // 40% risk threshold (higher risk)
      confidence: 0.85, // 85% confidence required
      autoApprove: true,
      conditions: [
        'email_verified',
        'phone_verified',
        'license_verified',
        'insurance_verified',
        'background_check_passed'
      ],
      verificationLevel: 'premium'
    })
  }

  /**
   * Analyze user profile and determine auto-approval eligibility
   */
  async analyzeUserProfile(userProfile: UserProfile): Promise<ApprovalResult> {
    const rules = this.approvalRules.get(userProfile.role)
    if (!rules) {
      throw new Error(`No approval rules found for role: ${userProfile.role}`)
    }

    // Calculate risk score
    const riskScore = await this.calculateRiskScore(userProfile)
    
    // Calculate confidence score
    const confidence = await this.calculateConfidenceScore(userProfile)
    
    // Determine approval status
    const approved = riskScore <= rules.riskScore && confidence >= rules.confidence
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore)
    
    // Generate verification requirements
    const verificationRequired = this.getVerificationRequirements(userProfile, rules)
    
    // Determine auto-approved features
    const autoApprovedFeatures = this.getAutoApprovedFeatures(userProfile, approved)
    
    // Generate restrictions
    const restrictions = this.generateRestrictions(userProfile, riskLevel)
    
    // Generate next steps
    const nextSteps = this.generateNextSteps(userProfile, approved, verificationRequired)
    
    // Estimate approval time
    const estimatedApprovalTime = this.estimateApprovalTime(verificationRequired, approved)

    return {
      approved,
      confidence,
      riskLevel,
      verificationRequired,
      autoApprovedFeatures,
      restrictions,
      nextSteps,
      estimatedApprovalTime
    }
  }

  /**
   * Calculate risk score based on user profile
   */
  private async calculateRiskScore(profile: UserProfile): Promise<number> {
    let riskScore = 0.5 // Base risk score

    // Email verification reduces risk
    if (profile.email && profile.email.includes('@')) {
      riskScore -= 0.1
    }

    // Phone verification reduces risk
    if (profile.phone) {
      riskScore -= 0.1
    }

    // Business name reduces risk for sellers
    if (profile.role === 'seller' && profile.businessName) {
      riskScore -= 0.15
    }

    // Experience reduces risk
    if (profile.experience && profile.experience > 0) {
      riskScore -= (profile.experience * 0.02) // 2% per year of experience
    }

    // Social proof reduces risk
    if (profile.socialProof) {
      if (profile.socialProof.linkedin) riskScore -= 0.1
      if (profile.socialProof.website) riskScore -= 0.1
      if (profile.socialProof.followers && profile.socialProof.followers > 1000) {
        riskScore -= 0.15
      }
    }

    // Document verification reduces risk
    if (profile.documents) {
      if (profile.documents.idVerified) riskScore -= 0.1
      if (profile.documents.businessLicense) riskScore -= 0.1
      if (profile.documents.insurance) riskScore -= 0.1
      if (profile.documents.backgroundCheck) riskScore -= 0.15
    }

    // Role-specific risk adjustments
    switch (profile.role) {
      case 'seller':
        // Sellers have moderate risk
        break
      case 'stylist':
        // Stylists have lower risk
        riskScore -= 0.1
        break
      case 'driver':
        // Drivers have higher risk due to safety concerns
        riskScore += 0.1
        break
    }

    return Math.max(0, Math.min(1, riskScore)) // Clamp between 0 and 1
  }

  /**
   * Calculate confidence score based on profile completeness
   */
  private async calculateConfidenceScore(profile: UserProfile): Promise<number> {
    let confidence = 0

    // Basic information (40% of confidence)
    if (profile.fullName) confidence += 0.1
    if (profile.email) confidence += 0.1
    if (profile.phone) confidence += 0.1
    if (profile.role) confidence += 0.1

    // Role-specific information (40% of confidence)
    switch (profile.role) {
      case 'seller':
        if (profile.businessName) confidence += 0.2
        if (profile.documents?.businessLicense) confidence += 0.2
        break
      case 'stylist':
        if (profile.experience && profile.experience > 0) confidence += 0.2
        if (profile.socialProof?.portfolio) confidence += 0.2
        break
      case 'driver':
        if (profile.vehicleType) confidence += 0.1
        if (profile.documents?.license) confidence += 0.15
        if (profile.documents?.insurance) confidence += 0.15
        break
    }

    // Verification status (20% of confidence)
    if (profile.documents?.idVerified) confidence += 0.1
    if (profile.documents?.backgroundCheck) confidence += 0.1

    return Math.min(1, confidence)
  }

  /**
   * Determine risk level based on risk score
   */
  private determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
    if (riskScore <= 0.3) return 'low'
    if (riskScore <= 0.6) return 'medium'
    return 'high'
  }

  /**
   * Get verification requirements based on role and risk level
   */
  private getVerificationRequirements(profile: UserProfile, rules: ApprovalCriteria): string[] {
    const requirements: string[] = []

    // Basic requirements for all roles
    requirements.push('email_verification')
    requirements.push('phone_verification')

    // Role-specific requirements
    switch (profile.role) {
      case 'seller':
        requirements.push('business_verification')
        requirements.push('payment_setup')
        if (rules.verificationLevel === 'premium') {
          requirements.push('tax_document_verification')
        }
        break
      case 'stylist':
        requirements.push('portfolio_review')
        requirements.push('skill_assessment')
        break
      case 'driver':
        requirements.push('license_verification')
        requirements.push('insurance_verification')
        requirements.push('background_check')
        requirements.push('vehicle_inspection')
        break
    }

    return requirements
  }

  /**
   * Get auto-approved features based on approval status
   */
  private getAutoApprovedFeatures(profile: UserProfile, approved: boolean): string[] {
    const features: string[] = []

    if (approved) {
      // All approved users get basic features
      features.push('profile_creation')
      features.push('basic_messaging')
      features.push('dashboard_access')

      // Role-specific auto-approved features
      switch (profile.role) {
        case 'seller':
          features.push('product_upload')
          features.push('inventory_management')
          features.push('order_processing')
          features.push('payment_processing')
          break
        case 'stylist':
          features.push('client_matching')
          features.push('booking_system')
          features.push('portfolio_showcase')
          features.push('commission_tracking')
          break
        case 'driver':
          features.push('delivery_assignments')
          features.push('route_optimization')
          features.push('earnings_tracking')
          features.push('customer_communication')
          break
      }
    } else {
      // Limited features for pending approval
      features.push('profile_creation')
      features.push('basic_messaging')
    }

    return features
  }

  /**
   * Generate restrictions based on risk level
   */
  private generateRestrictions(profile: UserProfile, riskLevel: 'low' | 'medium' | 'high'): string[] {
    const restrictions: string[] = []

    switch (riskLevel) {
      case 'high':
        restrictions.push('limited_transaction_amount')
        restrictions.push('manual_approval_required')
        restrictions.push('enhanced_monitoring')
        break
      case 'medium':
        restrictions.push('moderate_transaction_limits')
        restrictions.push('periodic_review_required')
        break
      case 'low':
        restrictions.push('standard_limits')
        break
    }

    // Role-specific restrictions
    switch (profile.role) {
      case 'seller':
        if (riskLevel === 'high') {
          restrictions.push('limited_product_uploads')
          restrictions.push('manual_payout_review')
        }
        break
      case 'driver':
        if (riskLevel === 'high') {
          restrictions.push('limited_delivery_radius')
          restrictions.push('supervised_deliveries')
        }
        break
    }

    return restrictions
  }

  /**
   * Generate next steps based on approval status
   */
  private generateNextSteps(
    profile: UserProfile, 
    approved: boolean, 
    _verificationRequired: string[]
  ): string[] {
    const steps: string[] = []

    if (approved) {
      steps.push('Complete profile setup')
      steps.push('Upload profile photo')
      steps.push('Configure preferences')
      
      // Role-specific next steps
      switch (profile.role) {
        case 'seller':
          steps.push('Upload first product')
          steps.push('Set up shipping options')
          steps.push('Configure payment methods')
          break
        case 'stylist':
          steps.push('Create style portfolio')
          steps.push('Set availability calendar')
          steps.push('Configure service pricing')
          break
        case 'driver':
          steps.push('Complete vehicle inspection')
          steps.push('Set delivery preferences')
          steps.push('Download mobile app')
          break
      }
    } else {
      steps.push('Complete required verifications')
      steps.push('Submit additional documents')
      steps.push('Wait for manual review')
    }

    return steps
  }

  /**
   * Estimate approval time based on requirements
   */
  private estimateApprovalTime(verificationRequired: string[], approved: boolean): string {
    if (approved) {
      return 'Instant'
    }

    const timeEstimates: Record<string, number> = {
      'email_verification': 1,
      'phone_verification': 2,
      'business_verification': 30,
      'license_verification': 15,
      'insurance_verification': 15,
      'background_check': 60,
      'vehicle_inspection': 120,
      'tax_document_verification': 45,
      'portfolio_review': 20,
      'skill_assessment': 30
    }

    const totalMinutes = verificationRequired.reduce((total, req) => {
      return total + (timeEstimates[req] || 30)
    }, 0)

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`
    } else if (totalMinutes < 1440) {
      return `${Math.ceil(totalMinutes / 60)} hours`
    } else {
      return `${Math.ceil(totalMinutes / 1440)} days`
    }
  }

  /**
   * Process real-time verification updates
   */
  async processVerificationUpdate(
    userId: string, 
    verificationType: string, 
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<ApprovalResult | null> {
    // This would integrate with your database to update user verification status
    // and re-evaluate approval status in real-time
    
    console.log(`Verification update: ${userId} - ${verificationType} - ${status}`)
    
    // Return updated approval result
    return null // Placeholder - implement based on your needs
  }

  /**
   * Get approval statistics for analytics
   */
  async getApprovalStats(): Promise<{
    totalApplications: number
    autoApproved: number
    manualReview: number
    averageApprovalTime: string
    approvalRateByRole: Record<string, number>
  }> {
    // This would query your database for approval statistics
    return {
      totalApplications: 0,
      autoApproved: 0,
      manualReview: 0,
      averageApprovalTime: '0 minutes',
      approvalRateByRole: {}
    }
  }
}

// Export singleton instance
export const autoApprovalSystem = AutoApprovalSystem.getInstance()

// Export utility functions
export const analyzeUserProfile = (profile: UserProfile) => 
  autoApprovalSystem.analyzeUserProfile(profile)

export const processVerificationUpdate = (userId: string, type: string, status: string) =>
  autoApprovalSystem.processVerificationUpdate(userId, type, status as any)

export const getApprovalStats = () => autoApprovalSystem.getApprovalStats()

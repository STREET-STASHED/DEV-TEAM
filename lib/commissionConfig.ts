// lib/commissionConfig.ts
// 🚀 StreetStashed Platform Commission System
// Handles commission rates for pilot and post-pilot subscription model

export interface CommissionConfig {
  pilot: {
    commissionRate: number
    description: string
  }
  subscription: {
    commissionRate: number
    monthlyFee: number
    description: string
  }
  // Seller tiers (volume-based, higher fees)
  sellerTiers: {
    silver: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
    gold: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
    platinum: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
    diamond: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
  }
  // Stylist tiers (service-based, lower fees, higher ticket values)
  stylistTiers: {
    silver: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
    gold: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
    platinum: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
    diamond: {
      name: string
      monthlyFee: number
      orderTarget: number
      cashback: number
      effectiveFee: number
      commissionRate: number
      description: string
    }
  }
}

export const commissionConfig: CommissionConfig = {
  pilot: {
    commissionRate: 0.18, // 18%
    description: "Pilot phase - no subscription fee"
  },
  subscription: {
    commissionRate: 0.18, // 18%
    monthlyFee: 0,
    description: "Legacy subscription (deprecated)"
  },
  // Seller tiers - volume-based, higher fees
  sellerTiers: {
    silver: {
      name: "Silver",
      monthlyFee: 175,
      orderTarget: 15,
      cashback: 25,
      effectiveFee: 150,
      commissionRate: 0.18, // 18%
      description: "Entry level - perfect for getting started"
    },
    gold: {
      name: "Gold", 
      monthlyFee: 349,
      orderTarget: 25,
      cashback: 50,
      effectiveFee: 299,
      commissionRate: 0.15, // 15%
      description: "Growing business - unlock better rates"
    },
    platinum: {
      name: "Platinum",
      monthlyFee: 600,
      orderTarget: 40,
      cashback: 100,
      effectiveFee: 500,
      commissionRate: 0.12, // 12%
      description: "Established seller - premium benefits"
    },
    diamond: {
      name: "Diamond Elite",
      monthlyFee: 1200,
      orderTarget: 60,
      cashback: 200,
      effectiveFee: 1000,
      commissionRate: 0.10, // 10%
      description: "Top performer - maximum savings"
    }
  },
  // Stylist tiers - service-based, lower fees, higher ticket values
  stylistTiers: {
    silver: {
      name: "Silver Stylist",
      monthlyFee: 100,
      orderTarget: 0, // No cashback at entry level
      cashback: 0,
      effectiveFee: 100,
      commissionRate: 0.12, // 12%
      description: "Entry level - perfect for getting started"
    },
    gold: {
      name: "Gold Stylist", 
      monthlyFee: 250,
      orderTarget: 15,
      cashback: 50,
      effectiveFee: 200,
      commissionRate: 0.10, // 10%
      description: "Growing stylist - unlock better rates"
    },
    platinum: {
      name: "Platinum Stylist",
      monthlyFee: 500,
      orderTarget: 30,
      cashback: 100,
      effectiveFee: 400,
      commissionRate: 0.08, // 8%
      description: "Established stylist - premium benefits"
    },
    diamond: {
      name: "Diamond Stylist",
      monthlyFee: 1000,
      orderTarget: 50,
      cashback: 200,
      effectiveFee: 800,
      commissionRate: 0.06, // 6%
      description: "Top stylist - maximum savings"
    }
  }
}

export function calculateCommission(
  orderTotal: number,
  isPilot: boolean = true,
  subscriptionTier?: 'silver' | 'gold' | 'platinum' | 'diamond',
  userType: 'seller' | 'stylist' = 'seller'
): number {
  let commissionRate: number

  if (isPilot) {
    commissionRate = commissionConfig.pilot.commissionRate
  } else if (subscriptionTier) {
    if (userType === 'stylist') {
      commissionRate = commissionConfig.stylistTiers[subscriptionTier].commissionRate
    } else {
      commissionRate = commissionConfig.sellerTiers[subscriptionTier].commissionRate
    }
  } else {
    commissionRate = commissionConfig.subscription.commissionRate
  }

  return Math.round(orderTotal * commissionRate * 100) / 100
}

export function calculateRecommendedMarkup(
  basePrice: number,
  targetProfitMargin: number,
  isPilot: boolean = true,
  subscriptionTier?: 'silver' | 'gold' | 'platinum' | 'diamond',
  userType: 'seller' | 'stylist' = 'seller'
): {
  recommendedPrice: number
  markupAmount: number
  markupPercentage: number
  commissionAmount: number
  netProfit: number
  actualProfitMargin: number
} {
  let commissionRate: number

  if (isPilot) {
    commissionRate = commissionConfig.pilot.commissionRate
  } else if (subscriptionTier) {
    if (userType === 'stylist') {
      commissionRate = commissionConfig.stylistTiers[subscriptionTier].commissionRate
    } else {
      commissionRate = commissionConfig.sellerTiers[subscriptionTier].commissionRate
    }
  } else {
    commissionRate = commissionConfig.subscription.commissionRate
  }

  // Calculate price needed to achieve target profit after commission
  // Formula: (basePrice + targetProfit) / (1 - commissionRate)
  const targetProfit = basePrice * (targetProfitMargin / 100)
  const recommendedPrice = Math.round(((basePrice + targetProfit) / (1 - commissionRate)) * 100) / 100

  const markupAmount = recommendedPrice - basePrice
  const markupPercentage = (markupAmount / basePrice) * 100
  const commissionAmount = Math.round(recommendedPrice * commissionRate * 100) / 100
  const netProfit = Math.round((recommendedPrice - basePrice - commissionAmount) * 100) / 100
  const actualProfitMargin = (netProfit / recommendedPrice) * 100

  return {
    recommendedPrice: Math.round(recommendedPrice * 100) / 100,
    markupAmount: Math.round(markupAmount * 100) / 100,
    markupPercentage: Math.round(markupPercentage * 100) / 100,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    actualProfitMargin: Math.round(actualProfitMargin * 100) / 100
  }
}

export function compareCommissionScenarios(
  orderTotal: number,
  _targetProfitMargin: number,
  userType: 'seller' | 'stylist' = 'seller'
): {
  pilot: {
    commissionRate: number
    commissionAmount: number
    netEarnings: number
    description: string
  }
  silver: {
    commissionRate: number
    commissionAmount: number
    netEarnings: number
    monthlyFee: number
    effectiveFee: number
    cashback: number
    orderTarget: number
    description: string
  }
  gold: {
    commissionRate: number
    commissionAmount: number
    netEarnings: number
    monthlyFee: number
    effectiveFee: number
    cashback: number
    orderTarget: number
    description: string
  }
  platinum: {
    commissionRate: number
    commissionAmount: number
    netEarnings: number
    monthlyFee: number
    effectiveFee: number
    cashback: number
    orderTarget: number
    description: string
  }
  diamond: {
    commissionRate: number
    commissionAmount: number
    netEarnings: number
    monthlyFee: number
    effectiveFee: number
    cashback: number
    orderTarget: number
    description: string
  }
} {
  const tiers = userType === 'stylist' ? commissionConfig.stylistTiers : commissionConfig.sellerTiers
  
  const pilotCommission = calculateCommission(orderTotal, true, undefined, userType)
  const silverCommission = calculateCommission(orderTotal, false, 'silver', userType)
  const goldCommission = calculateCommission(orderTotal, false, 'gold', userType)
  const platinumCommission = calculateCommission(orderTotal, false, 'platinum', userType)
  const diamondCommission = calculateCommission(orderTotal, false, 'diamond', userType)

  return {
    pilot: {
      commissionRate: commissionConfig.pilot.commissionRate,
      commissionAmount: pilotCommission,
      netEarnings: orderTotal - pilotCommission,
      description: commissionConfig.pilot.description
    },
    silver: {
      commissionRate: tiers.silver.commissionRate,
      commissionAmount: silverCommission,
      netEarnings: orderTotal - silverCommission,
      monthlyFee: tiers.silver.monthlyFee,
      effectiveFee: tiers.silver.effectiveFee,
      cashback: tiers.silver.cashback,
      orderTarget: tiers.silver.orderTarget,
      description: tiers.silver.description
    },
    gold: {
      commissionRate: tiers.gold.commissionRate,
      commissionAmount: goldCommission,
      netEarnings: orderTotal - goldCommission,
      monthlyFee: tiers.gold.monthlyFee,
      effectiveFee: tiers.gold.effectiveFee,
      cashback: tiers.gold.cashback,
      orderTarget: tiers.gold.orderTarget,
      description: tiers.gold.description
    },
    platinum: {
      commissionRate: tiers.platinum.commissionRate,
      commissionAmount: platinumCommission,
      netEarnings: orderTotal - platinumCommission,
      monthlyFee: tiers.platinum.monthlyFee,
      effectiveFee: tiers.platinum.effectiveFee,
      cashback: tiers.platinum.cashback,
      orderTarget: tiers.platinum.orderTarget,
      description: tiers.platinum.description
    },
    diamond: {
      commissionRate: tiers.diamond.commissionRate,
      commissionAmount: diamondCommission,
      netEarnings: orderTotal - diamondCommission,
      monthlyFee: tiers.diamond.monthlyFee,
      effectiveFee: tiers.diamond.effectiveFee,
      cashback: tiers.diamond.cashback,
      orderTarget: tiers.diamond.orderTarget,
      description: tiers.diamond.description
    }
  }
}

export function getCommissionSavings(
  monthlyRevenue: number,
  _isPilot: boolean = false,
  subscriptionTier?: 'silver' | 'gold' | 'platinum' | 'diamond',
  userType: 'seller' | 'stylist' = 'seller'
): {
  pilotCommission: number
  tierCommission: number
  monthlySavings: number
  annualSavings: number
  breakEvenOrders: number
} {
  const pilotCommission = monthlyRevenue * commissionConfig.pilot.commissionRate
  
  if (!subscriptionTier) {
    return {
      pilotCommission,
      tierCommission: pilotCommission,
      monthlySavings: 0,
      annualSavings: 0,
      breakEvenOrders: 0
    }
  }

  const tiers = userType === 'stylist' ? commissionConfig.stylistTiers : commissionConfig.sellerTiers
  const tier = tiers[subscriptionTier]
  const tierCommission = monthlyRevenue * tier.commissionRate
  const monthlySavings = pilotCommission - tierCommission - tier.effectiveFee
  const annualSavings = monthlySavings * 12
  const breakEvenOrders = Math.ceil(tier.effectiveFee / (pilotCommission - tierCommission))

  return {
    pilotCommission,
    tierCommission,
    monthlySavings,
    annualSavings,
    breakEvenOrders
  }
}

export function isSubscriptionWorthIt(
  monthlyRevenue: number,
  subscriptionTier: 'silver' | 'gold' | 'platinum' | 'diamond',
  userType: 'seller' | 'stylist' = 'seller'
): {
  worthIt: boolean
  monthlySavings: number
  breakEvenOrders: number
  recommendation: string
} {
  const savings = getCommissionSavings(monthlyRevenue, false, subscriptionTier, userType)
  const tiers = userType === 'stylist' ? commissionConfig.stylistTiers : commissionConfig.sellerTiers
  const tier = tiers[subscriptionTier]
  
  const worthIt = savings.monthlySavings > 0
  const recommendation = worthIt 
    ? `Upgrade to ${tier.name} - you'll save $${savings.monthlySavings.toFixed(0)}/month`
    : `Stay on pilot plan - you need ${savings.breakEvenOrders} orders/month to break even`

  return {
    worthIt,
    monthlySavings: savings.monthlySavings,
    breakEvenOrders: savings.breakEvenOrders,
    recommendation
  }
}

export function calculateTierBenefits(
  currentOrders: number,
  monthlyRevenue: number,
  userType: 'seller' | 'stylist' = 'seller'
): {
  currentTier: string
  nextTier?: string
  cashbackEligible: boolean
  potentialCashback: number
  upgradeSavings: number
  recommendation: string
} {
  const tiers = userType === 'stylist' ? commissionConfig.stylistTiers : commissionConfig.sellerTiers
  
  // Determine current tier based on orders
  let currentTier = 'pilot'
  let nextTier: string | undefined

  if (currentOrders >= tiers.diamond.orderTarget) {
    currentTier = 'diamond'
  } else if (currentOrders >= tiers.platinum.orderTarget) {
    currentTier = 'platinum'
    nextTier = 'diamond'
  } else if (currentOrders >= tiers.gold.orderTarget) {
    currentTier = 'gold'
    nextTier = 'platinum'
  } else if (currentOrders >= tiers.silver.orderTarget) {
    currentTier = 'silver'
    nextTier = 'gold'
  } else {
    nextTier = 'silver'
  }

  const currentTierConfig = currentTier === 'pilot' 
    ? commissionConfig.pilot 
    : tiers[currentTier as keyof typeof tiers]
  
  const cashbackEligible = currentTier !== 'pilot' && currentOrders >= (currentTierConfig as typeof tiers.silver).orderTarget
  const potentialCashback = cashbackEligible ? (currentTierConfig as typeof tiers.silver).cashback : 0

  let upgradeSavings = 0
  let recommendation = ''

  if (nextTier && nextTier !== 'pilot') {
    const nextTierConfig = tiers[nextTier as keyof typeof tiers]
    const currentCommission = monthlyRevenue * (currentTier === 'pilot' ? 0.18 : (currentTierConfig as typeof tiers.silver).commissionRate)
    const nextCommission = monthlyRevenue * nextTierConfig.commissionRate
    upgradeSavings = currentCommission - nextCommission - nextTierConfig.effectiveFee + (currentTierConfig as typeof tiers.silver).effectiveFee

    if (upgradeSavings > 0) {
      recommendation = `Upgrade to ${nextTierConfig.name} to save $${upgradeSavings.toFixed(0)}/month`
    } else {
      recommendation = `Focus on hitting ${nextTierConfig.orderTarget} orders to unlock ${nextTierConfig.name}`
    }
  } else if (currentTier === 'pilot') {
    recommendation = `Hit ${tiers.silver.orderTarget} orders to unlock ${tiers.silver.name} benefits`
  } else {
    recommendation = `You're at the top tier! Keep up the great work.`
  }

  return {
    currentTier,
    nextTier,
    cashbackEligible,
    potentialCashback,
    upgradeSavings,
    recommendation
  }
}

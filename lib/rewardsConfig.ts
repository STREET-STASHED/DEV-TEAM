// Unified StreetStashed Rewards System Configuration

export interface BuyerRewards {
  pointsPerDollar: number
  redemptionRates: {
    [points: number]: number // points -> credit amount
  }
  description: string
}

export interface SellerRewards {
  pointsPerDollar: number
  tiers: {
    [tier: string]: {
      baseSubscription: number
      maxDiscount: number
      floor: number
      commissionRate: number
      salesThreshold: number // minimum sales to unlock max discount
      description: string
    }
  }
  description: string
}

export interface DriverRewards {
  tiers: {
    [tier: string]: {
      ordersPerMonth: [number, number] // [min, max]
      bonusPercentage: number
      badge: string
      description: string
    }
  }
  description: string
}

export interface RewardsConfig {
  buyer: BuyerRewards
  seller: SellerRewards
  driver: DriverRewards
}

export const rewardsConfig: RewardsConfig = {
  buyer: {
    pointsPerDollar: 0.1, // 1 point per $10 spent
    redemptionRates: {
      500: 5,   // 500 points = $5 credit
      1000: 10, // 1000 points = $10 credit
      2000: 20  // 2000 points = $20 credit
    },
    description: "Earn points on every purchase, redeem for delivery fee credits"
  },
  seller: {
    pointsPerDollar: 0.1, // 1 point per $10 in sales
    tiers: {
      silver: {
        baseSubscription: 300,
        maxDiscount: 50,
        floor: 250,
        commissionRate: 0.12,
        salesThreshold: 3000, // $3,000 in sales to unlock max discount
        description: "Silver tier subscription discounts"
      },
      gold: {
        baseSubscription: 600,
        maxDiscount: 100,
        floor: 500,
        commissionRate: 0.10,
        salesThreshold: 6000, // $6,000 in sales to unlock max discount
        description: "Gold tier subscription discounts"
      },
      platinum: {
        baseSubscription: 1200,
        maxDiscount: 200,
        floor: 1000,
        commissionRate: 0.08,
        salesThreshold: 12000, // $12,000 in sales to unlock max discount
        description: "Platinum tier subscription discounts"
      },
      diamond: {
        baseSubscription: 1800,
        maxDiscount: 300,
        floor: 1500,
        commissionRate: 0.06,
        salesThreshold: 18000, // $18,000 in sales to unlock max discount
        description: "Diamond Elite tier subscription discounts"
      }
    },
    description: "Earn points on sales, redeem for subscription discounts"
  },
  driver: {
    tiers: {
      bronze: {
        ordersPerMonth: [0, 20],
        bonusPercentage: 0,
        badge: "",
        description: "Bronze driver - no bonus"
      },
      silver: {
        ordersPerMonth: [21, 40],
        bonusPercentage: 2,
        badge: "🥈 Silver Badge",
        description: "Silver driver - +2% bonus"
      },
      gold: {
        ordersPerMonth: [41, 59],
        bonusPercentage: 5,
        badge: "🥇 Gold Badge",
        description: "Gold driver - +5% bonus"
      },
      diamond: {
        ordersPerMonth: [60, 999],
        bonusPercentage: 10,
        badge: "💎 Diamond Badge",
        description: "Diamond driver - +10% bonus"
      }
    },
    description: "Earn bonuses and badges based on monthly order volume"
  }
}

// Calculate buyer points earned
export function calculateBuyerPoints(orderTotal: number): number {
  return Math.floor(orderTotal * rewardsConfig.buyer.pointsPerDollar)
}

// Calculate buyer credit from points
export function calculateBuyerCredit(points: number): number {
  const redemptionRates = rewardsConfig.buyer.redemptionRates
  const availableRates = Object.keys(redemptionRates)
    .map(Number)
    .sort((a, b) => b - a) // Sort descending to get best rate first
  
  for (const rate of availableRates) {
    if (points >= rate) {
      return redemptionRates[rate]
    }
  }
  
  return 0
}

// Calculate seller points earned
export function calculateSellerPoints(salesTotal: number): number {
  return Math.floor(salesTotal * rewardsConfig.seller.pointsPerDollar)
}

// Calculate seller subscription discount
export function calculateSellerDiscount(
  tier: string,
  monthlySales: number,
  _currentPoints: number
): {
  baseSubscription: number
  maxDiscount: number
  actualDiscount: number
  finalSubscription: number
  pointsNeeded: number
  salesProgress: number
} {
  const tierConfig = rewardsConfig.seller.tiers[tier]
  if (!tierConfig) {
    return {
      baseSubscription: 0,
      maxDiscount: 0,
      actualDiscount: 0,
      finalSubscription: 0,
      pointsNeeded: 0,
      salesProgress: 0
    }
  }

  // Calculate discount based on sales threshold
  const salesProgress = Math.min(monthlySales / tierConfig.salesThreshold, 1)
  const maxDiscount = tierConfig.maxDiscount
  const actualDiscount = Math.floor(maxDiscount * salesProgress)
  
  // Ensure we never go below floor
  const finalSubscription = Math.max(
    tierConfig.baseSubscription - actualDiscount,
    tierConfig.floor
  )

  // Calculate points needed for next discount level
  const pointsNeeded = Math.ceil((tierConfig.salesThreshold - monthlySales) * rewardsConfig.seller.pointsPerDollar)

  return {
    baseSubscription: tierConfig.baseSubscription,
    maxDiscount,
    actualDiscount,
    finalSubscription,
    pointsNeeded,
    salesProgress
  }
}

// Calculate driver tier and bonus
export function calculateDriverTier(ordersThisMonth: number): {
  tier: string
  bonusPercentage: number
  badge: string
  description: string
  nextTier?: {
    tier: string
    ordersNeeded: number
    bonusPercentage: number
    badge: string
  }
} {
  const tiers = rewardsConfig.driver.tiers
  
  // Find current tier
  let currentTier = 'bronze'
  for (const [tierName, tierConfig] of Object.entries(tiers)) {
    if (ordersThisMonth >= tierConfig.ordersPerMonth[0] && ordersThisMonth <= tierConfig.ordersPerMonth[1]) {
      currentTier = tierName
      break
    }
  }

  const currentTierConfig = tiers[currentTier]
  
  // Find next tier
  let nextTier: {
    tier: string
    ordersNeeded: number
    bonusPercentage: number
    badge: string
  } | undefined = undefined
  const tierNames = Object.keys(tiers)
  const currentIndex = tierNames.indexOf(currentTier)
  
  if (currentIndex < tierNames.length - 1) {
    const nextTierName = tierNames[currentIndex + 1]
    const nextTierConfig = tiers[nextTierName]
    const ordersNeeded = nextTierConfig.ordersPerMonth[0] - ordersThisMonth
    
    nextTier = {
      tier: nextTierName,
      ordersNeeded: Math.max(0, ordersNeeded),
      bonusPercentage: nextTierConfig.bonusPercentage,
      badge: nextTierConfig.badge
    }
  }

  return {
    tier: currentTier,
    bonusPercentage: currentTierConfig.bonusPercentage,
    badge: currentTierConfig.badge,
    description: currentTierConfig.description,
    nextTier
  }
}

// Calculate driver bonus amount
export function calculateDriverBonus(basePay: number, ordersThisMonth: number): {
  basePay: number
  bonusPercentage: number
  bonusAmount: number
  totalPay: number
  tier: string
  badge: string
} {
  const driverTier = calculateDriverTier(ordersThisMonth)
  const bonusAmount = (basePay * driverTier.bonusPercentage) / 100
  const totalPay = basePay + bonusAmount

  return {
    basePay,
    bonusPercentage: driverTier.bonusPercentage,
    bonusAmount,
    totalPay,
    tier: driverTier.tier,
    badge: driverTier.badge
  }
}

// Get available redemption options for buyer
export function getBuyerRedemptionOptions(points: number): Array<{
  points: number
  credit: number
  available: boolean
  description: string
}> {
  const redemptionRates = rewardsConfig.buyer.redemptionRates
  const options = Object.entries(redemptionRates).map(([pointsStr, credit]) => ({
    points: parseInt(pointsStr),
    credit,
    available: points >= parseInt(pointsStr),
    description: `${pointsStr} points = $${credit} credit`
  }))

  return options.sort((a, b) => a.points - b.points)
}

// Get seller tier information
export function getSellerTierInfo(tier: string): {
  tier: string
  baseSubscription: number
  maxDiscount: number
  floor: number
  commissionRate: number
  salesThreshold: number
  description: string
} | null {
  const tierConfig = rewardsConfig.seller.tiers[tier]
  if (!tierConfig) return null

  return {
    tier,
    ...tierConfig
  }
}

// Get all seller tiers
export function getAllSellerTiers(): Array<{
  tier: string
  baseSubscription: number
  maxDiscount: number
  floor: number
  commissionRate: number
  salesThreshold: number
  description: string
}> {
  return Object.entries(rewardsConfig.seller.tiers).map(([tier, config]) => ({
    tier,
    ...config
  }))
}

// Get all driver tiers
export function getAllDriverTiers(): Array<{
  tier: string
  ordersPerMonth: [number, number]
  bonusPercentage: number
  badge: string
  description: string
}> {
  return Object.entries(rewardsConfig.driver.tiers).map(([tier, config]) => ({
    tier,
    ...config
  }))
}

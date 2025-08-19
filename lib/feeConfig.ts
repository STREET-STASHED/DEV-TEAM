// lib/feeConfig.ts
// 🚀 StreetStashed Comprehensive Delivery Fee Structure
// Hybrid model with continuous core + band adjustments + policy rules

export interface FeeInput {
  distanceMiles: number;
  cartSubtotal: number;
  localHour: number; // 0-23
  isBadWeather?: boolean;
  longDistanceConsent?: boolean;
}

export interface FeeBreakdown {
  total: number;
  buyer: number;
  seller: number;
  driver: number;   // 70% of total
  platform: number; // 30% of total
  applied: {
    model: 'hybrid';
    buyerCapApplied: boolean;
    smallCartRule: boolean;
    highCartRelief: boolean;
    nightBonus: boolean;
    badWeatherAdjust: boolean;
    requiresLongDistanceConsent: boolean;
  };
}

export const feeConfig = {
  // Core fee structure (hybrid model)
  base: 6.00,
  perMile: 0.70,
  
  // Band adjustments for smooth transitions
  bands: [
    { distance: 2, adjustment: 0.50 },
    { distance: 5, adjustment: 1.00 },
    { distance: 10, adjustment: 2.00 },
    { distance: 15, adjustment: 1.50 }
  ],
  
  // Buyer caps by distance bands
  buyerCaps: [
    { maxDistance: 2, cap: 4.50 },
    { maxDistance: 5, cap: 6.50 },
    { maxDistance: 10, cap: 10.00 },
    { maxDistance: 15, cap: 15.00 },
    { maxDistance: 20, cap: 18.00 },
    { maxDistance: Infinity, cap: 22.00 }
  ],
  
  // Split rules
  defaultSplit: { buyer: 0.55, seller: 0.45 },
  highCartThreshold: 200,
  highCartSplit: { buyer: 0.50, seller: 0.50 },
  
  // Small cart rule (subtotal < $30 & distance > 10mi)
  smallCartThreshold: 30,
  smallCartDistanceThreshold: 10,
  smallCartSplit: { buyer: 0.50, seller: 0.50 },
  
  // Bonuses and adjustments
  nightBonus: {
    afterHour: 22,
    amount: 1.50
  },
  badWeatherAdjust: {
    multiplier: 1.15 // 15% increase
  },
  
  // Long distance consent
  longDistanceThreshold: 20,
  
  // Driver compensation
  driverPayPercentage: 0.70,
  platformMarginPercentage: 0.30,
  
  // Pittsburgh-specific
  averageSpeedMph: 25,
  maxPilotRadiusMiles: 25
} as const;

// Calculate the base fee using hybrid model
function calculateBaseFee(distanceMiles: number): number {
  let fee = feeConfig.base + (feeConfig.perMile * distanceMiles);
  
  // Apply band adjustments
  for (const band of feeConfig.bands) {
    if (distanceMiles >= band.distance) {
      fee += band.adjustment;
    }
  }
  
  // Smooth interpolation near band edges (±0.5mi)
  for (const band of feeConfig.bands) {
    const edgeDistance = band.distance;
    const interpolationRange = 0.5;
    
    if (Math.abs(distanceMiles - edgeDistance) <= interpolationRange) {
      const progress = (distanceMiles - (edgeDistance - interpolationRange)) / (2 * interpolationRange);
      const smoothAdjustment = band.adjustment * Math.sin(progress * Math.PI);
      fee = fee - band.adjustment + smoothAdjustment;
    }
  }
  
  return Math.round(fee * 100) / 100;
}

// Determine buyer cap based on distance
function getBuyerCap(distanceMiles: number): number {
  for (const capRule of feeConfig.buyerCaps) {
    if (distanceMiles <= capRule.maxDistance) {
      return capRule.cap;
    }
  }
  return feeConfig.buyerCaps[feeConfig.buyerCaps.length - 1].cap;
}

// Determine split based on cart value and distance
function getSplit(cartSubtotal: number, distanceMiles: number): { buyer: number; seller: number } {
  // High cart relief
  if (cartSubtotal >= feeConfig.highCartThreshold) {
    return feeConfig.highCartSplit;
  }
  
  // Small cart rule
  if (cartSubtotal < feeConfig.smallCartThreshold && distanceMiles > feeConfig.smallCartDistanceThreshold) {
    return feeConfig.smallCartSplit;
  }
  
  // Default split
  return feeConfig.defaultSplit;
}

// Apply bonuses and adjustments
function applyBonuses(baseFee: number, input: FeeInput): { adjustedFee: number; bonuses: string[] } {
  let adjustedFee = baseFee;
  const bonuses: string[] = [];
  
  // Night bonus
  if (input.localHour >= feeConfig.nightBonus.afterHour) {
    adjustedFee += feeConfig.nightBonus.amount;
    bonuses.push('night');
  }
  
  // Bad weather adjustment
  if (input.isBadWeather) {
    adjustedFee = Math.round(adjustedFee * feeConfig.badWeatherAdjust.multiplier * 100) / 100;
    bonuses.push('weather');
  }
  
  return { adjustedFee, bonuses };
}

// Main fee calculation function
export function computeStashedSupportFee(input: FeeInput): FeeBreakdown {
  const { distanceMiles, cartSubtotal, localHour, longDistanceConsent = false } = input;
  
  // Validate inputs
  if (distanceMiles < 0 || cartSubtotal < 0 || localHour < 0 || localHour > 23) {
    throw new Error('Invalid input parameters');
  }
  
  // Check long distance consent
  const requiresLongDistanceConsent = distanceMiles > feeConfig.longDistanceThreshold;
  if (requiresLongDistanceConsent && !longDistanceConsent) {
    throw new Error('Long distance consent required for trips over 20 miles');
  }
  
  // Calculate base fee
  const baseFee = calculateBaseFee(distanceMiles);
  
  // Apply bonuses
  const { adjustedFee, bonuses } = applyBonuses(baseFee, input);
  
  // Determine split
  const split = getSplit(cartSubtotal, distanceMiles);
  
  // Calculate initial buyer and seller shares
  let buyerShare = Math.round(adjustedFee * split.buyer * 100) / 100;
  let sellerShare = Math.round(adjustedFee * split.seller * 100) / 100;
  
  // Apply buyer cap
  const buyerCap = getBuyerCap(distanceMiles);
  const buyerCapApplied = buyerShare > buyerCap;
  
  if (buyerCapApplied) {
    buyerShare = buyerCap;
    // Push excess to seller to maintain total
    sellerShare = Math.round((adjustedFee - buyerShare) * 100) / 100;
  }
  
  // Calculate driver and platform shares
  const driverPay = Math.round(adjustedFee * feeConfig.driverPayPercentage * 100) / 100;
  
  // Ensure exact totals by adjusting platform margin if needed
  const total = Math.round((buyerShare + sellerShare) * 100) / 100;
  
  // Calculate platform margin as the exact difference to ensure driver + platform = total
  const finalPlatformMargin = Math.round((total - driverPay) * 100) / 100;
  
  return {
    total,
    buyer: buyerShare,
    seller: sellerShare,
    driver: driverPay,
    platform: finalPlatformMargin,
    applied: {
      model: 'hybrid',
      buyerCapApplied,
      smallCartRule: cartSubtotal < feeConfig.smallCartThreshold && distanceMiles > feeConfig.smallCartDistanceThreshold,
      highCartRelief: cartSubtotal >= feeConfig.highCartThreshold,
      nightBonus: bonuses.includes('night'),
      badWeatherAdjust: bonuses.includes('weather'),
      requiresLongDistanceConsent
    }
  };
}

// Helper function to get fee tier description
export function getFeeTierDescription(distanceMiles: number): string {
  if (distanceMiles <= 2) return 'Local Delivery';
  if (distanceMiles <= 5) return 'Metro Delivery';
  if (distanceMiles <= 10) return 'Extended Delivery';
  if (distanceMiles <= 15) return 'Premium Delivery';
  if (distanceMiles <= 20) return 'Long Distance Delivery';
  return 'Extended Range Delivery';
}

// Helper function to check if long distance consent is required
export function requiresLongDistanceConsent(distanceMiles: number): boolean {
  return distanceMiles > feeConfig.longDistanceThreshold;
}

// Helper function to get ETA in minutes
export function getEtaMinutes(distanceMiles: number): number {
  return Math.round((distanceMiles / feeConfig.averageSpeedMph) * 60);
}

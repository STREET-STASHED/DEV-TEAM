// lib/fees.ts
// 🚀 StreetStashed Full Stashed Support Fee System
// Updated to use the new comprehensive fee structure

import { computeStashedSupportFee, FeeInput as NewFeeInput } from './feeConfig';

export interface FeeInput {
  distanceMiles: number;
  etaMinutes: number;
  merchSubtotal: number; // before fees & taxes
  localHour?: number; // current hour (0-23), defaults to current time
}

export interface FeeOutput {
  stashedSupportFee: {
    total: number;           // Full support fee (driver pay + platform margin + ops)
    buyerShare: number;      // Buyer's portion
    sellerShare: number;     // Seller's portion
  };
  driverCompensation: {
    driverPay: number;       // Driver's take-home pay
    platformMargin: number;  // Platform's margin
    percentage: number;      // What % of support fee goes to driver
  };
  meta: {
    distanceMiles: number;
    etaMinutes: number;
    appliedBonuses: string[];
    feeTierDescription: string;
    totalOrderAmount: number; // Final amount buyer pays
  };
}

// Calculate all fees for an order using the new comprehensive system
export function calculateFees(input: FeeInput): FeeOutput {
  const { 
    distanceMiles, 
    etaMinutes, 
    merchSubtotal, 
    localHour = new Date().getHours()
  } = input;

  // Validate distance
  if (distanceMiles <= 0) {
    throw new Error('Distance must be greater than 0');
  }

  // Convert to new fee input format
  const newFeeInput: NewFeeInput = {
    distanceMiles,
    cartSubtotal: merchSubtotal,
    localHour
  };

  // Calculate fees using the new comprehensive system
  const feeBreakdown = computeStashedSupportFee(newFeeInput);

  // Get applied bonuses for metadata
  const appliedBonuses = getAppliedBonuses(distanceMiles, localHour);
  const feeTierDescription = getFeeTierDescription(distanceMiles);

  // Calculate total order amount
  const totalOrderAmount = merchSubtotal + feeBreakdown.buyer;

  return {
    stashedSupportFee: {
      total: feeBreakdown.total,
      buyerShare: feeBreakdown.buyer,
      sellerShare: feeBreakdown.seller
    },
    driverCompensation: {
      driverPay: feeBreakdown.driver,
      platformMargin: feeBreakdown.platform,
      percentage: 70 // 70% of total support fee goes to driver
    },
    meta: {
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      etaMinutes: Math.round(etaMinutes),
      appliedBonuses,
      feeTierDescription,
      totalOrderAmount: Math.round(totalOrderAmount * 100) / 100
    }
  };
}

// Helper to get applied bonuses for display
export function getAppliedBonuses(distanceMiles: number, localHour: number): string[] {
  const bonuses: string[] = [];
  
  // Check for night bonus (after 10pm)
  if (localHour >= 22) {
    bonuses.push('Night Bonus ($1.50)');
  }
  
  // Check for long trip bonus (10+ miles)
  if (distanceMiles >= 10) {
    bonuses.push('Long Trip Bonus');
  }
  
  return bonuses;
}

// Helper to get a description of the fee tier
export function getFeeTierDescription(distanceMiles: number): string {
  if (distanceMiles <= 2) return "Local Delivery";
  if (distanceMiles <= 5) return "Metro Delivery";
  if (distanceMiles <= 10) return "Extended Delivery";
  if (distanceMiles <= 15) return "Premium Delivery";
  if (distanceMiles <= 20) return "Long Distance Delivery";
  return "Extended Range Delivery";
}

// Calculate total order amount for buyer
export function calculateTotalOrderAmount(
  merchSubtotal: number,
  buyerSupportFee: number
): number {
  return Math.round((merchSubtotal + buyerSupportFee) * 100) / 100;
}

// Get driver pay breakdown for transparency
export function getDriverPayBreakdown(distanceMiles: number, localHour: number): {
  base: number;
  mileage: number;
  bonuses: number;
  total: number;
} {
  const base = 6.00;
  const mileage = 0.70 * distanceMiles;
  let bonuses = 0;

  // Night bonus
  if (localHour >= 22) {
    bonuses += 1.50;
  }

  // Long trip bonus
  if (distanceMiles >= 10) {
    bonuses += 3.00;
  }

  const total = base + mileage + bonuses;

  return {
    base: Math.round(base * 100) / 100,
    mileage: Math.round(mileage * 100) / 100,
    bonuses: Math.round(bonuses * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

// Calculate seller net payout after support fee deduction
export function calculateSellerNetPayout(
  basePrice: number,
  sellerSupportFee: number
): {
  basePrice: number;
  supportFeeDeduction: number;
  netPayout: number;
  profitMargin: number;
} {
  const netPayout = basePrice - sellerSupportFee;
  const profitMargin = netPayout > 0 ? (netPayout / basePrice) * 100 : 0;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    supportFeeDeduction: Math.round(sellerSupportFee * 100) / 100,
    netPayout: Math.round(netPayout * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
}

// Get example calculations for different scenarios
export function getExampleCalculations(): Array<{
  scenario: string;
  distance: number;
  hour: number;
  supportFee: number;
  buyerShare: number;
  sellerShare: number;
  driverPay: number;
  platformMargin: number;
}> {
  const examples = [
    { distance: 0.5, hour: 14, scenario: '0.5 mi @ 3pm' },
    { distance: 2.0, hour: 14, scenario: '2.0 mi @ 3pm' },
    { distance: 7.0, hour: 14, scenario: '7.0 mi @ 3pm' },
    { distance: 10.0, hour: 23, scenario: '10.0 mi @ 11pm' },
    { distance: 12.0, hour: 23, scenario: '12.0 mi @ 11pm' }
  ];

  return examples.map(({ distance, hour, scenario }) => {
    const feeBreakdown = computeStashedSupportFee({
      distanceMiles: distance,
      cartSubtotal: 100, // Default cart value for examples
      localHour: hour
    });

    return {
      scenario,
      distance,
      hour,
      supportFee: Math.round(feeBreakdown.total * 100) / 100,
      buyerShare: Math.round(feeBreakdown.buyer * 100) / 100,
      sellerShare: Math.round(feeBreakdown.seller * 100) / 100,
      driverPay: Math.round(feeBreakdown.driver * 100) / 100,
      platformMargin: Math.round(feeBreakdown.platform * 100) / 100
    };
  });
}

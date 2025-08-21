// lib/sellerPricing.ts
// StreetStashed Seller Pricing & Markup System
// Helps sellers automatically price products to account for support fees

import { computeStashedSupportFee } from './feeConfig';
import { calculateRecommendedMarkup, compareCommissionScenarios } from './commissionConfig';

export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  markupPercentage: number;
  isActive: boolean;
}

export interface ProductPricing {
  basePrice: number;
  suggestedPrice: number;
  markupAmount: number;
  markupPercentage: number;
  estimatedSupportFee: number;
  estimatedProfit: number;
  profitMargin: number;
}

export interface SellerPricingSettings {
  sellerId: string;
  defaultMarkupPercentage: number;
  minProfitMargin: number;
  targetProfitMargin: number;
  autoAdjustPricing: boolean;
  pricingStrategies: PricingStrategy[];
  created_at: string;
  updated_at: string;
}

// Default pricing strategies
export const DEFAULT_PRICING_STRATEGIES: PricingStrategy[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Minimal markup to stay competitive',
    markupPercentage: 8,
    isActive: true
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Moderate markup for fair profit',
    markupPercentage: 12,
    isActive: true
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Higher markup for premium positioning',
    markupPercentage: 18,
    isActive: true
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Maximum markup for high profit',
    markupPercentage: 25,
    isActive: false
  }
];

// Calculate suggested price for a product (including commission)
export function calculateSuggestedPrice(
  basePrice: number,
  markupPercentage: number,
  estimatedDistance: number = 8, // Default 8 miles for pricing
  cartSubtotal?: number,
  isPilot: boolean = true,
  subscriptionTier?: 'silver' | 'gold' | 'platinum' | 'diamond'
): ProductPricing {
  // Calculate estimated support fee
  const estimatedSupportFee = computeStashedSupportFee({
    distanceMiles: estimatedDistance,
    cartSubtotal: cartSubtotal || basePrice,
    localHour: 14 // Assume daytime for pricing
  });

  // Calculate markup amount
  const markupAmount = (basePrice * markupPercentage) / 100;
  
  // Calculate suggested price
  const suggestedPrice = basePrice + markupAmount;
  
  // Calculate commission
  const { commissionAmount } = calculateRecommendedMarkup(suggestedPrice, 0, isPilot, subscriptionTier);
  
  // Calculate estimated profit after support fee and commission
  const estimatedProfit = suggestedPrice - basePrice - estimatedSupportFee.seller - commissionAmount;
  const profitMargin = (estimatedProfit / suggestedPrice) * 100;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    markupAmount: Math.round(markupAmount * 100) / 100,
    markupPercentage,
    estimatedSupportFee: Math.round(estimatedSupportFee.seller * 100) / 100,
    estimatedProfit: Math.round(estimatedProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
}

// Calculate pricing for multiple products
export function calculateBulkPricing(
  products: Array<{ id: string; basePrice: number; name: string }>,
  markupPercentage: number,
  estimatedDistance: number = 8
): Array<{ id: string; name: string; pricing: ProductPricing }> {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    pricing: calculateSuggestedPrice(product.basePrice, markupPercentage, estimatedDistance)
  }));
}

// Get optimal markup percentage based on target profit margin
export function getOptimalMarkup(
  basePrice: number,
  targetProfitMargin: number,
  estimatedDistance: number = 8
): number {
  // Binary search for optimal markup
  let low = 0;
  let high = 50; // Max 50% markup
  let optimalMarkup = 0;

  while (low <= high) {
    const mid = (low + high) / 2;
    const pricing = calculateSuggestedPrice(basePrice, mid, estimatedDistance);
    
    if (Math.abs(pricing.profitMargin - targetProfitMargin) < 0.5) {
      optimalMarkup = mid;
      break;
    } else if (pricing.profitMargin < targetProfitMargin) {
      low = mid + 0.5;
    } else {
      high = mid - 0.5;
    }
  }

  return Math.round(optimalMarkup * 100) / 100;
}

// Calculate pricing impact for different distances
export function getDistancePricingImpact(
  basePrice: number,
  markupPercentage: number,
  distances: number[] = [2, 5, 10, 15, 20]
): Array<{ distance: number; pricing: ProductPricing }> {
  return distances.map(distance => ({
    distance,
    pricing: calculateSuggestedPrice(basePrice, markupPercentage, distance)
  }));
}

// Generate pricing recommendations (including commission scenarios)
export function getPricingRecommendations(
  basePrice: number,
  category: string,
  estimatedDistance: number = 8,
  isPilot: boolean = true
): {
  conservative: ProductPricing;
  balanced: ProductPricing;
  premium: ProductPricing;
  recommended: 'conservative' | 'balanced' | 'premium';
  commissionScenarios: ReturnType<typeof compareCommissionScenarios>;
} {
  const conservative = calculateSuggestedPrice(basePrice, 8, estimatedDistance, undefined, isPilot);
  const balanced = calculateSuggestedPrice(basePrice, 12, estimatedDistance, undefined, isPilot);
  const premium = calculateSuggestedPrice(basePrice, 18, estimatedDistance, undefined, isPilot);

  // Get commission scenarios for comparison
  const commissionScenarios = compareCommissionScenarios(basePrice, 15);

  // Determine recommended strategy based on category and price
  let recommended: 'conservative' | 'balanced' | 'premium' = 'balanced';
  
  if (basePrice < 20) {
    recommended = 'conservative'; // Low-value items
  } else if (basePrice > 100) {
    recommended = 'premium'; // High-value items
  } else if (category === 'premium' || category === 'luxury') {
    recommended = 'premium';
  }

  return {
    conservative,
    balanced,
    premium,
    recommended,
    commissionScenarios
  };
}

// Calculate seller dashboard metrics
export function calculateSellerMetrics(
  products: Array<{ basePrice: number; suggestedPrice: number; supportFee: number }>
): {
  totalBaseValue: number;
  totalSuggestedValue: number;
  totalMarkup: number;
  averageMarkupPercentage: number;
  totalSupportFees: number;
  estimatedProfit: number;
  averageProfitMargin: number;
} {
  const totalBaseValue = products.reduce((sum, p) => sum + p.basePrice, 0);
  const totalSuggestedValue = products.reduce((sum, p) => sum + p.suggestedPrice, 0);
  const totalMarkup = totalSuggestedValue - totalBaseValue;
  const totalSupportFees = products.reduce((sum, p) => sum + p.supportFee, 0);
  const estimatedProfit = totalMarkup - totalSupportFees;
  
  const averageMarkupPercentage = totalBaseValue > 0 ? (totalMarkup / totalBaseValue) * 100 : 0;
  const averageProfitMargin = totalSuggestedValue > 0 ? (estimatedProfit / totalSuggestedValue) * 100 : 0;

  return {
    totalBaseValue: Math.round(totalBaseValue * 100) / 100,
    totalSuggestedValue: Math.round(totalSuggestedValue * 100) / 100,
    totalMarkup: Math.round(totalMarkup * 100) / 100,
    averageMarkupPercentage: Math.round(averageMarkupPercentage * 100) / 100,
    totalSupportFees: Math.round(totalSupportFees * 100) / 100,
    estimatedProfit: Math.round(estimatedProfit * 100) / 100,
    averageProfitMargin: Math.round(averageProfitMargin * 100) / 100
  };
}

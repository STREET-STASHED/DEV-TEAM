export type Tier =
  | "Non-Subscriber"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond Elite";

export type StylistTier = "Silver" | "Gold" | "Diamond";

const COMMISSION_RATES: Record<Tier, number> = {
  "Non-Subscriber": 0.15,
  Silver: 0.12,
  Gold: 0.1,
  Platinum: 0.08,
  "Diamond Elite": 0.06,
};

const STYLIST_COMMISSION_RATES: Record<StylistTier, number> = {
  Silver: 0.12,
  Gold: 0.1,
  Diamond: 0.08,
};

export function getCommissionRate(tier: Tier): number {
  return COMMISSION_RATES[tier] ?? 0.15;
}

export function getStylistCommissionRate(tier: StylistTier): number {
  return STYLIST_COMMISSION_RATES[tier] ?? 0.12;
}

export function calculateStashedSupportFee({
  distance,
  orderTotal,
}: {
  distance: number;
  orderTotal: number;
}): {
  buyerFee: number;
  driverPay: number;
  platformCut: number;
} {
  const baseDriverPay = 4.0;
  const perMileRate = 0.75;
  const driverPay = baseDriverPay + Math.max(0, distance - 1) * perMileRate;

  const platformCutFromDistance = 2.0;
  const platformCutFromTotal = Math.min(orderTotal * 0.05, 10); // Cap at $10
  const platformCut = parseFloat(
    (platformCutFromDistance + platformCutFromTotal).toFixed(2),
  );

  const buyerFee = parseFloat((driverPay / 2 + platformCut).toFixed(2));

  return {
    buyerFee,
    driverPay,
    platformCut,
  };
}

export function calculateSellerPayout(
  productPrice: number,
  tier: Tier,
): number {
  const commissionRate = getCommissionRate(tier);
  const payout = productPrice * (1 - commissionRate);
  return parseFloat(payout.toFixed(2));
}

export function calculateStylistPayout(
  servicePrice: number,
  tier: StylistTier,
): number {
  const commissionRate = getStylistCommissionRate(tier);
  const payout = servicePrice * (1 - commissionRate);
  return parseFloat(payout.toFixed(2));
}

// Supabase RPC handler (for reference use)
export function calculateStylistPayoutRPC({
  service_price,
  stylist_tier,
}: {
  service_price: number;
  stylist_tier: StylistTier;
}): number {
  const commissionRate = getStylistCommissionRate(stylist_tier);
  const payout = service_price * (1 - commissionRate);
  return parseFloat(payout.toFixed(2));
}

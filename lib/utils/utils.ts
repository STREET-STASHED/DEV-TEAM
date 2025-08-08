import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names conditionally and merges Tailwind classes correctly.
 * Useful for applying conditional styling in React components.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

import haversine from "haversine-distance";

type Coordinates = { lat: number; lng: number };

export const DELIVERY_TIERS = {
  local: 5,
  citywide: 10,
  extended: 20,
};

export function isBuyerWithinTier(
  buyerCoords: Coordinates,
  sellerCoords: Coordinates,
  tier: keyof typeof DELIVERY_TIERS,
): boolean {
  const distanceInMeters = haversine(buyerCoords, sellerCoords);
  const distanceInMiles = distanceInMeters / 1609.34;
  const maxAllowedDistance = DELIVERY_TIERS[tier];
  return distanceInMiles <= maxAllowedDistance;
}

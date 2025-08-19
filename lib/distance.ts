// 🚀 StreetStashed Distance & ETA Utilities
// Uses Google Maps Distance Matrix API with Pittsburgh fallbacks

import { feeConfig } from './feeConfig';

export interface DistanceAndEta {
  meters: number;
  minutes: number;
  distanceMiles: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

// Convert meters to miles
export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

// Convert miles to meters
export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

// Convert miles to kilometers
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

// Format address for Google Maps API
export function formatAddress(address: Address): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip_code}`;
}

// Get coordinates from address using Google Geocoding API
export async function getCoordinatesFromAddress(address: Address): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not found');
    return null;
  }

  try {
    const formattedAddress = formatAddress(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formattedAddress)}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.warn('Geocoding failed, using fallback:', error);
    return null;
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Get distance and ETA using Google Maps Distance Matrix API
export async function getDistanceAndEtaMeters(origin: Address, destination: Address): Promise<DistanceAndEta> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Maps API key not found, using fallback calculation');
    return getFallbackDistanceAndEta(origin, destination);
  }

  try {
    const originStr = formatAddress(origin);
    const destinationStr = formatAddress(destination);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originStr)}&destinations=${encodeURIComponent(destinationStr)}&key=${apiKey}&units=imperial&mode=driving`
    );
    
    if (!response.ok) {
      throw new Error(`Distance Matrix API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows.length > 0 && data.rows[0].elements.length > 0) {
      const element = data.rows[0].elements[0];
      
      if (element.status === 'OK') {
        const meters = element.distance.value;
        const minutes = element.duration.value / 60; // Convert seconds to minutes
        
        return {
          meters,
          minutes,
          distanceMiles: metersToMiles(meters)
        };
      }
    }
    
    throw new Error('No valid route found');
    
  } catch (error) {
    console.warn('Distance Matrix API failed, using fallback calculation:', error);
    return getFallbackDistanceAndEta(origin, destination);
  }
}

// Fallback calculation using Pittsburgh average speed + haversine with road multiplier
async function getFallbackDistanceAndEta(origin: Address, destination: Address): Promise<DistanceAndEta> {
  try {
    // Try to get coordinates for more accurate fallback
    const coords1 = await getCoordinatesFromAddress(origin);
    const coords2 = await getCoordinatesFromAddress(destination);
    
    if (coords1 && coords2) {
      // Use haversine with 1.2x multiplier to simulate roads
      const kmDistance = calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
      const estimatedMiles = (kmDistance * 1.2) * 0.621371; // Convert km to miles with road multiplier
      
      // Calculate ETA using fallback speed
      const etaMinutes = (estimatedMiles / feeConfig.averageSpeedMph) * 60;
      const meters = milesToMeters(estimatedMiles);
      
      return {
        meters: Math.round(meters),
        minutes: Math.round(etaMinutes),
        distanceMiles: Math.round(estimatedMiles * 100) / 100
      };
    }
  } catch (error) {
    console.warn('Coordinate-based fallback failed:', error);
  }
  
  // Ultimate fallback: estimate based on zip codes (very rough)
  const originZip = parseInt(origin.zip_code);
  const destZip = parseInt(destination.zip_code);
  
  if (!isNaN(originZip) && !isNaN(destZip)) {
    let estimatedMiles = Math.abs(originZip - destZip) * 0.01; // Rough conversion
    
    // Clamp to reasonable Pittsburgh metro range
    estimatedMiles = Math.max(0.5, Math.min(estimatedMiles, feeConfig.maxPilotRadiusMiles));
    
    // Calculate ETA using fallback speed
    const etaMinutes = (estimatedMiles / feeConfig.averageSpeedMph) * 60;
    const meters = milesToMeters(estimatedMiles);
    
    return {
      meters: Math.round(meters),
      minutes: Math.round(etaMinutes),
      distanceMiles: Math.round(estimatedMiles * 100) / 100
    };
  }
  
  // Default fallback if everything else fails
  const defaultMiles = 5.0;
  const defaultMinutes = (defaultMiles / feeConfig.averageSpeedMph) * 60;
  
  return {
    meters: milesToMeters(defaultMiles),
    minutes: Math.round(defaultMinutes),
    distanceMiles: defaultMiles
  };
}

// Calculate distance between two addresses (legacy function for backward compatibility)
export async function calculateAddressDistance(pickupAddress: Address, deliveryAddress: Address): Promise<number> {
  const result = await getDistanceAndEtaMeters(pickupAddress, deliveryAddress);
  return result.distanceMiles;
}

// Get estimated travel time in human-readable format
export function getEstimatedTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
}

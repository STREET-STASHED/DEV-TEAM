import { Loader, LoaderOptions, Library } from "@googlemaps/js-api-loader";

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG: LoaderOptions = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: "weekly",
  libraries: ["places", "geometry"] as Library[],
};

// Initialize Google Maps loader
export const googleMapsLoader = new Loader(GOOGLE_MAPS_CONFIG);

// Map styling for a modern, clean look
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
];

// Default map options
export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  zoom: 15,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  styles: MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
};

// Marker icons for different types
export const MARKER_ICONS = {
  driver: {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#3B82F6"/>
        <path d="M16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8Z" fill="white"/>
        <path d="M16 18C19.3137 18 22 20.6863 22 24V26H10V24C10 20.6863 12.6863 18 16 18Z" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  },
  pickup: {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#10B981"/>
        <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  },
  delivery: {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#EF4444"/>
        <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  },
};

// Utility functions
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateETA = (distance: number, speed: number = 30): number => {
  // speed in km/h, returns time in minutes
  return Math.round((distance / speed) * 60);
};

export const getDirectionsService =
  async (): Promise<google.maps.DirectionsService> => {
    await googleMapsLoader.load();
    return new google.maps.DirectionsService();
  };

export const getDirectionsRenderer = (
  map: google.maps.Map,
): google.maps.DirectionsRenderer => {
  return new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true, // We'll add our own markers
    polylineOptions: {
      strokeColor: "#3B82F6",
      strokeWeight: 4,
      strokeOpacity: 0.8,
    },
  });
};

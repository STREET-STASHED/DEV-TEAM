import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  speed?: number;
  heading?: number;
}

interface GPSTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  intervalMs?: number;
  onLocationUpdate?: (_location: Location) => void;
  onError?: (_error: string) => void;
}

interface GPSTrackingState {
  isTracking: boolean;
  currentLocation: Location | null;
  error: string | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
}

const defaultOptions: Required<GPSTrackingOptions> = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000,
  intervalMs: 5000,
  onLocationUpdate: () => {},
  onError: () => {},
};

export function useGPSTracking(options: GPSTrackingOptions = {}): GPSTrackingState & {
  startTracking: () => void;
  stopTracking: () => void;
  getCurrentLocation: () => Promise<Location>;
} {
  const config = useMemo(() => ({ ...defaultOptions, ...options }), [options]);
  
  const [state, setState] = useState<GPSTrackingState>({
    isTracking: false,
    currentLocation: null,
    error: null,
    accuracy: null,
    speed: null,
    heading: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<Location | null>(null);

  const clearTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const location: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
    };

    lastLocationRef.current = location;

    setState(prev => ({
      ...prev,
      currentLocation: location,
      error: null,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      heading: position.coords.heading,
    }));

    config.onLocationUpdate(location);
  }, [config]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unknown GPS error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'GPS permission denied. Please enable location services.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'GPS position unavailable. Please check your location settings.';
        break;
      case error.TIMEOUT:
        errorMessage = 'GPS timeout. Please try again.';
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
    }));

    config.onError(errorMessage);
  }, [config]);

  const handleIntervalSuccess = useCallback((location: Location) => {
    // Only update if we have a new location with better accuracy or significant movement
    if (lastLocationRef.current) {
      const last = lastLocationRef.current;
      const distance = calculateDistance(
        last.latitude, last.longitude,
        location.latitude, location.longitude
      );
      
      // Update if moved more than 5 meters or if accuracy improved significantly
      if (distance > 5 || (location.accuracy && last.accuracy && location.accuracy < last.accuracy * 0.8)) {
        handleSuccess({
          coords: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy || null,
            altitude: null,
            altitudeAccuracy: null,
            heading: location.heading || null,
            speed: location.speed || null,
          },
          timestamp: location.timestamp || Date.now(),
        } as GeolocationPosition);
      }
    }
  }, [handleSuccess]);

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          };
          resolve(location);
        },
        (error) => {
          reject(new Error(`GPS Error: ${error.message}`));
        },
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge,
        }
      );
    });
  }, [config]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    if (state.isTracking) {
      return; // Already tracking
    }

    setState(prev => ({
      ...prev,
      isTracking: true,
      error: null,
    }));

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: config.enableHighAccuracy,
        timeout: config.timeout,
        maximumAge: config.maximumAge,
      }
    );

    // Set up interval for additional updates (useful for speed/heading changes)
    intervalIdRef.current = setInterval(() => {
      if (lastLocationRef.current) {
        // Get fresh location data
        getCurrentLocation().then(handleIntervalSuccess).catch(handleError);
      }
    }, config.intervalMs);
  }, [state.isTracking, handleSuccess, handleError, handleIntervalSuccess, getCurrentLocation, config]);

  const stopTracking = useCallback(() => {
    clearTracking();
    
    setState(prev => ({
      ...prev,
      isTracking: false,
    }));
  }, [clearTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTracking();
    };
  }, [clearTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

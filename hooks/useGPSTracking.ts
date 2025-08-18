import { useState, useEffect, useRef, useCallback } from "react";

interface GPSLocation {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number;
  speed: number;
  timestamp: number;
}

interface GPSTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number;
  onLocationUpdate?: (location: GPSLocation) => void;
  onError?: (error: GeolocationPositionError) => void;
  onAccuracyChange?: (accuracy: number) => void;
}

interface GPSTrackingReturn {
  location: GPSLocation | null;
  isTracking: boolean;
  accuracy: number;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  getCurrentLocation: () => Promise<GPSLocation>;
  isSupported: boolean;
  // Additional utility methods
  calculateDistance: (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => number;
  calculateETA: (distance: number, speed: number) => number;
  getLocationQuality: () => "excellent" | "good" | "fair" | "poor";
}

export const useGPSTracking = ({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 0,
  updateInterval = 5000,
  onLocationUpdate,
  onError,
  onAccuracyChange,
}: GPSTrackingOptions = {}): GPSTrackingReturn => {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<GPSLocation | null>(null);

  // Check if geolocation is supported
  useEffect(() => {
    setIsSupported("geolocation" in navigator);
  }, []);

  // Success callback for geolocation
  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      const newLocation: GPSLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy || 0,
        heading: position.coords.heading || 0,
        speed: position.coords.speed || 0,
        timestamp: position.timestamp,
      };

      setLocation(newLocation);
      setAccuracy(newLocation.accuracy);
      setError(null);
      lastLocationRef.current = newLocation;

      // Call callback if provided
      onLocationUpdate?.(newLocation);

      // Update accuracy callback
      onAccuracyChange?.(newLocation.accuracy);
    },
    [onLocationUpdate, onAccuracyChange],
  );

  // Success callback for interval updates (expects GPSLocation)
  const handleIntervalSuccess = useCallback(
    (location: GPSLocation) => {
      setLocation(location);
      setAccuracy(location.accuracy);
      setError(null);
      lastLocationRef.current = location;

      // Call callback if provided
      onLocationUpdate?.(location);

      // Update accuracy callback
      onAccuracyChange?.(location.accuracy);
    },
    [onLocationUpdate, onAccuracyChange],
  );

  // Error callback for geolocation
  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      let errorMessage = "Unknown error occurred";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            "Location access denied. Please enable location permissions.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out.";
          break;
      }

      setError(errorMessage);
      onError?.(error);
    },
    [onError],
  );

  // Get current location once
  const getCurrentLocation = useCallback((): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GPSLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || 0,
            heading: position.coords.heading || 0,
            speed: position.coords.speed || 0,
            timestamp: position.timestamp,
          };
          resolve(location);
        },
        (error) => {
          reject(new Error(error.message || 'Geolocation error'));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      );
    });
  }, [isSupported, enableHighAccuracy, timeout, maximumAge]);

  // Start continuous tracking
  const startTracking = useCallback(() => {
    if (!isSupported || isTracking) return;

    try {
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      );

      // Set up interval for additional updates (useful for speed/heading changes)
      intervalIdRef.current = setInterval(() => {
        if (lastLocationRef.current) {
          // Get fresh location data
          getCurrentLocation().then(handleIntervalSuccess).catch(handleError);
        }
      }, updateInterval);

      setIsTracking(true);
      setError(null);

      console.log("GPS tracking started");
    } catch (err) {
      console.error("Error starting GPS tracking:", err);
      setError("Failed to start GPS tracking");
    }
  }, [
    isSupported,
    isTracking,
    enableHighAccuracy,
    timeout,
    maximumAge,
    updateInterval,
    handleSuccess,
    handleError,
    getCurrentLocation,
    handleIntervalSuccess,
  ]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    setIsTracking(false);
    console.log("GPS tracking stopped");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Calculate distance between two points
  const calculateDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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
    },
    [],
  );

  // Calculate ETA based on distance and speed
  const calculateETA = useCallback(
    (distance: number, speed: number): number => {
      if (speed <= 0) return 0;
      return (distance / speed) * 60; // Returns minutes
    },
    [],
  );

  // Get location quality indicator
  const getLocationQuality = useCallback(():
    | "excellent"
    | "good"
    | "fair"
    | "poor" => {
    if (accuracy <= 5) return "excellent";
    if (accuracy <= 10) return "good";
    if (accuracy <= 20) return "fair";
    return "poor";
  }, [accuracy]);

  return {
    location,
    isTracking,
    accuracy,
    error,
    startTracking,
    stopTracking,
    getCurrentLocation,
    isSupported,
    // Additional utility methods
    calculateDistance,
    calculateETA,
    getLocationQuality,
  };
};

// Hook for tracking specific coordinates (useful for delivery tracking)
export const useDeliveryTracking = (
  targetLocation: { lat: number; lng: number },
  options?: Omit<GPSTrackingOptions, "onLocationUpdate">,
) => {
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);
  const [isApproaching, setIsApproaching] = useState(false);

  const { location, ...gpsTracking } = useGPSTracking({
    ...options,
    onLocationUpdate: (currentLocation) => {
      // Calculate distance to target
      const currentDistance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        targetLocation.lat,
        targetLocation.lng,
      );

      setDistance(currentDistance);

      // Calculate ETA (assuming average speed of 30 km/h for driving)
      const currentEta = calculateETA(currentDistance, 30);
      setEta(currentEta);

      // Check if approaching (within 100m)
      setIsApproaching(currentDistance <= 0.1);

      // Note: onLocationUpdate is omitted from options type to avoid conflicts
    },
  });

  // Utility functions
  const calculateDistance = (
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

  const calculateETA = (distance: number, speed: number): number => {
    if (speed <= 0) return 0;
    return (distance / speed) * 60; // Returns minutes
  };

  return {
    ...gpsTracking,
    location,
    distance,
    eta,
    isApproaching,
    targetLocation,
  };
};

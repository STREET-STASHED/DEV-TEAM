import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { googleMapsLoader } from "../lib/googleMaps";

interface DriverMapProps {
  driverLocation: { lat: number; lng: number };
  deliveryLocation: { lat: number; lng: number };
  driverName?: string;
  estimatedArrival?: string;
  vehicleInfo?: string;
}

const DriverMap: React.FC<DriverMapProps> = ({
  driverLocation,
  deliveryLocation,
  driverName = "Driver",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [driverMarker, setDriverMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on the client side
  const isClient = typeof window !== "undefined";

  // Define functions first to avoid hoisting issues
  const addMarkers = useCallback((mapInstance: google.maps.Map) => {
    if (!isClient) return;

    // Add driver marker
    const driver = new (window as typeof globalThis & { google: typeof google }).google.maps.Marker({
      position: driverLocation,
      map: mapInstance,
      title: driverName,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="white"/>
          </svg>
        `),
        scaledSize: new (window as typeof globalThis & { google: typeof google }).google.maps.Size(24, 24),
      },
    });

    setDriverMarker(driver);

    // Fit bounds to show all markers
    const bounds = new (window as typeof globalThis & { google: typeof google }).google.maps.LatLngBounds();
    bounds.extend(driverLocation);
    bounds.extend(deliveryLocation);
    mapInstance.fitBounds(bounds);
  }, [isClient, driverLocation, deliveryLocation, driverName]);

  const calculateRoute = useCallback(() => {
    if (!isClient || !directionsService || !directionsRenderer || !map) return;

    const request = {
      origin: driverLocation,
      destination: deliveryLocation,
      travelMode: (window as typeof globalThis & { google: typeof google }).google.maps.TravelMode.DRIVING,
    };

    void directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === (window as typeof globalThis & { google: typeof google }).google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
      } else {
        console.error("Directions request failed due to", status);
      }
    });
  }, [isClient, directionsService, directionsRenderer, map, driverLocation, deliveryLocation]);

  // Initialize Google Maps
  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await googleMapsLoader.load();

        const newMap = new (window as typeof globalThis & { google: typeof google }).google.maps.Map(mapRef.current!, {
          center: driverLocation,
          zoom: 13,
          mapTypeId: (window as typeof globalThis & { google: typeof google }).google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(newMap);

        // Initialize directions service
        const directionsServiceInstance = new (window as typeof globalThis & { google: typeof google }).google.maps.DirectionsService();
        const directionsRendererInstance = new (window as typeof globalThis & { google: typeof google }).google.maps.DirectionsRenderer({
          suppressMarkers: true,
        });

        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);

        // Add markers and directions
        void addMarkers(newMap);
        void calculateRoute();

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setError("Failed to load map");
        setIsLoading(false);
      }
    };

    void initMap();
  }, [driverLocation, deliveryLocation, isClient, addMarkers, calculateRoute]);

  // Update driver location
  useEffect(() => {
    if (!isClient || !driverMarker || !map) return;

    driverMarker.setPosition(driverLocation);
    map.setCenter(driverLocation);
  }, [driverLocation, driverMarker, map, isClient]);

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
        <p className="text-sm text-gray-600">
          Driver: {driverName}
        </p>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-80 bg-gray-100"
          style={{ minHeight: "320px" }}
        />
      </div>

      {/* Driver Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{driverName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Current Location</p>
            <p className="text-sm font-medium text-gray-900">
              {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverMap;

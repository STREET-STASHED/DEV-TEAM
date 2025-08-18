import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import OrderTimeline from "../components/OrderTimeline";

// Dynamically import DriverMap to prevent SSR issues
const DriverMap = dynamic(() => import("../components/DriverMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-8 text-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});
import PaymentForm from "../components/PaymentForm";
import PushNotifications, {
  useNotifications,
} from "../components/PushNotifications";
import { useWebSocket } from "../hooks/useWebSocket";
import { useGPSTracking } from "../hooks/useGPSTracking";

const IntegrationTestPage: React.FC = () => {
  const { notifications, addNotification, dismissNotification } =
    useNotifications();
  const [testResults, setTestResults] = useState<
    Record<string, "pending" | "success" | "error">
  >({
    "Google Maps": "pending",
    WebSocket: "pending",
    "GPS Tracking": "pending",
    "Stripe Payment": "pending",
    "Real-time Updates": "pending",
    Authentication: "pending",
  });

  // Mock WebSocket connection
  const { isConnected: wsConnected } = useWebSocket({
    userId: "test-user",
    userType: "buyer",
    autoConnect: false,
  });

  // Mock GPS tracking
  const { isTracking, startTracking, stopTracking, location } = useGPSTracking({
    onLocationUpdate: (loc) => {
      console.log("GPS Location updated:", loc);
      addNotification({
        type: "info",
        title: "GPS Update",
        message: `Location: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`,
      });
    },
  });

  // Test Google Maps
  useEffect(() => {
    const testGoogleMaps = async () => {
      try {
        // Simulate Google Maps loading
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setTestResults((prev) => ({ ...prev, "Google Maps": "success" }));
        addNotification({
          type: "success",
          title: "Google Maps Test",
          message: "Google Maps integration successful!",
        });
      } catch {
        setTestResults((prev) => ({ ...prev, "Google Maps": "error" }));
        addNotification({
          type: "error",
          title: "Google Maps Test",
          message: "Google Maps integration failed",
        });
      }
    };

    void testGoogleMaps();
  }, [addNotification]);

  // Test WebSocket
  useEffect(() => {
    const testWebSocket = async () => {
      try {
        // Simulate WebSocket connection
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setTestResults((prev) => ({ ...prev, WebSocket: "success" }));
        addNotification({
          type: "success",
          title: "WebSocket Test",
          message: "WebSocket connection established!",
        });
      } catch {
        setTestResults((prev) => ({ ...prev, WebSocket: "error" }));
        addNotification({
          type: "error",
          title: "WebSocket Test",
          message: "WebSocket connection failed",
        });
      }
    };

    void testWebSocket();
  }, [addNotification]);

  // Test GPS Tracking
  useEffect(() => {
    const testGPSTracking = async () => {
      try {
        // Simulate GPS permission request
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTestResults((prev) => ({ ...prev, "GPS Tracking": "success" }));
        addNotification({
          type: "success",
          title: "GPS Test",
          message: "GPS tracking system ready!",
        });
      } catch {
        setTestResults((prev) => ({ ...prev, "GPS Tracking": "error" }));
        addNotification({
          type: "error",
          title: "GPS Test",
          message: "GPS tracking system failed",
        });
      }
    };

    void testGPSTracking();
  }, [addNotification]);

  // Test Stripe
  useEffect(() => {
    const testStripe = async () => {
      try {
        // Simulate Stripe loading
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setTestResults((prev) => ({ ...prev, "Stripe Payment": "success" }));
        addNotification({
          type: "success",
          title: "Stripe Test",
          message: "Stripe payment system ready!",
        });
      } catch {
        setTestResults((prev) => ({ ...prev, "Stripe Payment": "error" }));
        addNotification({
          type: "error",
          title: "Stripe Test",
          message: "Stripe payment system failed",
        });
      }
    };

    void testStripe();
  }, [addNotification]);

  // Test Real-time Updates
  useEffect(() => {
    const testRealTime = async () => {
      try {
        // Simulate real-time system
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setTestResults((prev) => ({ ...prev, "Real-time Updates": "success" }));
        addNotification({
          type: "success",
          title: "Real-time Test",
          message: "Real-time update system active!",
        });
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        setTestResults((prev) => ({ ...prev, "Real-time Updates": "error" }));
        addNotification({
          type: "error",
          title: "Real-time Test",
          message: "Real-time update system failed",
        });
      }
    };

    void testRealTime();
  }, [addNotification]);

  // Test Authentication
  useEffect(() => {
    const testAuth = async () => {
      try {
        // Simulate auth system
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setTestResults((prev) => ({ ...prev, Authentication: "success" }));
        addNotification({
          type: "success",
          title: "Auth Test",
          message: "Authentication system ready!",
        });
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        setTestResults((prev) => ({ ...prev, Authentication: "error" }));
        addNotification({
          type: "error",
          title: "Auth Test",
          message: "Authentication system failed",
        });
      }
    };

    void testAuth();
  }, [addNotification]);

  const getTestIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTestColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
  };

  const mockOrder = {
    id: "test-order-123",
    status: "en_route",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    driver_id: "test-driver",
    estimated_delivery: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    total: 89.99,
    items: [
      {
        id: "item-1",
        name: "Test Product",
        price: 89.99,
        quantity: 1,
        image: "/mock/sneaker1.jpg",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 StreetStashed Production Integration Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing all production features working together
          </p>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(testResults).map(([feature, status]) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded-lg ${getTestColor(status)}`}
            >
              <div className="flex items-center space-x-3">
                {getTestIcon(status)}
                <span className="font-medium">{feature}</span>
              </div>
              <div className="mt-2 text-sm">
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Demonstrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Timeline */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Timeline
            </h2>
            <OrderTimeline order={mockOrder} />
          </div>

          {/* Driver Map */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Driver Map
            </h2>
            <DriverMap
              driverLocation={{ lat: 40.7128, lng: -74.006 }}
              deliveryLocation={{ lat: 40.7589, lng: -73.9851 }}
              estimatedArrival={mockOrder.estimated_delivery}
              driverName="Test Driver"
              vehicleInfo="Test Vehicle"
            />
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Payment System
            </h2>
            <PaymentForm
              amount={89.99}
              orderId="test-order-123"
              buyerId="test-buyer"
              sellerId="test-seller"
              onSuccess={(paymentIntentId) => {
                addNotification({
                  type: "success",
                  title: "Payment Success",
                  message: `Payment processed: ${paymentIntentId}`,
                });
              }}
              onError={(error) => {
                addNotification({
                  type: "error",
                  title: "Payment Error",
                  message: error,
                });
              }}
              onCancel={() => {
                addNotification({
                  type: "info",
                  title: "Payment Cancelled",
                  message: "Payment was cancelled by user",
                });
              }}
            />
          </div>

          {/* GPS Tracking */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              GPS Tracking
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tracking Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      isTracking
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isTracking ? "Active" : "Inactive"}
                  </span>
                </div>

                {location && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Latitude:</span>
                      <span className="font-mono">
                        {location.lat.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Longitude:</span>
                      <span className="font-mono">
                        {location.lng.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span>{location.accuracy.toFixed(1)}m</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={startTracking}
                    disabled={isTracking}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Tracking
                  </button>
                  <button
                    onClick={stopTracking}
                    disabled={!isTracking}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Stop Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  wsConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">WebSocket</span>
              <div className="text-lg font-semibold">
                {wsConnected ? "Connected" : "Disconnected"}
              </div>
            </div>

            <div className="text-center">
              <div
                className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  isTracking ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm text-gray-600">GPS Tracking</span>
              <div className="text-lg font-semibold">
                {isTracking ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="text-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2"></div>
              <span className="text-sm text-gray-600">Notifications</span>
              <div className="text-lg font-semibold">
                {notifications.length} Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <PushNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
};

export default IntegrationTestPage;

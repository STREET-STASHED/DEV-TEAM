import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  PhoneIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../../../components/PushNotifications";
import OrderTimeline from "../../../components/OrderTimeline";
import Image from "next/image";

// Dynamically import DriverMap to prevent SSR issues
const DriverMap = dynamic(() => import("../../../components/DriverMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-8 text-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

interface Order {
  id: string;
  status: string;
  created_at: string;
  driver_id?: string;
  estimated_delivery?: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}

const OrderTrackingPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const { addNotification } = useNotifications();
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Mock order data - in production, fetch from API
  useEffect(() => {
    if (orderId) {
      // Simulate API call
      setTimeout(() => {
        const mockOrder: Order = {
          id: orderId as string,
          status: "en_route",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          driver_id: "driver-123",
          estimated_delivery: new Date(
            Date.now() + 15 * 60 * 1000,
          ).toISOString(), // 15 min from now
          total: 89.99,
          items: [
            {
              id: "item-1",
              name: "Nike Air Jordan 1 Retro High OG",
              price: 89.99,
              quantity: 1,
              image: "/mock/sneaker1.jpg",
            },
          ],
        };

        setOrder(mockOrder);

        // Add welcome notification
        addNotification({
          type: "info",
          title: "Order Tracking Active",
          message: `Tracking order #${orderId} in real-time`,
          action: {
            label: "View Details",
            onClick: () => console.log("View order details"),
          },
        });
      }, 1000);
    }
  }, [orderId, addNotification]);

  // Simulate real-time driver location updates
  useEffect(() => {
    if (order?.driver_id) {
      const interval = setInterval(() => {
        // Simulate driver moving towards delivery location
        setDriverLocation((prev) => ({
          lat: prev?.lat || 40.7128 + (Math.random() - 0.5) * 0.001,
          lng: prev?.lng || -74.006 + (Math.random() - 0.5) * 0.001,
        }));

        // Add status update notifications
        if (Math.random() < 0.1) {
          // 10% chance every update
          addNotification({
            type: "info",
            title: "Driver Update",
            message: "Driver is making good progress to your location",
            action: {
              label: "Track Driver",
              onClick: () => console.log("Track driver"),
            },
          });
        }
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [order?.driver_id, addNotification]);

  const handleContactDriver = () => {
    addNotification({
      type: "success",
      title: "Driver Contacted",
      message: "Driver will call you shortly",
    });
  };

  const handleMessageDriver = () => {
    addNotification({
      type: "info",
      title: "Message Sent",
      message: "Driver will respond to your message",
    });
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load order details
          </p>
          <button
            onClick={() => void router.push("/buyer/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Order Tracking
                </h1>
                <p className="text-sm text-gray-500">
                  Order #{order.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleContactDriver}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Call Driver</span>
              </button>
              <button
                onClick={handleMessageDriver}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Timeline */}
          <div className="space-y-6">
            <OrderTimeline order={order} />

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Image
                      src={item.image || "/mock/default-product.jpg"}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">${item.price}</p>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Driver Map */}
          <div className="space-y-6">
            <DriverMap
              driverLocation={driverLocation || { lat: 40.7128, lng: -74.006 }}
              deliveryLocation={
                { lat: 40.7589, lng: -73.9851 }
              }
              estimatedArrival={order.estimated_delivery || ""}
              driverName="John Driver"
              vehicleInfo="Toyota Camry - ABC123"
            />

            {/* Delivery Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Instructions
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Please meet driver at the main entrance</p>
                <p>• Have your ID ready for verification</p>
                <p>• Driver will call when arriving</p>
                <p>• Contact support if any issues</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCartIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface OrderStatus {
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "picked_up"
    | "en_route"
    | "delivered"
    | "cancelled";
  timestamp: string;
  description: string;
  icon: React.ReactNode;
}

interface OrderTimelineProps {
  order: {
    id: string;
    status: string;
    created_at: string;
    driver_id?: string;
    estimated_delivery?: string;
    current_location?: { lat: number; lng: number };
  };
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const getStatusSteps = (): OrderStatus[] => {
    const baseSteps: OrderStatus[] = [
      {
        status: "pending",
        timestamp: order.created_at,
        description: "Order placed",
        icon: <ShoppingCartIcon className="h-6 w-6" />,
      },
      {
        status: "confirmed",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
        description: "Order confirmed by seller",
        icon: <CheckCircleIcon className="h-6 w-6" />,
      },
      {
        status: "preparing",
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 min ago
        description: "Seller preparing your order",
        icon: <ClockIcon className="h-6 w-6" />,
      },
      {
        status: "ready",
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
        description: "Order ready for pickup",
        icon: <UserIcon className="h-6 w-6" />,
      },
    ];

    if (
      order.status === "picked_up" ||
      order.status === "en_route" ||
      order.status === "delivered"
    ) {
      baseSteps.push({
        status: "picked_up",
        timestamp: new Date(Date.now() - 30 * 1000).toISOString(), // 30 sec ago
        description: "Driver picked up your order",
        icon: <TruckIcon className="h-6 w-6" />,
      });
    }

    if (order.status === "en_route" || order.status === "delivered") {
      baseSteps.push({
        status: "en_route",
        timestamp: new Date(Date.now() - 15 * 1000).toISOString(), // 15 sec ago
        description: "Driver en route to you",
        icon: <MapPinIcon className="h-6 w-6" />,
      });
    }

    if (order.status === "delivered") {
      baseSteps.push({
        status: "delivered",
        timestamp: new Date().toISOString(),
        description: "Order delivered!",
        icon: <CheckCircleIcon className="h-6 w-6" />,
      });
    }

    return baseSteps;
  };

  const getCurrentStepIndex = (): number => {
    const steps = getStatusSteps();
    return steps.findIndex((step) => step.status === order.status);
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Order Status</h3>
        <div className="text-sm text-gray-500">
          Order #{order.id.slice(0, 8)}
        </div>
      </div>

      {/* ETA Display */}
      {order.estimated_delivery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Estimated Delivery:{" "}
              {new Date(order.estimated_delivery).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <motion.div
              key={step.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }
                  ${isCurrent ? "ring-4 ring-green-200" : ""}
                `}
                >
                  {step.icon}
                </div>
              </div>

              {/* Status Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4
                    className={`text-sm font-medium ${
                      isCompleted ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </h4>
                  {isCurrent && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatTime(step.timestamp)}
                </p>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Driver Info */}
      {order.driver_id && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Your Driver</p>
              <p className="text-sm text-gray-500">
                Driver #{order.driver_id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Contact Driver
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          View Order Details
        </button>
      </div>
    </div>
  );
};

export default OrderTimeline;

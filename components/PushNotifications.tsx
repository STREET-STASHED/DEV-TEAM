import React, { useState } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface PushNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const PushNotifications: React.FC<PushNotificationsProps> = ({
  notifications,
  onDismiss,
  onAction,
}) => {
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "info":
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getNotificationStyles(notification.type)}
            border rounded-lg shadow-lg p-4 relative overflow-hidden
          `}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1 bg-blue-500" />

          {/* Notification Content */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>

                <button
                  onClick={() => onDismiss(notification.id)}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Action Button */}
              {notification.action && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      notification.action?.onClick();
                      onAction?.(notification);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
};

export default PushNotifications;

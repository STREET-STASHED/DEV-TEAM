import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
// import PushNotifications, {
//   useNotifications,
// } from "../../../components/PushNotifications";
// import { useNotifications } from "../../../components/PushNotifications";

interface DriverOrder {
  id: string;
  buyer_name: string;
  buyer_address: string;
  buyer_phone: string;
  items: Array<{
    name: string;
    quantity: number;
    image?: string;
    price?: number; // Added price to the item interface
  }>;
  total: number;
  status: "assigned" | "picked_up" | "en_route" | "delivered";
  estimated_delivery: string;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
}

const DriverDashboard: React.FC = () => {
  // const { addNotification } = useNotifications();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 40.7128,
    lng: -74.006,
  });
  const [orders, setOrders] = useState<DriverOrder[]>([]);

  // Mock orders data - in production, fetch from API
  useEffect(() => {
    setTimeout(() => {
      const mockOrders: DriverOrder[] = [
        {
          id: "order-1",
          buyer_name: "John Smith",
          buyer_address: "123 Main St, New York, NY 10001",
          buyer_phone: "+1 (555) 123-4567",
          items: [
            {
              name: "Nike Air Jordan 1 Retro High OG",
              quantity: 1,
              image: "/mock/sneaker1.jpg",
              price: 89.99, // Added price for mock data
            },
          ],
          total: 89.99,
          status: "assigned",
          estimated_delivery: new Date(
            Date.now() + 45 * 60 * 1000,
          ).toISOString(),
          pickup_location: "456 Fashion Ave, New York, NY 10018",
          delivery_location: "123 Main St, New York, NY 10001",
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: "order-2",
          buyer_name: "Sarah Johnson",
          buyer_address: "789 Park Ave, New York, NY 10021",
          buyer_phone: "+1 (555) 987-6543",
          items: [
            {
              name: "Adidas Ultraboost 22",
              quantity: 1,
              image: "/mock/default-product.jpg",
              price: 129.99, // Added price for mock data
            },
          ],
          total: 129.99,
          status: "picked_up",
          estimated_delivery: new Date(
            Date.now() + 20 * 60 * 1000,
          ).toISOString(),
          pickup_location: "321 Sneaker St, New York, NY 10016",
          delivery_location: "789 Park Ave, New York, NY 10021",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ];

      setOrders(mockOrders);
      // setIsLoading(false); // This line was removed as per the new_code

      // addNotification({
      //   type: "info",
      //   title: "New Orders Available",
      //   message: "You have 2 new delivery assignments",
      //   action: {
      //     label: "View Orders",
      //     onClick: () => console.log("View orders"),
      //   },
      // });
    }, 1000);
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // addNotification({
          //   type: "warning",
          //   title: "Location Access",
          //   message: "Please enable location access for better tracking",
          // });
        },
      );
    }
  }, []);

  // Simulate location updates
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => {
        setCurrentLocation((prev) => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
        }));
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const handleStatusUpdate = (
    orderId: string,
    newStatus: DriverOrder["status"],
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );

    const order = orders.find((o) => o.id === orderId);
    if (order) {
      // addNotification({
      //   type: "success",
      //   title: "Status Updated",
      //   message: `Order #${orderId.slice(0, 8)} status changed to ${newStatus}`,
      // });
    }
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    // addNotification({
    //   type: isOnline ? "warning" : "success",
    //   title: isOnline ? "Going Offline" : "Going Online",
    //   message: isOnline
    //     ? "You are now offline"
    //     : "You are now available for orders",
    // });
  };

  const handleContactBuyer = (_order: DriverOrder) => {
    // addNotification({
    //   type: "info",
    //   title: "Contacting Buyer",
    //   message: `Calling ${order.buyer_name} at ${order.buyer_phone}`,
    // });
  };

  const getStatusColor = (status: DriverOrder["status"]) => {
    switch (status) {
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "picked_up":
        return "bg-blue-100 text-blue-800";
      case "en_route":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: DriverOrder["status"]) => {
    switch (status) {
      case "assigned":
        return <ClockIcon className="h-4 w-4" />;
      case "picked_up":
        return <TruckIcon className="h-4 w-4" />;
      case "en_route":
        return <MapPinIcon className="h-4 w-4" />;
      case "delivered":
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <motion.div
  //         initial={{ opacity: 0, scale: 0.8 }}
  //         animate={{ opacity: 1, scale: 1 }}
  //         className="text-center"
  //       >
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading driver dashboard...</p>
  //       </motion.div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Driver Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage your deliveries</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <button
                onClick={handleToggleOnline}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isOnline
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isOnline ? "Go Offline" : "Go Online"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Active Orders
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Orders
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.buyer_name}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">
                          {order.status.replace("_", " ")}
                        </span>
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 mb-2"
                        >
                          <Image
                            src={item.image || "/mock/default-product.jpg"}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            ${item.price || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Pickup:</p>
                        <p className="text-gray-900">{order.pickup_location}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivery:</p>
                        <p className="text-gray-900">
                          {order.delivery_location}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleContactBuyer(order)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        <span>Call Buyer</span>
                      </button>

                      {order.status === "assigned" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(order.id, "picked_up")
                          }
                          className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <TruckIcon className="h-4 w-4" />
                          <span>Mark Picked Up</span>
                        </button>
                      )}

                      {order.status === "picked_up" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(order.id, "en_route")
                          }
                          className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          <MapPinIcon className="h-4 w-4" />
                          <span>Start Delivery</span>
                        </button>
                      )}

                      {order.status === "en_route" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(order.id, "delivered")
                          }
                          className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>Mark Delivered</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Driver Stats & Location */}
          <div className="space-y-6">
            {/* Driver Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today&apos;s Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders Completed</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-semibold text-green-600">$45.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance Traveled</span>
                  <span className="font-semibold text-gray-900">12.5 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Online Time</span>
                  <span className="font-semibold text-gray-900">4h 23m</span>
                </div>
              </div>
            </div>

            {/* Current Location */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Location
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono text-gray-900">
                    {currentLocation.lat.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono text-gray-900">
                    {currentLocation.lng.toFixed(6)}
                  </span>
                </div>
                <div className="pt-3">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Update Location
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm text-left">
                  View Earnings Report
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm text-left">
                  Update Profile
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm text-left">
                  Support Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      {/* <PushNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
      /> */}
    </div>
  );
};

export default DriverDashboard;

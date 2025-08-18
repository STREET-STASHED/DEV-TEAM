import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase/client";

// Dynamically import DriverMap to ensure it's client-only
const DriverMap = dynamic(() => import("@/components/DriverMap"), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-8 text-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
});

type DriverOrder = {
  id: string;
  customer_name: string;
  delivery_address: string;
  status: string;
  created_at: string;
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("status", "assigned")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          return;
        }

        setOrders(data || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const handleContactBuyer = (_order: DriverOrder) => {
    // addNotification({
    //   type: "info",
    //   title: "Contact Buyer",
    //   message: "This would open a chat or call interface",
    // });
    console.log("Contact buyer functionality would go here");
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
        return;
      }

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Driver Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Orders</h2>
            
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active orders</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {order.customer_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.delivery_address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'picked_up' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleContactBuyer(order)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition"
                      >
                        Contact Buyer
                      </button>
                      
                      {order.status === 'assigned' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                          className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-md text-sm hover:bg-yellow-700 transition"
                        >
                          Picked Up
                        </button>
                      )}
                      
                      {order.status === 'picked_up' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition"
                        >
                          Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Map</h2>
            <DriverMap
              driverLocation={{ lat: 40.4406, lng: -79.9959 }}
              deliveryLocation={{ lat: 40.456, lng: -79.9801 }}
              driverName="John Driver"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

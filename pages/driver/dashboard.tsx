// File: /pages/driver/dashboard.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";
import Map from "@/components/Map";

const AvailableOrders = ({ orders, onAccept }: { orders: any[], onAccept: (orderId: string) => void }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Available Orders</h2>
    {orders.length === 0 ? (
      <p>No pending orders.</p>
    ) : (
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="bg-gray-900 p-4 rounded shadow">
            <p>Status: {order.status}</p>
            <p>Dropoff: ({order.dropoff_lat}, {order.dropoff_lng})</p>
            <p>Distance: {order.distance ?? "N/A"} miles</p>
            <p>Fee: ${order.fee ?? "N/A"}</p>
            <p>Items: {order.items?.map((item: any) => item.name).join(", ")}</p>
            <button
              onClick={() => onAccept(order.id)}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
            >
              Accept
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const AssignedOrders = ({ orders, onUpdateStatus, driverLocation }: { orders: any[], onUpdateStatus: (orderId: string, newStatus: string) => void, driverLocation: { lat: number, lng: number } | null }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Assigned Orders</h2>
    {orders.length === 0 ? (
      <p>No active deliveries.</p>
    ) : (
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="bg-gray-800 p-4 rounded shadow">
            <p>Status: {order.status}</p>
            <p>Dropoff: ({order.dropoff_lat}, {order.dropoff_lng})</p>
            {driverLocation && order.dropoff_lat && order.dropoff_lng && (
              <p>
                ETA: {Math.round(
                  (Math.sqrt(
                    Math.pow(driverLocation.lat - order.dropoff_lat, 2) +
                    Math.pow(driverLocation.lng - order.dropoff_lng, 2)
                  ) * 69) / 0.5
                )} mins
              </p>
            )}
            {order.status === "accepted" && (
              <button
                onClick={() => onUpdateStatus(order.id, "picked_up")}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
              >
                Mark as Picked Up
              </button>
            )}
            {order.status === "picked_up" && (
              <button
                onClick={() => onUpdateStatus(order.id, "delivered")}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
              >
                Mark as Delivered
              </button>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const EarningsChart = ({ earnings }: { earnings: any[] }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Earnings</h2>
    <ul className="list-disc list-inside">
      {earnings.length > 0 ? (
        earnings.map((entry, idx) => (
          <li key={idx}>
            ${entry.amount} on {new Date(entry.date).toLocaleDateString()}
          </li>
        ))
      ) : (
        <li>No earnings data available.</li>
      )}
    </ul>
  </div>
);

const DriverRatings = ({ ratings }: { ratings: any }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Driver Rating</h2>
    {ratings ? (
      <p>
        Average Rating: {ratings.average_rating} ({ratings.total_reviews}{" "}
        reviews)
      </p>
    ) : (
      <p>No ratings yet.</p>
    )}
  </div>
);

const fetchDriverData = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Failed to load user");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "role, details_complete, has_completed_onboarding, verification_complete",
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "driver") {
    throw new Error("Access denied: Not a driver or profile not found.");
  }

  const { data: deliveries, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("*")
    .eq("driver_id", user.id);

  const { data: earnings, error: earningsError } = await supabase
    .from("driver_earnings")
    .select("*")
    .eq("driver_id", user.id);

  const { data: ratings, error: ratingsError } = await supabase
    .from("driver_ratings")
    .select("*")
    .eq("driver_id", user.id)
    .single();

  const { data: availableOrders, error: availableOrdersError } = await supabase
    .from("orders")
    .select("*")
    .is("driver_id", null)
    .eq("status", "pending_driver");

  const { data: assignedOrders, error: assignedOrdersError } = await supabase
    .from("orders")
    .select("*")
    .eq("driver_id", user.id)
    .not("status", "eq", "delivered");

  if (deliveriesError || earningsError || ratingsError || availableOrdersError || assignedOrdersError) {
    throw new Error("Failed to fetch driver data");
  }

  return { deliveries, earnings, ratings, availableOrders, assignedOrders };
};

const DriverDashboard = () => {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any | null>(null);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        setLoading(true);
        const data = await fetchDriverData();
        setEarnings(data.earnings);
        setRatings(data.ratings);
        setAvailableOrders(data.availableOrders);
        setAssignedOrders(data.assignedOrders);
        setDeliveries(
          data.deliveries.sort((a, b) => new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime())
        );
      } catch (err) {
        setError("Failed to load driver data.");
      } finally {
        setLoading(false);
      }
    };

    loadDriverData();
  }, []);

  useEffect(() => {
    let watchId: number;

    const startTracking = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation({ lat: latitude, lng: longitude });
            await supabase
              .from("driver_locations")
              .upsert({
                driver_id: user.id,
                lat: latitude,
                lng: longitude,
                updated_at: new Date().toISOString(),
              });
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
          }
        );
      } else {
        console.warn("Geolocation is not supported.");
      }
    };

    startTracking();

    return () => {
      if (watchId && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    const supabaseRealtime = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabaseRealtime
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const updatedOrder = payload.new as { id: string; status: string; driver_id: string | null };

          // Update assigned orders if the order was assigned to this driver
          setAssignedOrders((prev) =>
            prev.map((o) =>
              o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o
            )
          );

          // Add or remove from availableOrders based on new status
          if (updatedOrder.status === "pending_driver" && !updatedOrder.driver_id) {
            setAvailableOrders((prev) => {
              const exists = prev.find((o) => o.id === updatedOrder.id);
              return exists ? prev : [...prev, updatedOrder];
            });
          } else {
            setAvailableOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabaseRealtime.removeChannel(channel);
    };
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    const { error } = await supabase.rpc('accept_order', {
      order_id: orderId,
      driver: user.id,
    });

    if (error) {
      setError("Sorry, this order was just taken.");
      return;
    }

    setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
    setAssignedOrders((prev) => [...prev, { id: orderId, driver_id: user.id, status: "assigned" }]);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setAssignedOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
      if (newStatus === "delivered") {
        await supabase.from("deliveries").insert({
          driver_id: user.id,
          order_id: orderId,
          delivered_at: new Date().toISOString(),
        });
        setDeliveries((prev) => {
          const updated = [...prev, { driver_id: user.id, order_id: orderId, delivered_at: new Date().toISOString() }];
          return updated.sort((a, b) => new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime());
        });
      }
    } else {
      setError("Failed to update order status.");
    }
  };

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      <AvailableOrders orders={availableOrders} onAccept={handleAcceptOrder} />
      <AssignedOrders orders={assignedOrders} onUpdateStatus={handleUpdateOrderStatus} driverLocation={driverLocation} />
      <EarningsChart earnings={earnings} />
      <DriverRatings ratings={ratings} />
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Live Driver Location</h2>
        <Map
          center={{ lat: 40.4406, lng: -79.9959 }} // Replace with default center if needed
          zoom={13}
          markers={
            [
              {
                id: "driver",
                lat: driverLocation?.lat || 40.4406,
                lng: driverLocation?.lng || -79.9959,
                label: "You",
              }
            ]
          }
          // pseudo code comment: add polyline path between driver and first dropoff
          polyline={[
            {
              lat: driverLocation?.lat || 0,
              lng: driverLocation?.lng || 0,
            },
            {
              lat: assignedOrders[0]?.dropoff_lat || 0,
              lng: assignedOrders[0]?.dropoff_lng || 0,
            }
          ]}
        />
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Delivery History</h2>
        {deliveries.length > 0 ? (
          <ul className="list-disc list-inside">
            {deliveries.map((d, idx) => (
              <li key={idx}>
                Order {d.order_id} delivered on {new Date(d.delivered_at).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No deliveries yet.</p>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;

// pages/buyer/orders.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
} from "@supabase/realtime-js";

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
      } else {
        const enrichedOrders = await Promise.all(
          (data || []).map(async (order: any) => {
            let driverLocation = undefined;
            if (order.status === "assigned" && order.driver_id) {
              const { data: driverData } = await supabase
                .from("driver_locations")
                .select("latitude, longitude")
                .eq("driver_id", order.driver_id)
                .single();
              if (driverData) {
                driverLocation = {
                  lat: driverData.latitude,
                  lng: driverData.longitude,
                };
              }
            }
            return {
              id: Number(order.id),
              total: Number(order.total) || 0,
              status: order.status ?? "Pending",
              created_at: order.created_at ?? "",
              driverLocation,
            };
          }),
        );
        setOrders(enrichedOrders);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("orders-tracking")
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
          schema: "public",
          table: "orders",
        },
        (payload: { new: any }) => {
          const updatedOrder: Order = {
            id: Number(payload.new.id),
            total: Number(payload.new.total) || 0,
            status: payload.new.status ?? "Pending",
            created_at: payload.new.created_at ?? "",
          };
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === updatedOrder.id
                ? {
                    ...order,
                    status: updatedOrder.status,
                    created_at: updatedOrder.created_at,
                    total: updatedOrder.total,
                  }
                : order,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <p style={{ padding: "2rem", textAlign: "center" }}>Loading orders...</p>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>No Orders Found</h1>
        <Link href="/stores" legacyBehavior>
          <a>
            <button
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                background: "#FFD700",
                color: "#000",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Shop Now
            </button>
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#FFD700" }}>
        Your Orders
      </h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {orders.map((order) => (
          <li
            key={order.id}
            style={{
              border: "2px solid #FFD700",
              backgroundColor: "#111",
              borderRadius: 8,
              padding: "1rem",
              marginBottom: "1rem",
              color: "#fff",
            }}
          >
            <p>
              <strong>Order #{order.id}</strong>
            </p>
            <p>Total: ${order.total.toFixed(2)}</p>
            <p>
              Status:{" "}
              <span style={{ color: "#FFD700" }}>
                {order.status || "Pending"}
              </span>
            </p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
            {order.driverLocation && (
              <div
                style={{
                  marginTop: "0.5rem",
                  height: "150px",
                  background: "#333",
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${order.driverLocation.lat},${order.driverLocation.lng}&z=15&output=embed`}
                />
              </div>
            )}
            <Link href={`/buyer/${order.id}`}>
              <button
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "#FFD700",
                  color: "#000",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                View Details
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory;

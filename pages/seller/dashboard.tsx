import { type Tier } from "@/lib/fees";
import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Order {
  id: number;
  created_at: string;
  total_price: number;
  status: string;
  payout?: number;
}

export default function SellerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerTier, setSellerTier] = useState<Tier>("Non-Subscriber");
  const [analytics, setAnalytics] = useState({
    totalEarnings: 0,
    totalOrders: 0,
  });

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    if (!data) return;

    const payouts = await Promise.all(
      data.map(async (order) => {
        const { data: payout, error: rpcError } = await supabase.rpc(
          "calculate_seller_payout",
          {
            product_price: order.total_price,
            seller_tier: sellerTier,
          },
        );

        if (rpcError) {
          console.error(
            "Error calculating payout for order",
            order.id,
            rpcError,
          );
          return 0;
        }

        return payout ?? 0;
      }),
    );

    const totalEarnings = payouts.reduce((sum, val) => sum + val, 0);

    // Store payouts in the order object for UI rendering
    const ordersWithPayouts = data.map((order, index) => ({
      ...order,
      payout: payouts[index],
    }));

    setOrders(ordersWithPayouts);
    setAnalytics({
      totalEarnings,
      totalOrders: data.length,
    });
  }, [sellerTier]);

  useEffect(() => {
    const fetchSellerTier = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      if (!profileError && profile?.subscription_tier) {
        setSellerTier(profile.subscription_tier as Tier);
      }
    };

    void fetchSellerTier();

    if (sellerTier) void fetchOrders();

    const ordersSubscription = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void fetchOrders();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ordersSubscription);
    };
  }, [sellerTier, fetchOrders]);

  return (
    <div>
      <h1>Seller Dashboard</h1>

      <section>
        <h2>Analytics</h2>
        <div>
          <p>Total Earnings: ${analytics.totalEarnings.toFixed(2)}</p>
          <p>Total Orders: {analytics.totalOrders}</p>
        </div>
      </section>

      <section>
        <h2>Orders</h2>
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              Order #{order.id} - ${order.total_price.toFixed(2)} -{" "}
              {order.status} - {new Date(order.created_at).toLocaleString()} -
              Seller Payout: ${(order.payout ?? 0).toFixed(2)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

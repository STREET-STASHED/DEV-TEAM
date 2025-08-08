import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Layout from "@/components/Layout";
import {
  TruckIcon,
  CurrencyDollarIcon,
  StarIcon,
  ClipboardCheckIcon,
  MapIcon,
} from "@heroicons/react/outline";
import { Progress } from "@/components/ui/progress";

export default function DriverDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [driver, setDriver] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // setDriver(user);

      const { data: statsData } = await supabase
        .from("driver_stats")
        .select("*")
        .eq("driver_id", user.id)
        .single();
      setStats(statsData);

      const { data: completedOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("driver_id", user.id)
        .eq("status", "delivered");
      setOrders(completedOrders || []);

      const { data: openOrders } = await supabase
        .from("orders")
        .select("*")
        .is("driver_id", null)
        .eq("status", "pending");
      setAvailableOrders(openOrders || []);

      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const today = now.toISOString().split("T")[0];

      const { data: monthly } = await supabase
        .from("orders")
        .select("driver_pay")
        .eq("driver_id", user.id)
        .eq("status", "delivered")
        .gte("created_at", startOfMonth);

      const { data: daily } = await supabase
        .from("orders")
        .select("driver_pay")
        .eq("driver_id", user.id)
        .eq("status", "delivered")
        .gte("created_at", `${today}T00:00:00`);

      const monthlyTotal =
        monthly?.reduce((sum, o) => sum + o.driver_pay, 0) || 0;
      const dailyTotal = daily?.reduce((sum, o) => sum + o.driver_pay, 0) || 0;

      setStats((prev: any) => ({
        ...prev,
        monthly_earnings: monthlyTotal,
        daily_earnings: dailyTotal,
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-3">
            <TruckIcon className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Driver Dashboard
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Manage your deliveries and track your performance
              </p>
            </div>
          </div>
        </header>

        {stats &&
          (() => {
            const getNextTierThreshold = (current: number) => {
              if (current < 20) return 20;
              if (current < 40) return 40;
              if (current < 60) return 60;
              return null;
            };

            const nextThreshold = getNextTierThreshold(stats.completed_orders);
            const progress = nextThreshold
              ? (stats.completed_orders / nextThreshold) * 100
              : 100;

            return (
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Driver Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-white shadow rounded flex flex-col items-center">
                    <p className="text-gray-500 text-sm">Tier</p>
                    <p className="text-lg font-bold">{stats.tier}</p>
                  </div>
                  <div className="p-4 bg-white shadow rounded flex flex-col items-center">
                    <p className="text-gray-500 text-sm">Badge</p>
                    <p className="text-lg font-bold">{stats.badge}</p>
                  </div>
                  <div className="p-4 bg-white shadow rounded flex flex-col items-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-500 mb-1" />
                    <p className="text-gray-500 text-sm">Total Earnings</p>
                    <p className="text-lg font-bold">
                      ${stats.total_earnings.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-white shadow rounded flex flex-col items-center">
                    <ClipboardCheckIcon className="h-6 w-6 text-blue-500 mb-1" />
                    <p className="text-gray-500 text-sm">
                      Completed Deliveries
                    </p>
                    <p className="text-lg font-bold">
                      {stats.total_deliveries}
                    </p>
                  </div>
                  <div className="p-4 bg-white shadow rounded flex flex-col items-center">
                    <StarIcon className="h-6 w-6 text-yellow-400 mb-1" />
                    <p className="text-gray-500 text-sm">Rating</p>
                    <p className="text-lg font-bold">{stats.rating}/5</p>
                  </div>
                  <div className="p-4 bg-white shadow rounded flex flex-col items-center">
                    <p className="text-gray-500 text-sm">Earnings Today</p>
                    <p className="text-lg font-bold">
                      ${stats.daily_earnings.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-white shadow rounded flex flex-col items-center">
                    <p className="text-gray-500 text-sm">Earnings This Month</p>
                    <p className="text-lg font-bold">
                      ${stats.monthly_earnings.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-white shadow rounded col-span-full">
                    <p className="text-gray-500 text-sm mb-2">
                      Progress to Next Tier
                    </p>
                    <Progress
                      value={progress}
                      className="w-full h-3 bg-gray-200 rounded-full"
                    >
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </Progress>
                    {nextThreshold && (
                      <p className="text-sm text-gray-600 mt-1">
                        {stats.completed_orders}/{nextThreshold} completed
                        deliveries
                      </p>
                    )}
                  </div>
                </div>
              </section>
            );
          })()}

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Completed Orders
          </h2>
          <div className="bg-white shadow rounded border border-gray-200 p-4">
            {orders.length > 0 ? (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between border border-gray-100 rounded p-4 hover:shadow transition-shadow bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 flex-wrap gap-3">
                      <div className="flex items-center space-x-1 text-gray-700 text-sm md:text-base">
                        <ClipboardCheckIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Order ID:</span>{" "}
                        <span>{order.id}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-700 text-sm md:text-base">
                        <MapIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Distance:</span>{" "}
                        <span>{order.distance} miles</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-700 text-sm md:text-base font-semibold">
                        <CurrencyDollarIcon className="h-5 w-5" />
                        <span>Driver Pay: ${order.driver_pay}</span>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No completed orders.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Available Orders
          </h2>
          <div className="bg-white shadow rounded border border-gray-200 p-4">
            {availableOrders.length > 0 ? (
              <ul className="space-y-4">
                {availableOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between border border-gray-100 rounded p-4 hover:shadow transition-shadow bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 flex-wrap gap-3">
                      <div className="flex items-center space-x-1 text-gray-700 text-sm md:text-base">
                        <ClipboardCheckIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Order ID:</span>{" "}
                        <span>{order.id}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-700 text-sm md:text-base">
                        <MapIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Distance:</span>{" "}
                        <span>{order.distance} miles</span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-700 text-sm md:text-base font-semibold">
                        <CurrencyDollarIcon className="h-5 w-5" />
                        <span>Estimated Pay: ${order.driver_pay}</span>
                      </div>
                    </div>
                    <button
                      className="mt-2 sm:mt-0 px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm md:text-base font-semibold"
                      onClick={async () => {
                        const {
                          data: { user },
                        } = await supabase.auth.getUser();
                        if (!user) return;
                        const { error } = await supabase
                          .from("orders")
                          .update({ driver_id: user.id, status: "accepted" })
                          .eq("id", order.id);
                        if (!error) {
                          const updated = await supabase
                            .from("orders")
                            .select("*")
                            .eq("driver_id", user.id)
                            .eq("status", "accepted");
                          setOrders(updated?.data || []);
                          fetchData(); // Now it works properly
                        }
                      }}
                    >
                      Claim Delivery
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No orders available right now.</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

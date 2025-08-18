import React, { useEffect, useState } from "react";
import { createServerClient } from "@supabase/ssr";
import { GetServerSideProps } from "next";
import ProtectedLayout from "@/components/ProtectedLayout";
import { supabase } from "@/lib/supabaseClient";
import { calculateStylistPayoutRPC } from "@/lib/fees";

interface StylistDashboardProps {
  userId: string;
}

interface Booking {
  id: string;
  client_name: string;
  date: string;
  status: string;
  event_type: string;
  outfit_request: string;
  price: number;
  payout: number;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const Spinner = () => (
  <div
    role="status"
    aria-live="polite"
    style={{ padding: "1rem", textAlign: "center" }}
  >
    <svg
      aria-hidden="true"
      className="animate-spin h-8 w-8 text-gray-600 mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

const Dashboard: React.FC<StylistDashboardProps> = ({ userId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateMonthlyEarnings = (bookings: Booking[]) => {
    const currentMonth = new Date().getMonth();
    return bookings
      .filter((b) => new Date(b.date).getMonth() === currentMonth)
      .reduce((sum, b) => sum + b.price, 0);
  };

  // Use userId from props directly; no need for separate localUserId state or fetching
  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId) return;

      // Check if onboarding is complete
      const { data: userStatus, error: userError } = await supabase
        .from("profiles")
        .select("has_completed_onboarding, subscription_tier")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error checking onboarding status:", userError.message);
        return;
      }

      if (!userStatus?.has_completed_onboarding) {
        window.location.href = "/onboarding/details";
        return;
      }

      const profileData = userStatus;

      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, client_name, date, status, event_type, outfit_request, price",
        )
        .eq("stylist_id", userId);

      if (error) {
        console.error("Error fetching bookings:", error.message);
        setBookings([]);
      } else {
        const payouts = await Promise.all(
          (data || []).map((booking: { price: number }) =>
            calculateStylistPayoutRPC({
              service_price: booking.price,
              stylist_tier: profileData?.subscription_tier || "Silver",
            }),
          ),
        );

        setBookings(
          (data || []).map((booking: { id: string; client_name?: string; date?: string; status?: string; event_type?: string; outfit_request?: string; price: number }, index: number) => ({
            id: booking.id,
            client_name: booking.client_name || "N/A",
            date: booking.date || "",
            status: booking.status || "pending",
            event_type: booking.event_type || "Unknown",
            outfit_request: booking.outfit_request || "None",
            price: booking.price || 0,
            payout: payouts[index] || 0,
          })),
        );
      }
      setLoading(false);
    };

    void fetchBookings();
  }, [userId]);

  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      console.error("Failed to update booking status:", error.message);
      return;
    }

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking,
      ),
    );
  };

  if (loading) return <Spinner />;

  return (
    <ProtectedLayout>
      <main style={{ padding: "2rem" }}>
        <h1
          style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
        >
          Stylist Dashboard
        </h1>
        <p>
          <strong>Monthly Earnings:</strong> $
          {calculateMonthlyEarnings(bookings).toFixed(2)}
        </p>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div>
            {bookings.map((booking) => (
              <section
                key={booking.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <p>
                  <strong>Client:</strong> {booking.client_name}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(booking.date)}
                </p>
                <p>
                  <strong>Event:</strong> {booking.event_type}
                </p>
                <p>
                  <strong>Request:</strong> {booking.outfit_request}
                </p>
                <p>
                  <strong>Price:</strong> ${booking.price.toFixed(2)}
                </p>
                <p>
                  <strong>Your Payout:</strong> ${booking.payout.toFixed(2)}
                </p>
                <p>
                  <strong>Status:</strong> {booking.status}
                </p>
                {booking.status === "pending" && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      onClick={() => void updateStatus(booking.id, "accepted")}
                      aria-label={`Accept booking for ${booking.client_name}`}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => void updateStatus(booking.id, "declined")}
                      aria-label={`Decline booking for ${booking.client_name}`}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </ProtectedLayout>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => ctx.req?.cookies?.[name] ?? null,
        set: () => {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: "/onboarding/role",
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId: user.id,
    },
  };
};

interface Booking {
  id: string;
  status: string;
  created_at: string;
  service_id?: string;
  product_name?: string;
  service_name?: string;
}
import React, { useEffect, useState } from "react";
import { supabaseServer } from "@/lib/supabaseServer";
const supabase = supabaseServer;
// Helper to get the current user session
async function getCurrentUser() {
  const session = await supabase.auth.getSession().then((r: { data: { session: any } }) => r.data.session);
  return session?.user;
}

// Helper to check seller role
async function checkSellerRole(userId: string) {
  const { data: user, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("Error fetching user role:", error);
    return false;
  }
  return user?.role === "seller";
}

// Helper to check onboarding status
async function checkOnboardingComplete(userId: string) {
  const { data: onboardingStatus, error } = await supabase
    .from("profiles")
    .select("has_completed_onboarding")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("Error fetching onboarding status:", error);
    return false;
  }
  return onboardingStatus?.has_completed_onboarding;
}
import AuthGuard from "@/components/AuthGuard";

interface SellerDashboardProps {
  userId: string;
}

// Helper for progress bar
function getProgressPercent(status: string) {
  switch (status) {
    case "pending":
      return 20;
    case "packed":
      return 40;
    case "ready_for_pickup":
      return 60;
    case "picked_up":
      return 80;
    case "delivered":
      return 100;
    default:
      return 0;
  }
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ userId }) => {
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalServices: 0,
    totalBookings: 0,
    statusCounts: {
      pending: 0,
      packed: 0,
      ready_for_pickup: 0,
      picked_up: 0,
      delivered: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [localUserId, setLocalUserId] = useState(userId);

  // Fetch userId if not present (client navigation fallback)
  useEffect(() => {
    async function fetchUserId() {
      if (!localUserId) {
        try {
          const currentUser = await getCurrentUser();
          if (currentUser) setLocalUserId(currentUser.id);
          else window.location.href = "/onboarding/role";
        } catch (err) {
          console.error("Failed to get user session", err);
          window.location.href = "/onboarding/role";
        }
      }
    }
    fetchUserId();
  }, [localUserId]);

  // Fetch and subscribe to data
  useEffect(() => {
    if (!localUserId) return;
    let cleanup: (() => void) | undefined;
    const fetchAll = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          window.location.href = "/onboarding/role";
          return;
        }
        // Role check
        const isSeller = await checkSellerRole(currentUser.id);
        if (!isSeller) {
          window.location.href = "/unauthorized";
          return;
        }
        // Onboarding check
        const onboarded = await checkOnboardingComplete(currentUser.id);
        if (!onboarded) {
          window.location.href = "/onboarding/details";
          return;
        }
        // Fetch services
        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .select("*")
          .eq("seller_id", localUserId);
        if (prodError) {
          console.error("Failed to fetch products:", prodError.message);
        }
        setServices(prodData || []);
        setAnalytics((prev) => ({
          ...prev,
          totalServices: (prodData || []).length,
        }));
        // Fetch bookings
        const { data: bookData, error: bookError } = await supabase
          .from('bookings')
          .select('id, status, created_at, service_id')
          .eq('seller_id', localUserId)
          .order('created_at', { ascending: false });

        if (bookError) {
          console.error('Failed to fetch bookings:', bookError.message);
          setBookings([]);
        } else if (bookData) {
          // Fetch product names for each booking
          const bookingsWithProductNames: Booking[] = await Promise.all(
            (bookData as Booking[]).map(async (booking: Booking) => {
              if (booking.service_id) {
                const { data: productData, error: productError } = await supabase
                  .from('products')
                  .select('name')
                  .eq('id', booking.service_id)
                  .single();

                if (!productError && productData) {
                  return { ...booking, product_name: productData.name };
                }
              }
              return { ...booking, product_name: 'Unknown Product' };
            })
          );

          setBookings(bookingsWithProductNames);
          // Analytics update
          const statusCounts = {
            pending: 0,
            packed: 0,
            ready_for_pickup: 0,
            picked_up: 0,
            delivered: 0,
          };
          (bookData as Booking[]).forEach((b: Booking) => {
            const s = b.status;
            if (s && statusCounts.hasOwnProperty(s)) {
              statusCounts[s as keyof typeof statusCounts]++;
            }
          });
          setAnalytics((prev) => ({
            ...prev,
            totalBookings: bookData.length,
            statusCounts,
          }));
        }
        setLoading(false);
        // Subscriptions
        const prodSub = supabase
          .channel("products_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products", filter: `seller_id=eq.${localUserId}` },
            () => fetchAll()
          )
          .subscribe();
        const bookSub = supabase
          .channel("bookings_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookings", filter: `seller_id=eq.${localUserId}` },
            () => fetchAll()
          )
          .subscribe();
        cleanup = () => {
          supabase.removeChannel(prodSub);
          supabase.removeChannel(bookSub);
        };
      } catch (err) {
        console.error("Error in dashboard data load", err);
        setLoading(false);
      }
    };
    fetchAll();
    return () => {
      if (cleanup) cleanup();
    };
  }, [localUserId]);

  // Booking status update
  async function updateBookingStatus(bookingId: string, newStatus: string) {
    await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId);
    // No need to refetch, realtime handles it
  }

  if (loading)
    return <div className="p-8 text-center">Loading seller dashboard...</div>;

  const profileImg =
    typeof window !== "undefined"
      ? sessionStorage.getItem("profile_image") || "/default-avatar.png"
      : "/default-avatar.png";

  return (
    <AuthGuard requiredRole="seller">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold">Seller Analytics</h2>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-gray-100 p-4 rounded shadow">
            <p>
              <strong>Total Services:</strong> {analytics.totalServices}
            </p>
            <p>
              <strong>Total Bookings:</strong> {analytics.totalBookings}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p>
              <strong>Booking Status Counts:</strong>
            </p>
            <ul className="list-disc list-inside">
              <li>Pending: {analytics.statusCounts.pending}</li>
              <li>Packed: {analytics.statusCounts.packed}</li>
              <li>Ready: {analytics.statusCounts.ready_for_pickup}</li>
              <li>Picked Up: {analytics.statusCounts.picked_up}</li>
              <li>Delivered: {analytics.statusCounts.delivered}</li>
            </ul>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">
          StreetStashed Seller Dashboard
        </h1>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Reload My Services
        </button>
        {/* Seller Profile */}
        <h2 className="text-xl font-semibold">Seller Profile</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Profile Image:</p>
          <img
            src={profileImg}
            alt="Current profile"
            className="w-24 h-24 rounded-full border mt-2"
          />
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fileInput = (e.target as HTMLFormElement).elements.namedItem(
              "avatar"
            ) as HTMLInputElement;
            const file = fileInput.files?.[0];
            if (!file) return;
            try {
              const currentUser = await getCurrentUser();
              const currentUserId = currentUser?.id;
              if (!currentUserId) {
                alert("User not found. Please log in again.");
                return;
              }
              const { error } = await supabase.storage
                .from("avatars")
                .upload(`users/${currentUserId}/profile.png`, file, {
                  upsert: true,
                });
              if (!error) {
                const publicURL = supabase.storage
                  .from("avatars")
                  .getPublicUrl(
                    `users/${currentUserId}/profile.png`
                  ).data.publicUrl;
                await supabase
                  .from("profiles")
                  .update({ profile_image_url: publicURL })
                  .eq("id", currentUserId);
                sessionStorage.setItem("profile_image", publicURL);
                alert("Profile image updated!");
              } else {
                alert("Failed to upload image.");
              }
            } catch (err) {
              console.error("Error uploading profile image:", err);
              alert("Error uploading profile image. Please try again later.");
            }
          }}
          className="space-y-4 mb-6"
        >
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="border p-2 w-full rounded"
            required
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Upload Profile Image
          </button>
        </form>
        {/* Upload Product */}
        <h2 className="text-xl font-semibold">Upload New Product/Bundle</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const service_name = (
              form.elements.namedItem("service_name") as HTMLInputElement
            ).value;
            const price = parseFloat(
              (form.elements.namedItem("price") as HTMLInputElement).value
            );
            const image_url = (
              form.elements.namedItem("image_url") as HTMLInputElement
            ).value;
            const description = (
              form.elements.namedItem("description") as HTMLInputElement
            ).value;
            const duration = (
              form.elements.namedItem("duration") as HTMLInputElement
            ).value;
            const seller_id = localUserId;
            if (!seller_id) {
              alert("Seller ID not found. Please log in again.");
              return;
            }
            const { error } = await supabase.from("products").insert([
              {
                name: service_name,
                price: price,
                image_url: image_url,
                seller_id: seller_id,
                status: "active",
                description: description,
                duration: duration,
              },
            ]);
            if (error) {
              setUploadMsg("Failed to upload product");
              return;
            }
            setUploadMsg("Product uploaded successfully");
            // Refetch services
            const { data: prodData } = await supabase
              .from("products")
              .select("*")
              .eq("seller_id", seller_id);
            setServices(prodData || []);
            setAnalytics((prev) => ({
              ...prev,
              totalServices: (prodData || []).length,
            }));
            form.reset();
          }}
          className="space-y-4 mb-6"
        >
          <input
            name="service_name"
            placeholder="Product Name"
            className="border p-2 w-full rounded"
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Price"
            className="border p-2 w-full rounded"
            required
          />
          <input
            name="image_url"
            placeholder="Image URL"
            className="border p-2 w-full rounded"
            required
          />
          <input
            name="duration"
            placeholder="Duration (e.g. 1 hr)"
            className="border p-2 w-full rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="border p-2 w-full rounded"
            rows={3}
          ></textarea>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Upload Product
          </button>
          {uploadMsg && <p className="text-sm italic">{uploadMsg}</p>}
        </form>
        {/* Service List */}
        <h2 className="text-xl font-semibold">Your Products</h2>
        {Array.isArray(services) && services.length === 0 ? (
          <p className="text-gray-500 italic">
            No products uploaded yet. Start by adding one above.
          </p>
        ) : (
          Array.isArray(services) &&
          services.map((service) => (
            <div
              key={service.id}
              className="border p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
            >
              <div className="flex-1">
                <img
                  src={service.image_url}
                  alt={service.name || service.service_name}
                  className="w-full sm:w-48 h-48 object-cover rounded mb-2"
                />
                <p>
                  <strong>Name:</strong> {service.name || service.service_name}
                </p>
                <p>
                  <strong>Price:</strong> ${service.price}
                </p>
                <p>
                  <strong>Duration:</strong> {service.duration}
                </p>
                <p>
                  <strong>Status:</strong> {service.status}
                </p>
              </div>
            </div>
          ))
        )}
        {/* Bookings */}
        <h2 className="text-xl font-semibold mt-8">Recent Bookings</h2>
        {Array.isArray(bookings) && bookings.length === 0 ? (
          <p className="text-gray-500 italic">
            No bookings found for your products yet.
          </p>
        ) : (
          Array.isArray(bookings) &&
          bookings.map((booking: Booking) => (
            <div
              key={booking.id}
              className="border p-4 rounded shadow mt-2 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
            >
              <div className="flex-1">
                <p>
                  <strong>Booking ID:</strong> {booking.id}
                </p>
                <p>
                  <strong>Status:</strong> {booking.status}
                </p>
                <p>
                  <strong>Booked Product:</strong>{" "}
                  {booking.product_name ||
                    booking.service_name ||
                    booking.service_id}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(booking.created_at).toLocaleString()}
                </p>
                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Pending</span>
                    <span>Packed</span>
                    <span>Ready for Pickup</span>
                    <span>Picked Up</span>
                    <span>Delivered</span>
                  </div>
                  <div className="flex w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        getProgressPercent(booking.status) >= 25
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${
                        getProgressPercent(booking.status) >= 50
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${
                        getProgressPercent(booking.status) >= 75
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${
                        getProgressPercent(booking.status) >= 100
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                      style={{ width: "25%" }}
                    />
                  </div>
                </div>
                {/* Optional Tracking Field */}
                {booking.status !== "delivered" && (
                  <input
                    type="text"
                    placeholder="Tracking or seller notes (optional)"
                    className="mt-2 border p-2 rounded w-full"
                    disabled
                  />
                )}
                {booking.status !== "delivered" && (
                  <div className="mt-2 space-y-2">
                    {booking.status === "pending" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(String(booking.id), "packed")
                        }
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        Mark as Packed
                      </button>
                    )}
                    {booking.status === "packed" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(
                            String(booking.id),
                            "ready_for_pickup"
                          )
                        }
                        className="w-full px-4 py-2 bg-green-600 text-white rounded"
                      >
                        Mark as Ready for Pickup
                      </button>
                    )}
                    {booking.status === "ready_for_pickup" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(String(booking.id), "picked_up")
                        }
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded"
                      >
                        Mark as Picked Up
                      </button>
                    )}
                    {booking.status === "picked_up" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(String(booking.id), "delivered")
                        }
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AuthGuard>
  );
};

export default function SellerDashboardPage(props: { userId: string }) {
  return <SellerDashboard userId={props.userId} />;
}

export async function getServerSideProps(context: any) {
  // Use browser client import for consistency, but SSR is not recommended for Supabase browser SDK.
  // This SSR logic is for initial prop population only.
  let userId = null;
  try {
    const { supabaseServer } = await import("@/lib/supabaseServer");
    const supabase = supabaseServer;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return {
        redirect: {
          destination: "/onboarding/role",
          permanent: false,
        },
      };
    }
    userId = session.user.id;
  } catch (err) {
    // Log error but do not leak details to user
    console.error("Error in getServerSideProps:", err);
    return {
      redirect: {
        destination: "/onboarding/role",
        permanent: false,
      },
    };
  }
  return {
    props: {
      userId,
    },
  };
}
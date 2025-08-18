import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, type NextRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import { useIsClient } from "@/lib/useIsClient";

const SiteHeader: React.FC = () => {
  const [user, _setUser] = useState<{ email?: string } | null>(null);
  const [role, _setRole] = useState<string | null>(null);
  const router = useRouter();
  const isClient = useIsClient();
  
  // Always call hooks at top level, even if we don't use them during SSR
  const cart = useCart();

  // Simple header for SSR
  if (!isClient) {
    return (
      <header className="w-full bg-black text-white py-4 px-6">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-new.png"
              alt="StreetStashed"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="text-xl font-bold text-yellow-400">
              StreetStashed
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-yellow-400 transition">
              Login
            </Link>
            <Link href="/signup" className="hover:text-yellow-400 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Client-side component with hooks
  return <ClientHeader user={user} role={role} setUser={_setUser} setRole={_setRole} router={router} cart={cart} />;
};

// Separate client component to avoid conditional hooks
const ClientHeader: React.FC<{
  user: { email?: string } | null;
  role: string | null;
  setUser: (user: { email?: string } | null) => void;
  setRole: (role: string | null) => void;
  router: NextRouter;
  cart: ReturnType<typeof useCart>; // Pass cart from parent to avoid conditional hook
}> = ({ user, role, setUser, setRole, router, cart }) => {
  // Client-side cart functionality - cart passed from parent
  const toggleCart = cart?.toggleCart || (() => console.log("Cart not available"));

  console.log("Header rendered");

  const userGreeting = user?.email?.split("@")[0] || "";

  const handleLogout = () => {
    // Simple logout - clear user state
    setUser(null);
    setRole(null);
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-secondary/75 backdrop-blur-lg border-b-4 border-primary shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            {/* Logo and Search */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Image
                    src="/logo-new.png"
                    alt="StreetStashed Logo"
                    width={40}
                    height={40}
                    style={{ height: "auto", width: "auto" }}
                    priority
                    unoptimized
                  />
                </Link>
                <Link href="/">
                  <span className="text-primary font-extrabold text-xl sm:text-2xl tracking-widest">
                    STREETSTASHED
                  </span>
                </Link>
              </div>
              <div className="w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search for brand, color, etc."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black bg-white"
                />
              </div>
              <div className="flex gap-4 mt-2 md:mt-0 items-center font-semibold">
                <Link href="/">
                  <button className="flex-shrink-0 px-4 py-2 rounded-full font-medium transition bg-primary text-black hover:bg-primary hover:text-black">
                    Home
                  </button>
                </Link>
                <Link href="/buyer/marketplace">
                  <button className="flex-shrink-0 px-4 py-2 rounded-full font-medium transition bg-black/50 text-white hover:bg-primary hover:text-black">
                    Marketplace
                  </button>
                </Link>
                {role === "buyer" && (
                  <Link href="/track-order">
                    <button className="flex-shrink-0 px-4 py-2 rounded-full font-medium transition bg-black/50 text-white hover:bg-primary hover:text-black">
                      Track Order
                    </button>
                  </Link>
                )}
                <button
                  onClick={() => {
                    console.log("🛒 Cart icon clicked");
                    toggleCart();
                  }}
                  aria-label="Open Cart"
                  className="flex-shrink-0 px-4 py-2 rounded-full font-medium transition bg-black/50 text-white hover:bg-primary hover:text-black relative"
                >
                  🛒
                </button>

                {/* Show greeting if logged in */}
                {user && (
                  <span className="text-white hidden md:inline">
                    Welcome, {userGreeting}
                  </span>
                )}

                {/* Auth buttons */}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex-shrink-0 px-4 py-2 rounded-full font-medium transition bg-black/50 text-white hover:bg-primary hover:text-black"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => void router.push("/signup?ref=header")}
                    className="flex-shrink-0 px-4 py-2 rounded-full font-medium transition bg-black/50 text-white hover:bg-primary hover:text-black"
                  >
                    Join Us
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default SiteHeader;

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const router = useRouter();
  const { toggleCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  console.log("Header rendered");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setUser(null);
        setRole(null);
        return;
      }

      const currentUser = session.user;

      const { data: userData } = await supabase
        .from("profiles")
        .select("role, details_complete, verified")
        .eq("id", currentUser.id)
        .single();

      setRole(userData?.role || null);

      if (!userData) return;

      setUser({
        ...currentUser,
        details_complete: userData?.details_complete || false,
        verified: userData?.verified || false,
      });
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.clear();
    router.replace("/");
  };

  const userGreeting = user?.email?.split("@")[0] || "";

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
                    onClick={() => router.push("/signup?ref=header")}
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
      <div className="h-20" /> {/* Spacer for fixed header */}
    </>
  );
};

export default Header;

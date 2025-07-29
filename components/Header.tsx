import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";

const Header = () => {
  const router = useRouter();
  const { /* totalCount, */ toggleCart } = useCart();
  // const [menuOpen, setMenuOpen] = useState(false);
  // const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

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

  const handleCartOpen = () => toggleCart();

  const handleJoinClick = () => {
    if (!user) return router.push("/Auth");
    if (!role) return router.push("/onboarding/role");
    if (role && !user.details_complete)
      return router.push("/onboarding/details");
    if (role && user.details_complete && !user.verified)
      return router.push("/onboarding/verify");
    if (role === "buyer") return router.push("/buyer/marketplace");
    router.push(`/${role}/dashboard`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.clear();
    router.replace("/");
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
                    src="/logo.png"
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
              <div className="flex gap-4 mt-2 md:mt-0">
                <button
                  onClick={handleCartOpen}
                  className="text-primary font-semibold hover:underline"
                >
                  View Cart
                </button>
                <button
                  onClick={handleJoinClick}
                  className="text-primary font-semibold hover:underline"
                >
                  Join Us
                </button>
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-semibold hover:underline"
                >
                  Logout
                </button>
              </div>
            </div>
            {/* Navigation and Actions */}
            {/* rest of component remains unchanged */}
          </div>
        </div>
      </header>
      <CartDrawer />
      <div className="h-20" /> {/* Push content below the fixed header */}
    </>
  );
};

export default Header;
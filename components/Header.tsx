import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { AuthSessionMissingError } from '@supabase/supabase-js';
import CartDrawer from './CartDrawer';
import { useCart } from '../context/CartContext';

const Header = () => {
  const router = useRouter();
  const { totalCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      const currentUser = data?.user;
      if (currentUser) {
        setUser(currentUser);
        const { data: userData } = await supabase
          .from('users')
          .select('role, details_complete, verified')
          .eq('id', currentUser.id)
          .single();
        setRole(userData?.role || null);
        setUser((prev: any) => ({
          ...prev,
          details_complete: userData?.details_complete || false,
          verified: userData?.verified || false,
        }));
      } else if (error && !(error instanceof AuthSessionMissingError)) {
        console.error('Supabase error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleCartOpen = () => setCartOpen(true);

  const handleJoinClick = () => {
    if (!user) return router.push('/signup');
    if (!role) return router.push('/onboarding/role');
    if (role && !user.details_complete) return router.push('/onboarding/details');
    if (role && user.details_complete && !user.verified) return router.push('/onboarding/verify');
    if (role === 'buyer') return router.push('/buyer/marketplace');
    router.push(`/${role}/dashboard`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-lg border-b-4 border-yellow-400 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-10 py-3 relative">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="rounded-full border-4 border-yellow-400 shadow-xl bg-black cursor-pointer">
              <Image
                src="/logo.png"
                alt="StreetStashed Logo"
                width={48}
                height={48}
                className="rounded-full border-4 border-yellow-400 shadow-xl bg-black cursor-pointer"
                priority
              />
            </Link>
            <span
              className="text-white font-extrabold text-xl sm:text-2xl md:text-3xl tracking-widest"
            >
              STREETSTASHED
            </span>
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 font-bold nav-links text-base md:text-lg">
            <Link href="/" className="cursor-pointer hover:text-yellow-400 transition">Home</Link>
            <Link href="/buyer/marketplace" className="cursor-pointer hover:text-yellow-400 transition">Marketplace</Link>
            <Link href="/stores" className="cursor-pointer hover:text-yellow-400 transition">Stores</Link>
            <Link href="/stylists" className="cursor-pointer hover:text-yellow-400 transition">Stylists</Link>
            <Link href="/track-order" className="cursor-pointer hover:text-yellow-400 transition">Track Order</Link>
            {/* Become a Seller */}
            <span
              className="ml-2 bg-yellow-400 text-black px-4 py-2 rounded-xl font-extrabold shadow-lg border-2 border-yellow-400 hover:bg-yellow-500 hover:scale-105 transition cursor-pointer"
              onClick={handleJoinClick}
            >
              Join Us
            </span>
            {/* Cart Icon */}
            <span
              role="button"
              tabIndex={0}
              aria-label="Open cart"
              title="Open cart"
              className={`relative ml-2 cursor-pointer text-2xl transition ${totalCount > 0 ? 'drop-shadow-[0_0_8px_#FFD700]' : ''}`}
              onClick={handleCartOpen}
              onKeyPress={(e) => { if (e.key === 'Enter') handleCartOpen(); }}
            >
              🛒
              {totalCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-extrabold px-2 rounded-full border-2 border-black ring-2 ring-yellow-300 animate-pulse">
                  {totalCount}
                </span>
              )}
            </span>
            {/* User Account Dropdown */}
            <div className="relative">
              <span
                role="button"
                tabIndex={0}
                aria-label="Account menu"
                title="Account"
                className="ml-5 text-2xl cursor-pointer hover:text-yellow-400 transition"
                onClick={() => setAccountOpen(!accountOpen)}
                onKeyPress={(e) => { if (e.key === 'Enter') setAccountOpen(!accountOpen); }}
              >
                👤
              </span>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#0d0d0d] border-2 border-yellow-400 shadow-xl rounded-xl py-2 z-50 animate-fade-in flex flex-col">
                  <Link href="/profile" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Profile</Link>
                  <Link href="/orders" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Orders</Link>
                  <Link href="/my-store" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">My Store</Link>
                  <Link href="/settings" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Logout</button>
                </div>
              )}
            </div>
          </nav>
          {/* Hamburger for Mobile */}
          <div className="md:hidden flex items-center">
            <button
              className="text-yellow-400 text-3xl focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
            >
              {menuOpen ? '✖' : '☰'}
            </button>
          </div>
          {/* Mobile Dropdown Menu */}
          {menuOpen && (
            <div className="absolute top-[100%] left-0 w-full bg-[#0d0d0d] border-b-4 border-yellow-400 shadow-2xl z-40 py-6 md:hidden flex flex-col items-center space-y-6 animate-fade-in">
              <Link href="/" onClick={() => setMenuOpen(false)} className="font-bold text-xl hover:text-yellow-400 transition">Home</Link>
              <Link href="/buyer/marketplace" onClick={() => setMenuOpen(false)} className="font-bold text-xl hover:text-yellow-400 transition">Marketplace</Link>
              <Link href="/stores" onClick={() => setMenuOpen(false)} className="font-bold text-xl hover:text-yellow-400 transition">Stores</Link>
              <Link href="/stylists" onClick={() => setMenuOpen(false)} className="font-bold text-xl hover:text-yellow-400 transition">Stylists</Link>
              <Link href="/track-order" onClick={() => setMenuOpen(false)} className="font-bold text-xl hover:text-yellow-400 transition">Track Order</Link>
              <span
                onClick={() => { setMenuOpen(false); handleJoinClick(); }}
                className="mt-2 bg-yellow-400 text-black px-4 py-3 rounded-xl font-extrabold shadow-lg border-2 border-yellow-400 hover:bg-yellow-500 hover:scale-105 transition text-lg"
              >
                Join Us
              </span>
              <span
                className={`relative cursor-pointer text-3xl ${totalCount > 0 ? 'drop-shadow-[0_0_8px_#FFD700]' : ''}`}
                onClick={() => { setMenuOpen(false); handleCartOpen(); }}
              >
                🛒
                {totalCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-extrabold px-2 rounded-full border-2 border-black ring-2 ring-yellow-300 animate-pulse">
                    {totalCount}
                  </span>
                )}
              </span>
              {/* User Account Icon (mobile) */}
              <span
                className="text-2xl cursor-pointer"
                onClick={() => setAccountOpen(!accountOpen)}
              >
                👤
              </span>
              {accountOpen && (
                <div className="w-full bg-[#0d0d0d] border-2 border-yellow-400 shadow-xl rounded-xl py-2 flex flex-col items-center z-50">
                  <Link href="/profile" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Profile</Link>
                  <Link href="/orders" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Orders</Link>
                  <Link href="/my-store" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">My Store</Link>
                  <Link href="/settings" className="px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2 hover:bg-yellow-400 hover:text-black rounded-xl transition">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <div className="h-20" /> {/* Push content below the fixed header */}
      <CartDrawer />
    </>
  );
};

export default Header;
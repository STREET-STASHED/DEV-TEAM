import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { totalCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const handleCartOpen = () => {
    setCartOpen(true);
  };

  return (
    <>
      <header className="bg-black text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="StreetStashed Logo" width={40} height={40} />
          <span className="text-lg font-bold tracking-wide logo-text">StreetStashed</span>
        </div>
        <nav className="space-x-4 text-sm flex items-center nav-links">
          {/* Always show public marketplace and stores links */}
          <Link href="/"><a className="hover:underline">Marketplace</a></Link>
          <Link href="/stores"><a className="hover:underline">Stores</a></Link>

          {/* Role-based dashboard links, enable if user is logged in */}
          {/*
            <Link href="/buyer/dashboard"><a className="hover:underline">Buyer</a></Link>
            <Link href="/seller/dashboard"><a className="hover:underline">Seller</a></Link>
            <Link href="/stylist/dashboard"><a className="hover:underline">Stylist</a></Link>
            <Link href="/driver/dashboard"><a className="hover:underline">Driver</a></Link>
            <Link href="/admin/dashboard"><a className="hover:underline">Admin</a></Link>
          */}
          {/* Cart icon always visible */}
          <span
            role="button"
            tabIndex={0}
            aria-label="Open cart"
            title="Open cart"
            className="relative ml-2 cursor-pointer"
            onClick={handleCartOpen}
            onKeyPress={(e) => { if (e.key === 'Enter') handleCartOpen(); }}
            style={{ fontSize: 26, color: '#FFD700' }}
          >
            🛒
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 rounded-full border-2 border-black">
                {totalCount}
              </span>
            )}
          </span>
        </nav>
      </header>
      <CartDrawer />

      <style jsx>{`
        @media (max-width: 600px) {
          .logo-text {
            font-size: 0.875rem;
          }
          .nav-links > a, .nav-links > span {
            margin-right: 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
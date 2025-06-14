import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-black text-white px-4 py-3 shadow-md flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Image src="/logo.png" alt="StreetStashed Logo" width={40} height={40} />
        <span className="text-lg font-bold tracking-wide">StreetStashed</span>
      </div>
      <nav className="space-x-4 text-sm">
        <Link href="/buyer/dashboard" className="hover:underline">Buyer</Link>
        <Link href="/seller/dashboard" className="hover:underline">Seller</Link>
        <Link href="/stylist/dashboard" className="hover:underline">Stylist</Link>
        <Link href="/driver/dashboard" className="hover:underline">Driver</Link>
        <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
      </nav>
    </header>
  );
};

export default Header;
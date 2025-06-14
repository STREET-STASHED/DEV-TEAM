import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '/public/logo.png';

export default function Splash() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Show for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white transition-opacity duration-700 ease-in-out">
      <div className="text-center space-y-4 animate-fadeIn">
        <Image src={logo} alt="StreetStashed Logo" width={120} height={120} className="mx-auto" />
        <h1 className="text-xl font-semibold">Welcome to StreetStashed</h1>
        <p className="text-sm text-gray-400">Powered by culture. Built for the streets.</p>
      </div>
    </div>
  );
}
// pages/index.tsx
import React from 'react';
import Link from 'next/link';
import UserIcon from '../components/UserIcon';
import CartIcon from '../components/CartIcon';
import CartDrawer from '../components/CartDrawer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-graffiti bg-cover bg-center text-white font-sans">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 bg-secondary/75 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">STREETSTASHED</Link>
        <div className="flex-1 mx-6">
          <input
            type="search"
            placeholder="Search streetwear…"
            className="w-full px-4 py-2 border border-primary rounded-lg bg-secondary/20 placeholder-primary focus:outline-none focus:ring focus:ring-primary/50"
          />
        </div>
        <nav className="flex items-center space-x-4">
          <button className="p-2 hover:text-accent"><UserIcon /></button>
          <button className="p-2 hover:text-accent"><CartIcon /></button>
        </nav>
      </header>

      {/* 2. HERO / FEATURED */}
      <section className="relative w-full h-64 bg-hero-bg bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-secondary/60" />
        <div className="relative z-10 max-w-lg w-full p-8 bg-secondary/80 rounded-xl shadow-lg text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">Drop Alert: Exclusive AJ1 Retro</h1>
          <Link
            href="/marketplace"
            className="inline-block bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-accent transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* 3. CATEGORY NAV */}
      <nav className="overflow-x-auto whitespace-nowrap py-4 px-6 space-x-4 bg-secondary/20">
        <Link href="?cat=men" className="inline-block px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary/70">Men</Link>
        <Link href="?cat=women" className="inline-block px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary/70">Women</Link>
        <Link href="?cat=apparel" className="inline-block px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary/70">Apparel</Link>
      </nav>

      {/* 4. FILTER + PRODUCT GRID */}
      <div className="flex grow">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-60 border-r border-secondary/50 px-4 py-6 bg-secondary/20">
          <h5 className="font-semibold text-primary mb-4">Filters</h5>
          {/* Insert filter controls here */}
        </aside>

        {/* Products */}
        <main className="flex-1 p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Example Card */}
          <div className="bg-secondary/80 rounded-lg shadow hover:shadow-lg overflow-hidden flex flex-col">
            <img src="/images/sneaker1.jpg" alt="Sneaker" className="w-full h-48 object-cover"/>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-white">Air Jordan 1 Retro</h3>
                <p className="text-lg font-bold text-primary">$250</p>
              </div>
              <button className="mt-4 w-full bg-primary text-secondary py-2 rounded-lg font-semibold hover:bg-accent transition">
                Buy Now
              </button>
            </div>
          </div>
          {/* …repeat cards dynamically… */}
        </main>
      </div>

      {/* 5. CART DRAWER */}
      <CartDrawer />

      {/* 6. FOOTER */}
      <footer className="bg-secondary/90 text-sm text-secondary/50 py-6 px-6">
        © 2025 STREETSTASHED™ &nbsp; • &nbsp; Terms &nbsp; • &nbsp; Privacy &nbsp; • &nbsp; Help
      </footer>
    </div>
  );
};

export default HomePage;
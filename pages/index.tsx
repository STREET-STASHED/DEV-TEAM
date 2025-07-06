// pages/index.tsx
import React from 'react';
import Link from 'next/link';
import CategoryNav from '../components/CategoryNav';
import FiltersSidebar from '../components/FiltersSidebar';
import ProductCard, { Product } from '../components/ProductCard';

// Temporary dummy products until real data is loaded
const dummyProducts: Product[] = Array.from({ length: 8 }).map((_, i) => ({
  id: (i + 1).toString(),
  name: `StreetStashed Sneaker #${i + 1}`,
  price: 250 + i * 10,
  image: '/images/sneaker1.jpg',
}));

const HomePage: React.FC = () => {
  return (
    <>
      {/* 1. HERO / FEATURED */}
      <section className="relative w-full h-[80vh] bg-hero-bg bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-secondary/60" />
        <div className="relative z-10 max-w-lg w-full p-8 bg-secondary/80 rounded-xl shadow-xl text-center space-y-4">
          <h1 className="text-5xl font-extrabold text-primary">
            StreetStashed
          </h1>
          <p className="text-lg text-secondary/90">
            Streetwear Delivered. Culture Curated.
          </p>
          <Link
            href="/marketplace"
            className="inline-block bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-accent transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* 2. CATEGORY NAV */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryNav />
      </section>

      {/* 3. FILTER + PRODUCT GRID */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-4 gap-8 pb-16">
        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <FiltersSidebar />
        </aside>

        {/* Products grid */}
        <section className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Example cards */}
          {dummyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </main>
    </>
  );
};

export default HomePage;
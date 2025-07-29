// components/CategoryNav.tsx
import React from "react";
import Link from "next/link";

const categories = [
  { slug: "men", label: "Men" },
  { slug: "women", label: "Women" },
  { slug: "apparel", label: "Apparel" },
  { slug: "accessories", label: "Accessories" },
  // add more as needed…
];

export default function CategoryNav() {
  return (
    <nav className="overflow-x-auto whitespace-nowrap py-2">
      {categories.map(({ slug, label }) => (
        <Link
          key={slug}
          href={`?cat=${slug}`}
          className="inline-block mr-4 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary/70 text-primary font-medium"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

// components/ProductCard.tsx
import React from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="flex flex-col bg-secondary/80 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover mb-4"
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
        <p className="text-primary mb-4 font-bold">${product.price}</p>
        <button
          onClick={() => {}}
          className="mt-4 w-full bg-primary text-secondary py-2 rounded-lg font-semibold hover:bg-accent transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

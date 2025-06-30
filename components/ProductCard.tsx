import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [inCart, setInCart] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      quantity: 1,
    });
    setInCart(true);
  };

  const isOutOfStock = false; // Replace with actual logic if available
  const hasDiscount = false; // Replace with actual logic if available
  const originalPrice = product.price * 1.2;

  return (
    <div className="product-card border p-4 rounded shadow hover:shadow-lg transition-transform transform hover:-translate-y-1 bg-white">
      <Link
        href={`/products/${product.id}`}
        className="block"
      >
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover mb-4 rounded"
          />
        )}
        <h3 className="text-lg font-semibold">{product.name}</h3>
        {hasDiscount ? (
          <p className="text-gray-700 mb-2">
            <span className="line-through text-sm mr-2">${originalPrice.toFixed(2)}</span>
            <span className="text-red-600 font-bold">${product.price.toFixed(2)}</span>
          </p>
        ) : (
          <p className="text-gray-700 mb-2">${product.price.toFixed(2)}</p>
        )}
      </Link>
      {isOutOfStock ? (
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded cursor-not-allowed"
          disabled
        >
          Out of Stock
        </button>
      ) : inCart ? (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled
        >
          In Cart
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

export default ProductCard;
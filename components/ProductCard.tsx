import React from 'react';
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
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    };
    addToCart(newItem);
  };

  return (
    <div className="product-card border p-4 rounded shadow">
      {product.image && <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />}
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-700 mb-2">${product.price.toFixed(2)}</p>
      <button
        onClick={handleAddToCart}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
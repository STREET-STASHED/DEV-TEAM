import React from 'react';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      quantity: 1,
    });
  };

  return (
    <div className="bg-white text-black rounded shadow p-4 flex flex-col items-start">
      {product.image && (
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded mb-2" />
      )}
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="mb-2">${product.price.toFixed(2)}</p>
      <button
        onClick={handleAddToCart}
        className="mt-auto bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        Add to Cart
      </button>
    </div>
  );
};

const Marketplace = () => {
  const products: Product[] = [
    { id: '1', name: 'T-Shirt', price: 29.99, image: '/images/tshirt.png' },
    { id: '2', name: 'Sneakers', price: 89.99, image: '/images/sneakers.png' },
    { id: '3', name: 'Cap', price: 19.99, image: '/images/cap.png' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <CartDrawer />
    </div>
  );
};

export default Marketplace;
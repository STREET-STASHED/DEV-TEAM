import React from 'react';
import { useCart } from '@/context/CartContext';

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
    <div>
      <h2>{product.name}</h2>
      <p>${product.price.toFixed(2)}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

const Marketplace = () => {
  const products: Product[] = [
    { id: '1', name: 'T-Shirt', price: 29.99 },
    { id: '2', name: 'Sneakers', price: 89.99 },
    { id: '3', name: 'Cap', price: 19.99 },
  ];

  return (
    <div>
      <h1>Marketplace</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Marketplace;
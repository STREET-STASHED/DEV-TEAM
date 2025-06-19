import React from 'react';
import { useCart } from '../../context/CartContext';

const mockProducts = [
  {
    id: '1',
    name: 'Streetwear Hoodie',
    price: 80,
    image: '/hoodie.png',
  },
  {
    id: '2',
    name: 'Luxury Sneakers',
    price: 200,
    image: '/sneakers.png',
  },
];

const ProductList = () => {
  const { addItem } = useCart();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Explore the Drip</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover mb-3 rounded"
            />
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <p className="text-gray-600 mb-2">${product.price}</p>
            <button
              onClick={() =>
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors duration-200 w-full"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

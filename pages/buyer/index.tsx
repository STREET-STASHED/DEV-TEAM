import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ProductList = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<{ id: string; name: string; price: number; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('products').select('id, name, price, image_url');
      if (error) {
        setError('Failed to fetch products.');
        setProducts([]);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="p-4 text-center">No products available.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Explore the Drip</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white"
          >
            <img
              src={product.image_url}
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
                  image: product.image_url,
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

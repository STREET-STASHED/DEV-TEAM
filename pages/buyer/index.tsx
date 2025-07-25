import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { supabase } from '@/lib/supabase/client';


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
    <div className="p-4 sm:p-6 bg-black min-h-screen text-gold">
      <h2 className="text-4xl font-extrabold mb-8 text-center uppercase tracking-wide graffiti-text">
        Explore the Drip
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-zinc-900 border border-gold rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-52 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gold">{product.name}</h3>
              <p className="text-sm sm:text-md text-gold-light mb-4">${product.price}</p>
              <button
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image_url,
                    quantity: 1,
                  })
                }
                className="bg-gold text-black font-bold py-2 px-4 rounded-md hover:bg-yellow-400 w-full transition shadow-md"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

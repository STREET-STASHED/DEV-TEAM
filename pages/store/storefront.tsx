

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  store: {
    name: string;
  };
}

const Storefront = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, store(name)')
        .limit(20); // limit for performance

      if (error) {
        console.error('Error loading products:', error);
      } else {
        setProducts(
          (data || []).map((item: any) => ({
            ...item,
            store: item.store[0], // assume first store only
          }))
        );
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Storefront
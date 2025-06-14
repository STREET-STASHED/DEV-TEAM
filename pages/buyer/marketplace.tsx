import AuthGuard from '@/components/AuthGuard';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import supabase from '@/lib/supabaseClient';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const { toggleCart = () => {} } = useCart() || {};

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error('Error fetching products:', error);
      else setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <AuthGuard role="buyer">
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">Marketplace</h1>
          <button
            onClick={toggleCart}
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-900 transition"
          >
            View Cart
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <CartDrawer />
      </div>
    </AuthGuard>
  );
};

export default Marketplace;
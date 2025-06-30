import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';

export default function Marketplace() {
  const { addItem, hasItem } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchStoresWithProducts = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          id,
          name,
          category,
          products (
            id,
            name,
            price,
            image_url,
            type
          )
        `);

      if (error) {
        console.error('Failed to load stores:', error);
      } else {
        setStores(data || []);
      }
    };

    fetchStoresWithProducts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-bold text-4xl mb-2">StreetStashed Marketplace</h1>
      <p className="mb-8">Browse stores, products, jewelry, kicks, and stylist bundles — no login required.</p>
      <div className="flex flex-wrap gap-8">
        {stores.map((store) => (
          <div key={store.id} className="border border-gray-800 rounded-2xl p-6 w-[300px] bg-[#fafbfc]">
            <Link
              href={`/stores/${store.id}`}
              className="text-lg font-semibold text-blue-500 cursor-pointer"
            >
              {store.name}
            </Link>
            <span className="text-sm text-gray-500">{store.category}</span>
            <div className="flex gap-4 mt-4">
              {store.products && store.products.map((prod: any) => (
                <div key={prod.id} className="text-center">
                  <Link href={`/stores/${store.id}/products/${prod.id}`}>
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-[90px] h-[90px] rounded-lg object-cover mb-1.5 border border-gray-300 cursor-pointer"
                    />
                  </Link>
                  <div className="font-medium">{prod.name}</div>
                  <div className="text-sm text-gray-800">${prod.price}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{prod.type}</div>
                  {isLoggedIn ? (
                    <button
                      className={`mt-2 px-4 py-1.5 rounded text-sm text-white ${hasItem(prod.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-black cursor-pointer'}`}
                      onClick={() => addItem({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        image: prod.image_url,
                        quantity: 1,
                      })}
                      disabled={hasItem(prod.id)}
                    >
                      {hasItem(prod.id) ? 'Added!' : 'Add to Cart'}
                    </button>
                  ) : (
                    <button
                      className="mt-2 px-4 py-1.5 bg-blue-500 text-white rounded text-sm cursor-pointer"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Sign up to Purchase
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
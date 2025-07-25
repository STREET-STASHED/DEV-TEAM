// pages/buyer/marketplace.tsx
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

type Store = {
  id: string;
  name: string;
  category: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image_url: string;
    type: string;
  }>;
};

type Stylist = {
  id: string;
  name: string;
  image_url: string;
};

export default function Marketplace() {
  const { addItem, hasItem } = useCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'All' | 'Stylists' | string>('All');
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // Fetch stores
  useEffect(() => {
    async function fetchStores() {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          id, name, category,
          products ( id, name, price, image_url, type )
        `);
      if (!error) {
        if (!data || data.length === 0) {
          setStores([
            {
              id: 'mock1',
              name: 'Drip City',
              category: 'Streetwear',
              products: [
                {
                  id: 'p1',
                  name: 'Gold Hoodie',
                  price: 120,
                  image_url: '/mock/gold-hoodie.jpg',
                  type: 'Hoodie'
                }
              ]
            },
            {
              id: 'mock2',
              name: 'Lux Vault',
              category: 'Luxury',
              products: [
                {
                  id: 'p2',
                  name: 'Designer Shades',
                  price: 300,
                  image_url: '/mock/shades.jpg',
                  type: 'Accessories'
                }
              ]
            }
          ]);
        } else {
          setStores(data);
        }
      }
    }
    fetchStores();
  }, []);

  // Fetch stylists
  useEffect(() => {
    if (selectedTab !== 'Stylists') return;
    async function fetchStylists() {
      const { data, error } = await supabase
        .from('stylists')
        .select('id, name, image_url');
      if (!error) {
        if (!data || data.length === 0) {
          setStylists([
            {
              id: 'sty1',
              name: 'Kiara Styles',
              image_url: '/mock/stylist1.jpg'
            },
            {
              id: 'sty2',
              name: 'J Luxe',
              image_url: '/mock/stylist2.jpg'
            }
          ]);
        } else {
          setStylists(data);
        }
      }
    }
    fetchStylists();
  }, [selectedTab]);

  // Categories from stores + manual "Stylists"
  const categories = ['All', 'Stylists', ...Array.from(new Set(stores.map((s) => s.category)))];

  // Filter + paginate stores
  const filteredStores = selectedTab === 'All'
    ? stores
    : selectedTab === 'Stylists'
      ? []
      : stores.filter((s) => s.category === selectedTab);

  const visibleStores = filteredStores.slice(0, page * pageSize);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPage((p) => p + 1),
      { rootMargin: '200px' }
    );
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [loadMoreRef.current, selectedTab]);

  return (
    <div
      className="min-h-screen p-8 text-white"
      style={{
        backgroundImage: `url('/bg/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
        {/* TOP NAV */}
        <nav className="flex space-x-4 overflow-x-auto mb-8">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => { setSelectedTab(tab); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition ${
                selectedTab === tab
                  ? 'bg-gold text-black'
                  : 'bg-black/50 text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        {selectedTab === 'Stylists' ? (
          // Stylists View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {stylists.map((stylist) => (
              <div
                key={stylist.id}
                className="bg-black/70 p-6 rounded-lg hover:shadow-xl transition text-center"
              >
                <img
                  src={stylist.image_url || '/mock/default-stylist.jpg'}
                  alt={stylist.name}
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
                />
                <h2 className="text-xl font-bold text-gold">{stylist.name}</h2>
                <Link href={`/stylists/${stylist.id}`}>
                  <button className="mt-3 px-4 py-2 bg-gold text-black rounded font-medium hover:bg-gold/80 transition">
                    View Bundles
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          // Stores View
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {visibleStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-black/70 p-6 rounded-lg hover:shadow-xl transition"
                >
                  <h2 className="text-2xl font-bold text-gold mb-2">{store.name}</h2>
                  <p className="text-sm text-gray-300 mb-4">Arrives in under 1hr</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {store.products.map((prod) => (
                      <div key={prod.id} className="w-[90px] text-center">
                        <Link href={`/stores/${store.id}/products/${prod.id}`}>
                          <img
                            src={prod.image_url || '/mock/default-product.jpg'}
                            alt={prod.name}
                            className="w-full h-[90px] object-cover rounded-lg border border-gray-600 hover:scale-105 transition"
                          />
                        </Link>
                        <p className="mt-1 text-sm font-medium text-white">{prod.name}</p>
                        <p className="text-xs text-gray-400">${prod.price}</p>
                        {isLoggedIn ? (
                          <button
                            onClick={() => addItem({
                              id: prod.id,
                              name: prod.name,
                              price: prod.price,
                              image: prod.image_url,
                              quantity: 1,
                            })}
                            disabled={hasItem(prod.id)}
                            className={`mt-2 px-2 py-1 rounded text-xs font-semibold transition ${
                              hasItem(prod.id)
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-gold text-black hover:bg-gold/80'
                            }`}
                          >
                            {hasItem(prod.id) ? 'Added' : 'Add'}
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push('/auth')}
                            className="mt-2 px-2 py-1 bg-gold text-black rounded text-xs font-semibold hover:bg-gold/80 transition"
                          >
                            Sign up to Buy
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="h-10" />
          </>
        )}
      </div>
  );
}
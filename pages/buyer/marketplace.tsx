// pages/buyer/marketplace.tsx
import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

interface Store {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

interface ProductWithStore {
  id: string;
  name: string;
  price: number;
  image_url: string;
  store_id: string;
  storefronts: { name: string };
}

type FeedItem =
  | { type: 'store'; data: Store }
  | { type: 'product'; data: ProductWithStore };

const StoreCard: React.FC<{ store: Store }> = ({ store }) => (
  <Link href={`/stores/${store.id}`}>
    <a className="block mb-6 bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {store.image_url ? (
        <img
          src={store.image_url}
          alt={store.name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold">{store.name}</h2>
        {store.description && (
          <p className="text-gray-600 mt-1 line-clamp-2">
            {store.description}
          </p>
        )}
      </div>
    </a>
  </Link>
);

const ProductCard: React.FC<{ product: ProductWithStore }> = ({ product }) => {
  const { addItem } = useCart();
  return (
    <div className="mb-6 bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <Link href={`/stores/${product.store_id}/products/${product.id}`}>
          <a className="block">
            <h3 className="text-lg font-semibold">{product.name}</h3>
          </a>
        </Link>
        <p className="text-sm text-gray-500">{product.storefronts.name}</p>
        <p className="text-lg font-medium mt-1">${product.price.toFixed(2)}</p>
        <button
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image_url,
            })
          }
          className="mt-3 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const Marketplace: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      const respStores = await supabase
        .from('storefronts')
        .select('id, name, description, image_url');
      const storeList: Store[] = (respStores.data ?? []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        image_url: s.image_url,
      }));
      const storeErr = respStores.error;
      const respProducts = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          store_id,
          storefronts ( name )
        `);
      const productListRaw = respProducts.data ?? [];
      const prodErr = respProducts.error;

      // Map productListRaw to ProductWithStore[]
      const productList: ProductWithStore[] = productListRaw.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        store_id: p.store_id,
        storefronts: {
          name: p.storefronts?.name ?? '',
        },
      }));

      if (!storeErr && !prodErr && storeList && productList) {
        const items: FeedItem[] = [
          ...storeList.map((s) => ({ type: 'store' as const, data: s })),
          ...productList.map((p) => ({ type: 'product' as const, data: p })),
        ];
        setFeed(items);
      } else {
        console.error(storeErr || prodErr);
      }
      setLoading(false);
    }
    fetchFeed();
  }, []);

  if (loading) {
    return <p className="p-4 text-center">Loading marketplace…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
        {feed.map((item, idx) =>
          item.type === 'store' ? (
            <StoreCard key={`store-${item.data.id}`} store={item.data} />
          ) : (
            <ProductCard
              key={`prod-${item.data.store_id}-${item.data.id}`}
              product={item.data}
            />
          )
        )}
      </main>
    </div>
  );
};

export default Marketplace;
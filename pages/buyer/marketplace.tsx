import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useEffect, useState } from 'react';
import supabase from '../../lib/ssupabaseClient';

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
    <div style={{ padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 36, marginBottom: 8 }}>StreetStashed Marketplace</h1>
      <p style={{ marginBottom: 32 }}>Browse stores, products, jewelry, kicks, and stylist bundles — no login required.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        {stores.map((store) => (
          <div key={store.id} style={{ border: '1px solid #222', borderRadius: 16, padding: 24, width: 300, background: '#fafbfc' }}>
            <Link href={`/stores/${store.id}`}>
              <h2 style={{ fontSize: 22, fontWeight: 600, cursor: 'pointer', color: '#0070f3' }}>{store.name}</h2>
            </Link>
            <span style={{ fontSize: 14, color: '#888' }}>{store.category}</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
              {store.products && store.products.map((prod: any) => (
                <div key={prod.id} style={{ textAlign: 'center' }}>
                  <Link href={`/stores/${store.id}/products/${prod.id}`}>
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', marginBottom: 6, border: '1px solid #ddd', cursor: 'pointer' }}
                    />
                  </Link>
                  <div style={{ fontWeight: 500 }}>{prod.name}</div>
                  <div style={{ color: '#333', fontSize: 14 }}>${prod.price}</div>
                  <div style={{ fontSize: 12, color: '#AAA', marginTop: 2 }}>{prod.type}</div>
                  {isLoggedIn ? (
                    <button
                      style={{
                        marginTop: 8,
                        padding: '6px 16px',
                        background: hasItem(prod.id) ? '#aaa' : '#111',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: hasItem(prod.id) ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                      }}
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
                      style={{
                        marginTop: 8,
                        padding: '6px 16px',
                        background: '#0070f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
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
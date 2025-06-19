import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStores } from '../../lib/dataSource';
import { useCart } from '../../context/CartContext'; // <-- NEW

export default function Marketplace() {
  const [stores, setStores] = useState<any[]>([]);
  const { addItem, hasItem } = useCart(); // <-- NEW

  useEffect(() => {
    getStores().then(setStores);
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
                      src={prod.image}
                      alt={prod.name}
                      style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', marginBottom: 6, border: '1px solid #ddd', cursor: 'pointer' }}
                    />
                  </Link>
                  <div style={{ fontWeight: 500 }}>{prod.name}</div>
                  <div style={{ color: '#333', fontSize: 14 }}>${prod.price}</div>
                  <div style={{ fontSize: 12, color: '#AAA', marginTop: 2 }}>{prod.type}</div>
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
                      image: prod.image,
                      quantity: 1,
                    })}
                    disabled={hasItem(prod.id)}
                  >
                    {hasItem(prod.id) ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
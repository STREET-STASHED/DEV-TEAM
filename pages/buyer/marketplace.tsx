import Link from 'next/link';
import { useCart } from '../../context/CartContext';

// Hardcoded demo data for public marketplace
const demoStores = [
  {
    id: '1',
    name: 'Drip District',
    category: 'Clothing',
    products: [
      {
        id: '1-1',
        name: 'Classic Street Hoodie',
        price: 68,
        image: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=facearea&w=400&h=400',
        type: 'Clothing',
      },
      {
        id: '1-2',
        name: 'Retro Logo Tee',
        price: 32,
        image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=facearea&w=400&h=400',
        type: 'Clothing',
      },
    ],
  },
  {
    id: '2',
    name: 'Flex Kicks',
    category: 'Shoes',
    products: [
      {
        id: '2-1',
        name: 'Air Hustle Sneakers',
        price: 125,
        image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=facearea&w=400&h=400',
        type: 'Shoes',
      },
      {
        id: '2-2',
        name: 'Gold Runner Highs',
        price: 185,
        image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a83b4?auto=format&fit=facearea&w=400&h=400',
        type: 'Shoes',
      },
    ],
  },
  {
    id: '3',
    name: 'Iceworks',
    category: 'Jewelry',
    products: [
      {
        id: '3-1',
        name: 'Diamond Cuban Chain',
        price: 2100,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=facearea&w=400&h=400',
        type: 'Jewelry',
      },
      {
        id: '3-2',
        name: 'Gold Micro Jesus Piece',
        price: 650,
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400',
        type: 'Jewelry',
      },
    ],
  },
  {
    id: '4',
    name: 'Styled by Mya',
    category: 'Stylist',
    products: [
      {
        id: '4-1',
        name: 'Birthday Drip Bundle',
        price: 300,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&h=400',
        type: 'Bundle',
      },
      {
        id: '4-2',
        name: 'Prom Night Flex',
        price: 425,
        image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=400&h=400',
        type: 'Bundle',
      },
    ],
  },
];

export default function Marketplace() {
  const { addItem, hasItem } = useCart();

  const stores = demoStores;

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
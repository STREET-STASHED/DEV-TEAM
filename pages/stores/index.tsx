import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { stores, products, Product } from '../../lib/mockProducts';

const StorePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const store = typeof id === 'string' ? stores.find((s: typeof stores[number]) => s.id === id) : undefined;
  const items = typeof id === 'string' ? products[id] || [] : [];

  if (!store) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Store Not Found</h1>
        <Link href="/stores">Back to all stores</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{store.name}</h1>
      <p>Welcome to {store.name}'s storefront demo.</p>

      <h2>Products</h2>
      <ul>
        {items.map((product: Product) => (
          <li key={product.id} style={{ marginBottom: '16px' }}>
            <img src={product.image} alt={product.name} width={150} height={150} />
            <p>{product.name}</p>
            <p>${product.price.toFixed(2)}</p>
          </li>
        ))}
      </ul>

      <Link href="/stores">← Back to Stores</Link>
    </div>
  );
};

export default StorePage;

// pages/stores/index.tsx

import React from 'react';
import Link from 'next/link';

const demoStores = [
  {
    id: 'drip-district',
    name: "Drip District",
    category: "Clothing",
    image: "https://picsum.photos/id/1012/250/200",
    description: "Streetwear essentials and exclusive drops.",
  },
  {
    id: 'flex-kicks',
    name: "Flex Kicks",
    category: "Shoes",
    image: "https://picsum.photos/id/1013/250/200",
    description: "The latest and rarest sneakers.",
  },
  {
    id: 'iceworks',
    name: "Iceworks",
    category: "Jewelry",
    image: "https://picsum.photos/id/1016/250/200",
    description: "Custom chains, grillz, and more.",
  },
  {
    id: 'styled-by-mya',
    name: "Styled by Mya",
    category: "Stylist",
    image: "https://picsum.photos/id/1020/250/200",
    description: "Event bundles, prom, birthdays, and more.",
  },
];

export default function StoresIndex() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>All Stores on StreetStashed</h1>
      <p style={{ marginBottom: 32 }}>Browse our demo stores — click a store for details and products.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        {demoStores.map((store) => (
          <Link key={store.id} href={`/stores/${store.id}`}>
            <div style={{
              border: '1px solid #222',
              borderRadius: 16,
              padding: 24,
              width: 260,
              background: '#fafbfc',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}>
              <img
                src={store.image}
                alt={store.name}
                style={{
                  width: '100%',
                  height: 140,
                  borderRadius: 12,
                  objectFit: 'cover',
                  marginBottom: 12,
                  border: '1px solid #eee',
                }}
              />
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{store.name}</h2>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>{store.category}</div>
              <p style={{ fontSize: 15, color: '#333' }}>{store.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

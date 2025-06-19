// pages/index.tsx

import React from 'react';

const demoStores = [
  {
    name: "Drip District",
    category: "Clothing",
    products: [
      { name: "Classic Street Hoodie", price: 68, image: "https://picsum.photos/id/1011/200/200", type: "Clothing" },
      { name: "Retro Logo Tee", price: 32, image: "https://picsum.photos/id/1012/200/200", type: "Clothing" },
    ],
  },
  {
    name: "Flex Kicks",
    category: "Shoes",
    products: [
      { name: "Air Hustle Sneakers", price: 125, image: "https://picsum.photos/id/1013/200/200", type: "Shoes" },
      { name: "Gold Runner Highs", price: 185, image: "https://picsum.photos/id/1015/200/200", type: "Shoes" },
    ],
  },
  {
    name: "Iceworks",
    category: "Jewelry",
    products: [
      { name: "Diamond Cuban Chain", price: 2100, image: "https://picsum.photos/id/1016/200/200", type: "Jewelry" },
      { name: "Gold Micro Jesus Piece", price: 650, image: "https://picsum.photos/id/1018/200/200", type: "Jewelry" },
    ],
  },
  {
    name: "Styled by Mya",
    category: "Stylist",
    products: [
      { name: "Birthday Drip Bundle", price: 300, image: "https://picsum.photos/id/1020/200/200", type: "Bundle" },
      { name: "Prom Night Flex", price: 425, image: "https://picsum.photos/id/1022/200/200", type: "Bundle" },
    ],
  },
];

export default function Home() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 36, marginBottom: 8 }}>StreetStashed Demo Marketplace</h1>
      <p style={{ marginBottom: 32 }}>Browse featured stores, products, jewelry, kicks, and stylist bundles — no login required.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        {demoStores.map((store) => (
          <div key={store.name} style={{ border: '1px solid #222', borderRadius: 16, padding: 24, width: 300, background: '#fafbfc' }}>
            <h2 style={{ fontSize: 22, fontWeight: 600 }}>{store.name}</h2>
            <span style={{ fontSize: 14, color: '#888' }}>{store.category}</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
              {store.products.map((prod) => (
                <div key={prod.name} style={{ textAlign: 'center' }}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', marginBottom: 6, border: '1px solid #ddd' }}
                  />
                  <div style={{ fontWeight: 500 }}>{prod.name}</div>
                  <div style={{ color: '#333', fontSize: 14 }}>${prod.price}</div>
                  <div style={{ fontSize: 12, color: '#AAA', marginTop: 2 }}>{prod.type}</div>
                  <button
                    style={{
                      marginTop: 8,
                      padding: '6px 16px',
                      background: '#111',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    disabled
                  >
                    View
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

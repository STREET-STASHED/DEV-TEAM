// pages/stores/[store_id]/index.tsx
import React from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../../../context/CartContext'

const demoStores = [
  {
    id: '1',
    slug: 'drip-district',
    name: 'Drip District',
    description: 'Premium streetwear & clothing.',
    category: 'Clothing',
  },
  {
    id: '2',
    slug: 'flex-kicks',
    name: 'Flex Kicks',
    description: 'Exclusive sneaker releases.',
    category: 'Shoes',
  },
  {
    id: '3',
    slug: 'iceworks',
    name: 'Iceworks',
    description: 'High-end jewelry and accessories.',
    category: 'Jewelry',
  },
  {
    id: '4',
    slug: 'styled-by-mya',
    name: 'Styled by Mya',
    description: 'Stylist bundles and personal shopping.',
    category: 'Stylist',
  },
]

const demoProducts = [
  // Drip District
  { id: '101', store_slug: 'drip-district', name: 'Classic Street Hoodie', price: 68, image_url: '/demo/hoodie.jpg' },
  { id: '102', store_slug: 'drip-district', name: 'Retro Logo Tee', price: 32, image_url: '/demo/tshirt.jpg' },
  // Flex Kicks
  { id: '201', store_slug: 'flex-kicks', name: 'Air Hustle Sneakers', price: 125, image_url: '/demo/sneaker1.jpg' },
  { id: '202', store_slug: 'flex-kicks', name: 'Gold Runner Highs', price: 185, image_url: '/demo/sneaker2.jpg' },
  // Iceworks
  { id: '301', store_slug: 'iceworks', name: 'Diamond Cuban Chain', price: 2100, image_url: '/demo/chain.jpg' },
  { id: '302', store_slug: 'iceworks', name: 'Gold Micro Jesus Piece', price: 650, image_url: '/demo/jesuspiece.jpg' },
  // Styled by Mya
  { id: '401', store_slug: 'styled-by-mya', name: 'Birthday Drip Bundle', price: 300, image_url: '/demo/bundle1.jpg' },
  { id: '402', store_slug: 'styled-by-mya', name: 'Prom Night Flex', price: 425, image_url: '/demo/bundle2.jpg' },
]

const Storefront: React.FC = () => {
  const router = useRouter()
  const { store_id } = router.query as { store_id?: string }
  const { addItem, hasItem } = useCart()

  if (!store_id) {
    return <p style={{ padding: 20 }}>Loading storefront…</p>
  }

  const store = demoStores.find((s) => s.slug === store_id)

  if (!store) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Store Not Found</h1>
        <p>The store you are looking for does not exist.</p>
        <p style={{ marginTop: 20 }}>
          <a href="/stores">← Back to all stores</a>
        </p>
      </div>
    )
  }

  const products = demoProducts.filter((p) => p.store_slug === store_id)

  return (
    <div style={{ padding: 20 }}>
      <h1>{store.name}</h1>
      {store.description && <p>{store.description}</p>}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
        {products.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <img
              src={item.image_url || '/placeholder.png'}
              alt={item.name}
              style={{ width: '100%', borderRadius: 6, marginBottom: 8 }}
            />
            <h3>{item.name}</h3>
            <p><strong>${item.price.toFixed(2)}</strong></p>
            <button
              onClick={() =>
                addItem({ id: item.id, name: item.name, price: item.price, image: item.image_url, quantity: 1 })
              }
              disabled={hasItem && hasItem(item.id)}
              style={{
                marginTop: 8,
                padding: '8px 12px',
                background: hasItem && hasItem(item.id) ? '#aaa' : '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: hasItem && hasItem(item.id) ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              {hasItem && hasItem(item.id) ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 20 }}>
        <a href="/stores">← Back to all stores</a>
      </p>
    </div>
  )
}

export default Storefront
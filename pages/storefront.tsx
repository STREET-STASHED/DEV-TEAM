

import { useEffect, useState } from 'react'

const Storefront = () => {
  const [storeName, setStoreName] = useState('Pooch Fit')
  const [products, setProducts] = useState([
    {
      id: 'PROD-001',
      name: 'StreetStashed Hoodie',
      type: 'product',
      price: '$70',
      image: '/images/mock-hoodie.jpg',
    },
    {
      id: 'BUNDLE-001',
      name: 'Weekend Fit Bundle',
      type: 'bundle',
      price: '$150',
      image: '/images/mock-bundle.jpg',
    },
    {
      id: 'PROD-002',
      name: 'Culture Kicks',
      type: 'product',
      price: '$110',
      image: '/images/mock-sneakers.jpg',
    },
  ])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{storeName} — Storefront</h1>

      <div style={{ marginTop: '2rem' }}>
        <h2>All Items</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {products.map((item) => (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '6px' }} />
              <h3>{item.name}</h3>
              <p>Type: {item.type === 'bundle' ? 'Bundle' : 'Product'}</p>
              <p>Price: {item.price}</p>
              <button>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Storefront

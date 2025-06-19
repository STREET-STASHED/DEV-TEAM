import { useEffect, useState } from 'react';
import { mockProducts } from '../lib/mockProducts';

const DemoStore = () => {
  const [storeName] = useState('Pooch Fit');
  const [products] = useState(mockProducts);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{
        background: '#111',
        color: '#fff',
        padding: '1rem 2rem',
        borderRadius: '6px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0 }}>StreetStashed Demo Storefront</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#bbb' }}>This is a sample store. All items shown are mock data.</p>
      </div>

      <h2 style={{ fontSize: '1.5rem' }}>{storeName} — Storefront</h2>

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
        }}>
          {products.map((item: typeof mockProducts[number]) => (
            <div key={item.id} style={{
              border: '1px solid #e0e0e0',
              padding: '1rem',
              borderRadius: '8px',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
              <img src={item.image} alt={item.name} style={{
                width: '100%',
                borderRadius: '6px',
                objectFit: 'cover',
                marginBottom: '0.75rem'
              }} />
              <h3 style={{ margin: '0.5rem 0' }}>{item.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Type: {item.type === 'bundle' ? 'Bundle' : 'Product'}</p>
              <p style={{ fontWeight: 'bold' }}>Price: {item.price}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>Add to Cart</button>
                <button style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#f2f2f2',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoStore;

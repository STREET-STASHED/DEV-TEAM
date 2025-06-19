// pages/stores/[store_id]/index.tsx
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../../lib/supabaseClient'
import { useCart } from '../../../context/CartContext'

interface ProductRecord {
  id: string
  name: string
  price: number
  image_url: string
}

const Storefront: React.FC = () => {
  const router = useRouter()
  const { store_id } = router.query as { store_id?: string }
  const [store, setStore] = useState<{ name: string; description?: string } | null>(null)
  const [products, setProducts] = useState<ProductRecord[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    if (!store_id) return
    ;(async () => {
      // Fetch store info
      const { data: s, error: se } = await supabase
        .from('storefronts')
        .select('id, name, description')
        .eq('slug', store_id)
        .single()
      if (se || !s) setStore({ name: 'Demo Boutique', description: 'Sample storefront.' })
      else setStore({ name: s.name, description: s.description ?? undefined })

      // Fetch products
      const { data: items } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .eq('store_id', s?.id!)
      setProducts((items as ProductRecord[]) || [])
    })()
  }, [store_id])

  if (!store) return <p style={{ padding: 20 }}>Loading storefront…</p>

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
                addItem({ id: item.id, name: item.name, price: item.price, image: item.image_url })
              }
              style={{
                marginTop: 8,
                padding: '8px 12px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Add to Cart
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
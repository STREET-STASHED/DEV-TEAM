

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'

const Storefront = () => {
  const router = useRouter()
  const { store_id } = router.query

  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (!router.isReady || !store_id) return

    const fetchStore = async () => {
      try {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', store_id)
          .single()

        if (storeData) {
          const { data: productData } = await supabase
            .from('products')
            .select('*')
            .eq('store_id', storeData.id)

          setStore(storeData)
          setProducts(productData || [])
        } else {
          // mock store directory
          const mockStores: Record<string, any> = {
            'demo': {
              name: 'Demo Boutique',
              description: 'This is a demo storefront showcasing sample products.',
              products: [
                {
                  id: 'mock-1',
                  name: 'Drip Tee',
                  type: 'product',
                  price: 45,
                  image_url: '/mock1.jpg'
                },
                {
                  id: 'mock-2',
                  name: 'Summer Fit Bundle',
                  type: 'bundle',
                  price: 120,
                  image_url: '/mock2.jpg'
                }
              ]
            },
            'pooch-fit': {
              name: 'Pooch Fit',
              description: 'Streetwear with bite. Premium gear curated for the culture.',
              products: [
                {
                  id: 'mock-3',
                  name: 'BiteBack Hoodie',
                  type: 'product',
                  price: 85,
                  image_url: '/mock3.jpg'
                },
                {
                  id: 'mock-4',
                  name: 'Bridge Bundle',
                  type: 'bundle',
                  price: 210,
                  image_url: '/mock4.jpg'
                }
              ]
            }
          }

          const mockStore = mockStores[store_id as string]

          if (mockStore) {
            setStore({
              name: mockStore.name,
              description: mockStore.description
            })
            setProducts(mockStore.products)
          } else {
            setStore({
              name: 'Unknown Store',
              description: 'This store does not exist. Showing empty product list.'
            })
            setProducts([])
          }
        }
      } catch (error) {
        console.error('Error fetching store:', error)
        setStore({
          name: 'Demo Boutique (Error)',
          description: 'Unable to fetch real store data. Showing mock items instead.'
        })
        setProducts([
          {
            id: 'mock-1',
            name: 'Backup Tee',
            type: 'product',
            price: 35,
            image_url: '/mock1.jpg'
          },
          {
            id: 'mock-2',
            name: 'Essentials Bundle',
            type: 'bundle',
            price: 99,
            image_url: '/mock2.jpg'
          }
        ])
      }
    }

    fetchStore()
  }, [router, store_id])

  if (!store) return <p style={{ padding: '2rem' }}>Loading store...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{store.name} — Storefront</h1>
      <p>{store.description}</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Items</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {products.map((item) => (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
              <img src={item.image_url || '/placeholder.png'} alt={item.name} style={{ width: '100%', borderRadius: '6px' }} />
              <h3>{item.name}</h3>
              <p>Type: {item.type === 'bundle' ? 'Bundle' : 'Product'}</p>
              <p>Price: ${item.price}</p>
              <button>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Storefront


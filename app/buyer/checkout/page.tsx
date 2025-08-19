'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCart } from '@/context/CartContext'
import { CheckoutSummary } from '@/components/orders/CheckoutSummary'
import { AddressForm } from '@/components/forms/AddressForm'
import { useRouter } from 'next/navigation'

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  
  const [pickupAddress] = useState<Address>({
    street: '123 Main St',
    city: 'Pittsburgh',
    state: 'PA',
    zipCode: '15201'
  })
  
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  })
  
  const [distanceMiles, setDistanceMiles] = useState(0)
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)

  const calculateDistance = useCallback(async () => {
    if (!deliveryAddress.street || !deliveryAddress.city) return
    
    setIsCalculatingDistance(true)
    try {
      const pickup = `${pickupAddress.street}, ${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.zipCode}`
      const delivery = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}`
      
      const response = await fetch('/api/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, delivery })
      })
      
      if (response.ok) {
        const data = await response.json()
        setDistanceMiles(data.distanceMiles)
      }
    } catch (error) {
      console.error('Failed to calculate distance:', error)
    } finally {
      setIsCalculatingDistance(false)
    }
  }, [pickupAddress, deliveryAddress])

  useEffect(() => {
    calculateDistance()
  }, [calculateDistance])

  const handleSummaryChange = (summary: {
    subtotal: number
    stashedSupportFee: number
    total: number
    distanceMiles: number
    etaMinutes: number
    driverPay: number
    platformMargin: number
  }) => {
    // Handle summary changes if needed
    console.log('Summary updated:', summary)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (!deliveryAddress.street || !deliveryAddress.city) {
      alert('Please enter a delivery address')
      return
    }

    try {
      const orderData = {
        items,
        pickupAddress,
        deliveryAddress,
        distanceMiles,
        totalPrice
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const { orderId } = await response.json()
        clearCart()
        router.push(`/buyer/checkout/success?orderId=${orderId}`)
      } else {
        alert('Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      alert('Failed to create order')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-ink-300 mb-6">Add some items to your cart before checking out</p>
          <button
            onClick={() => router.push('/buyer/marketplace')}
            className="bg-brand-600 text-ink-black px-6 py-2 rounded-lg hover:bg-brand-500 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Delivery Address</h2>
              <AddressForm
                address={deliveryAddress}
                onChange={setDeliveryAddress}
                title="Where should we deliver your order?"
              />
            </div>
          </div>
          
          <div>
            <CheckoutSummary
              items={items}
              distanceMiles={distanceMiles}
              onSummaryChange={handleSummaryChange}
            />
            
            <button
              type="submit"
              disabled={isCalculatingDistance || !deliveryAddress.street}
              className="w-full mt-6 bg-brand-600 text-ink-black py-3 px-4 rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-card hover:shadow-hover transform hover:scale-105"
            >
              {isCalculatingDistance ? 'Calculating...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCart } from '@/context/CartContext'
import { CheckoutSummary } from '@/components/orders/CheckoutSummary'
import { AddressForm } from '@/components/forms/AddressForm'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [stripeAmount, setStripeAmount] = useState(0)

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
    setStripeAmount(summary.total)
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

    setIsProcessingOrder(true)

    try {
      // First create the order
      const orderData = {
        items,
        pickupAddress,
        deliveryAddress,
        distanceMiles,
        totalPrice
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const { orderId: newOrderId } = await orderResponse.json()
      setOrderId(newOrderId)

      // If cash payment, redirect to success
      if (paymentMethod === 'cash') {
        clearCart()
        router.push(`/buyer/checkout/success?orderId=${newOrderId}`)
        return
      }

      // For Stripe payment, create payment intent
      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: stripeAmount, 
          orderId: newOrderId 
        })
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await paymentResponse.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // This would normally come from Stripe Elements
            // For demo purposes, we'll use a test card
          },
          billing_details: {
            name: 'Test User',
          },
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      // Payment successful
      clearCart()
      router.push(`/buyer/checkout/success?orderId=${newOrderId}`)

    } catch (error) {
      console.error('Order creation error:', error)
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessingOrder(false)
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

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                      className="mr-2"
                    />
                    <span className="text-white">Credit/Debit Card (Stripe)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                      className="mr-2"
                    />
                    <span className="text-white">Cash on Delivery</span>
                  </label>
                </div>

                {paymentMethod === 'stripe' && (
                  <div className="p-4 bg-ink-800 rounded-lg">
                    <p className="text-ink-300 text-sm">
                      Secure payment powered by Stripe. Your card information is encrypted and secure.
                    </p>
                    <div className="mt-3 p-3 bg-ink-700 rounded text-xs text-ink-400">
                      <strong>Test Mode:</strong> Use test card 4242 4242 4242 4242, any future expiry, any 3-digit CVV
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="p-4 bg-ink-800 rounded-lg">
                    <p className="text-ink-300 text-sm">
                      Pay with cash when your order is delivered. Driver will collect payment and provide receipt.
                    </p>
                  </div>
                )}
              </div>
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
              disabled={isCalculatingDistance || !deliveryAddress.street || isProcessingOrder}
              className="w-full mt-6 bg-brand-600 text-ink-black py-3 px-4 rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-card hover:shadow-hover transform hover:scale-105"
            >
              {isProcessingOrder ? 'Processing Order...' : isCalculatingDistance ? 'Calculating...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

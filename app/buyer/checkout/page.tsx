'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCart } from '@/context/CartContext'
import { CheckoutSummary } from '@/components/orders/CheckoutSummary'
import { AddressForm } from '@/components/forms/AddressForm'
import { GuestCheckoutForm } from '@/components/checkout/GuestCheckoutForm'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from '@/context/AuthContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
}

interface GuestUser {
  email: string
  fullName: string
  phone?: string
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { isAuthenticated, user: _user } = useAuth()
  const router = useRouter()
  
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'authenticated'>('authenticated')
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
  const [_isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe')
  const [_orderId, setOrderId] = useState<string | null>(null)
  const [stripeAmount, setStripeAmount] = useState(0)

  // Auto-switch to guest mode if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setCheckoutMode('guest')
    }
  }, [isAuthenticated])

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

  const handleGuestCheckout = async (guestData: GuestUser, address: Address) => {
    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }

    setIsProcessingOrder(true)
    setDeliveryAddress(address)

    try {
      // Create guest order
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customer: {
          email: guestData.email,
          fullName: guestData.fullName,
          phone: guestData.phone
        },
        shippingAddress: address,
        pickupAddress,
        totalAmount: totalPrice,
        isGuest: true
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const order = await response.json()
        setOrderId(order.id)
        
        // Redirect to payment
        if (paymentMethod === 'stripe') {
          // Handle Stripe payment for guest
          const stripe = await stripePromise
          if (stripe) {
            // Create payment intent and redirect to Stripe
            const { error } = await stripe.redirectToCheckout({
              lineItems: items.map(item => ({
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: item.name,
                    images: item.image_url ? [item.image_url] : []
                  },
                  unit_amount: Math.round(item.price * 100)
                },
                quantity: item.quantity
              })),
              mode: 'payment',
              successUrl: `${window.location.origin}/buyer/checkout/success?orderId=${order.id}`,
              cancelUrl: `${window.location.origin}/buyer/checkout`
            })
            
            if (error) {
              console.error('Stripe error:', error)
              alert('Payment failed. Please try again.')
            }
          }
        } else {
          // Cash payment - redirect to success
          clearCart()
          router.push(`/buyer/checkout/success?orderId=${order.id}`)
        }
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Guest checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setIsProcessingOrder(false)
    }
  }

  const handleAuthenticatedCheckout = async (e: React.FormEvent) => {
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
            token: 'tok_visa' // Demo token for testing
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

  const handleSwitchToSignup = () => {
    router.push('/signup?redirectedFrom=/buyer/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ink-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-ink-300 mb-8">Add some items to your cart to continue shopping.</p>
            <button
              onClick={() => router.push('/buyer/marketplace')}
              className="bg-brand-600 text-ink-black px-6 py-3 rounded-lg font-medium hover:bg-brand-500 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
          
          {/* Checkout Mode Selection */}
          {!isAuthenticated && (
            <div className="mb-8">
              <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                <h2 className="text-xl font-semibold mb-4">Choose Your Checkout Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCheckoutMode('guest')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      checkoutMode === 'guest'
                        ? 'border-brand-400 bg-brand-500/10'
                        : 'border-ink-600 bg-ink-800 hover:border-ink-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚀</div>
                      <h3 className="font-medium mb-2">Guest Checkout</h3>
                      <p className="text-sm text-ink-300">Quick purchase without account</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setCheckoutMode('authenticated')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      checkoutMode === 'authenticated'
                        ? 'border-brand-400 bg-brand-500/10'
                        : 'border-ink-600 bg-ink-800 hover:border-ink-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👤</div>
                      <h3 className="font-medium mb-2">Create Account</h3>
                      <p className="text-sm text-ink-300">Save 10% + track orders</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Checkout Form */}
            <div>
              {checkoutMode === 'guest' ? (
                <GuestCheckoutForm
                  onGuestCheckout={handleGuestCheckout}
                  onSwitchToSignup={handleSwitchToSignup}
                  loading={isProcessingOrder}
                />
              ) : (
                <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Shipping Information</h3>
                  <AddressForm
                    _address={deliveryAddress}
                    onChange={setDeliveryAddress}
                    title="Delivery Address"
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          value="stripe"
                          checked={paymentMethod === 'stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'cash')}
                          className="text-brand-600 focus:ring-brand-400"
                        />
                        <span>Credit/Debit Card (Stripe)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'cash')}
                          className="text-brand-600 focus:ring-brand-400"
                        />
                        <span>Cash on Delivery</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleAuthenticatedCheckout}
                    disabled={isProcessingOrder}
                    className="w-full mt-6 bg-brand-600 text-ink-black py-3 px-4 rounded-lg font-medium hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isProcessingOrder ? 'Processing...' : 'Complete Order'}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <CheckoutSummary
                items={items}
                distanceMiles={distanceMiles}
                onSummaryChange={handleSummaryChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

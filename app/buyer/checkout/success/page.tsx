'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  estimatedDelivery: string
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      // In a real app, you would fetch the order details from your API
      // For now, we'll simulate the order data
      setTimeout(() => {
        setOrder({
          id: orderId,
          status: 'confirmed',
          items: [
            { name: 'Vintage Denim Jacket', quantity: 1, price: 89.99 },
            { name: 'Street Style Hoodie', quantity: 2, price: 45.00 }
          ],
          total: 179.99,
          deliveryAddress: {
            street: '123 Main St',
            city: 'Pittsburgh',
            state: 'PA',
            zipCode: '15201'
          },
          estimatedDelivery: '2-4 hours'
        })
        setLoading(false)
      }, 1000)
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-400 mx-auto mb-4"></div>
          <p className="text-ink-300">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
          <p className="text-ink-300 mb-6">We couldn&apos;t find your order details.</p>
          <Link
            href="/buyer/marketplace"
            className="bg-brand-600 text-black px-6 py-2 rounded-lg hover:bg-brand-500 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-ink-300">Your order has been successfully placed</p>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Order Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-ink-300">Order ID:</span>
              <span className="text-white font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-300">Status:</span>
              <span className="text-success-400 font-medium capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-300">Total:</span>
              <span className="text-white font-semibold">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Items Ordered</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-white">{item.name}</p>
                  <p className="text-ink-400 text-sm">Qty: {item.quantity}</p>
                </div>
                <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Delivery Information</h3>
          <div className="space-y-2">
            <p className="text-white">
              {order.deliveryAddress.street}<br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
            </p>
            <p className="text-ink-300 text-sm">
              Estimated delivery: {order.estimatedDelivery}
            </p>
          </div>
        </div>

        <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-brand-400 mb-2">What&apos;s Next?</h3>
          <ul className="text-ink-300 space-y-2 text-sm">
            <li>• We&apos;ll notify you when a driver accepts your order</li>
            <li>• Track your order in real-time through the app</li>
            <li>• Receive updates on pickup and delivery progress</li>
            <li>• Rate your experience after delivery</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/buyer/dashboard"
            className="flex-1 bg-brand-600 text-black py-3 px-4 rounded-lg hover:bg-brand-500 transition-colors text-center font-medium"
          >
            View Order Status
          </Link>
          <Link
            href="/buyer/marketplace"
            className="flex-1 bg-ink-700 text-white py-3 px-4 rounded-lg hover:bg-ink-600 transition-colors text-center font-medium border border-ink-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-400 mx-auto mb-4"></div>
          <p className="text-ink-300">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

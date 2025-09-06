'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import RealTimeOrderTracking from '@/components/orders/RealTimeOrderTracking'

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (params.orderId && typeof params.orderId === 'string') {
      setOrderId(params.orderId)
    }
  }, [isAuthenticated, params.orderId, router])

  if (!isAuthenticated) {
    return null
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Invalid Order ID</div>
          <button
            onClick={() => router.push('/buyer/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RealTimeOrderTracking 
        orderId={orderId}
        onStatusUpdate={(status) => {
          console.log('Order status updated:', status)
          // Handle status updates (notifications, etc.)
        }}
      />
    </div>
  )
}

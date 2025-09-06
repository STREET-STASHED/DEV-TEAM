'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import AdvancedSellerDashboard from '@/components/seller/AdvancedSellerDashboard'
import { useRouter } from 'next/navigation'

export default function AdvancedSellerDashboardPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'seller') {
      router.push('/unauthorized')
      return
    }

    setLoading(false)
  }, [isAuthenticated, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'seller') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdvancedSellerDashboard 
        sellerId={user.id}
        onProductClick={(productId) => {
          console.log('Product clicked:', productId)
          // Navigate to product edit page
        }}
        onAlertClick={(alertId) => {
          console.log('Alert clicked:', alertId)
          // Handle alert action
        }}
      />
    </div>
  )
}

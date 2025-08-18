import { Metadata } from 'next'
import { Suspense } from 'react'
import { SellerDashboardContent } from './SellerDashboardContent'
import { DashboardSkeleton } from './DashboardSkeleton'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your products and track your sales',
}

export default function SellerDashboardPage() {
  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-black mb-8">
        Seller Dashboard
      </h1>

      <Suspense fallback={<DashboardSkeleton />}>
        <SellerDashboardContent />
      </Suspense>
    </div>
  )
}

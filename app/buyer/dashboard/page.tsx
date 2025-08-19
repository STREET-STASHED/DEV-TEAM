import { Metadata } from 'next'
import { Suspense } from 'react'
import { BuyerDashboardContent } from './BuyerDashboardContent'
import { DashboardSkeleton } from './DashboardSkeleton'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Track your orders and manage your StreetStashed account',
}

export default function BuyerDashboardPage() {
  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-black">
        Welcome to the StreetStashed Buyer Hub
      </h1>

      <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-4 border-b pb-2">
        Track Your Most Recent Orders
      </h2>

      <Suspense fallback={<DashboardSkeleton />}>
        <BuyerDashboardContent />
      </Suspense>
    </div>
  )
}

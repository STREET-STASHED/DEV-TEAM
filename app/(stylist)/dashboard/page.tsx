import { Suspense } from 'react'
import StylistDashboardContent from './StylistDashboardContent'
import { DashboardSkeleton } from './DashboardSkeleton'

export default function StylistDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Stylist Dashboard</h1>
        <p className="mt-2 text-ink-400">
          Manage your styling services, appointments, and client relationships
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <StylistDashboardContent />
      </Suspense>
    </div>
  )
}

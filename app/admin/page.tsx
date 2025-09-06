import AdminDashboard from '@/components/AdminDashboard';
import BusinessIntelligenceDashboard from '@/components/analytics/BusinessIntelligenceDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-ink-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-ink-300 text-lg">Manage your StreetStashed platform</p>
        </div>

        {/* Business Intelligence Dashboard */}
        <div className="mb-8">
          <BusinessIntelligenceDashboard
            onExport={(type) => {
              console.log(`Exporting data as ${type}`)
              // In real implementation, this would trigger actual export
            }}
            onRefresh={() => {
              console.log('Refreshing dashboard data')
              // In real implementation, this would refresh from API
            }}
          />
        </div>

        {/* Original Admin Dashboard */}
        <AdminDashboard />
      </div>
    </div>
  );
}

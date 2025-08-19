import Link from 'next/link'

export async function StylistDashboardContent() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ink-400">Active Clients</p>
              <p className="text-2xl font-bold text-white">18</p>
            </div>
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7l8 0M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ink-400">This Month Appointments</p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ink-400">Monthly Earnings</p>
              <p className="text-2xl font-bold text-white">$3,245</p>
            </div>
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ink-400">Average Rating</p>
              <p className="text-2xl font-bold text-white">4.9</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/stylist/looks/create"
          className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4 hover:bg-ink-700/50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="ml-3 text-white font-medium">Create Look</span>
          </div>
        </Link>

        <Link
          href="/stylist/appointments/schedule"
          className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4 hover:bg-ink-700/50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 bg-brand-400/20 rounded-lg group-hover:bg-brand-400/30 transition-colors">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7l8 0M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
              </svg>
            </div>
            <span className="ml-3 text-white font-medium">Schedule Session</span>
          </div>
        </Link>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-ink-600 rounded-lg">
              <svg className="w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="ml-3 text-ink-400 font-medium">Analytics</span>
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-ink-600 rounded-lg">
              <svg className="w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="ml-3 text-ink-400 font-medium">Profile Settings</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Today&apos;s Schedule</h2>
          <Link
            href="/stylist/appointments"
            className="text-brand-400 hover:text-brand-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {/* Mock Appointments */}
        <div className="space-y-3">
          {[
            { time: '10:00 AM', client: 'Emma Rodriguez', service: 'Personal Shopping Session', duration: '2 hours', status: 'confirmed' },
            { time: '2:00 PM', client: 'Sarah Kim', service: 'Wardrobe Consultation', duration: '1.5 hours', status: 'confirmed' },
            { time: '4:30 PM', client: 'Michael Chen', service: 'Style Refresh', duration: '1 hour', status: 'pending' }
          ].map((appointment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-ink-700/30 rounded-lg border border-ink-600">
              <div className="flex items-center space-x-4">
                <div className="text-brand-400 font-mono text-sm">
                  {appointment.time}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{appointment.client}</h3>
                  <p className="text-ink-400 text-sm">{appointment.service} • {appointment.duration}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium px-2 py-1 rounded ${
                  appointment.status === 'confirmed' ? 'bg-success-400/20 text-success-400' :
                  'bg-warning-400/20 text-warning-400'
                }`}>
                  {appointment.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Looks */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Looks</h2>
          <Link
            href="/stylist/looks"
            className="text-brand-400 hover:text-brand-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {/* Mock Looks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Casual Friday Vibes', likes: 24, saves: 8, category: 'Business Casual' },
            { name: 'Date Night Elegance', likes: 42, saves: 15, category: 'Evening Wear' },
            { name: 'Weekend Warrior', likes: 18, saves: 6, category: 'Casual' }
          ].map((look, index) => (
            <div key={index} className="bg-ink-700/30 rounded-lg border border-ink-600 p-4">
              <div className="aspect-square bg-ink-600 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm mb-1">{look.name}</h3>
              <p className="text-ink-400 text-xs mb-2">{look.category}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-400">{look.likes} likes</span>
                <span className="text-ink-400">{look.saves} saves</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Client Feedback</h3>
          <div className="space-y-3">
            {[
              { client: 'Emma R.', rating: 5, comment: 'Amazing session! Love my new style direction.' },
              { client: 'Sarah K.', rating: 5, comment: 'So helpful and professional. Highly recommend!' },
              { client: 'Michael C.', rating: 4, comment: 'Great advice on updating my wardrobe.' }
            ].map((feedback, index) => (
              <div key={index} className="p-3 bg-ink-700/30 rounded border border-ink-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{feedback.client}</span>
                  <div className="flex text-brand-400">
                    {[...Array(feedback.rating)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-ink-300 text-xs">&quot;{feedback.comment}&quot;</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-ink-400">Completed Sessions</span>
              <span className="text-white font-medium">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-400">Client Retention Rate</span>
              <span className="text-white font-medium">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-400">Average Session Rating</span>
              <span className="text-white font-medium">4.9/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-400">Revenue Growth</span>
              <span className="text-success-400 font-medium">+12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

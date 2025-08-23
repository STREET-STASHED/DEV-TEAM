'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserGroupIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  StarIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface StylistStats {
  activeClients: number
  totalAppointments: number
  monthlyEarnings: number
  averageRating: number
  totalReviews: number
  completedSessions: number
  pendingSessions: number
  totalEarnings: number
}

interface Client {
  id: string
  name: string
  avatar: string
  lastSession: string
  nextSession: string
  totalSpent: number
  rating: number
  status: 'active' | 'inactive' | 'new'
}

interface Appointment {
  id: string
  clientName: string
  clientAvatar: string
  date: string
  time: string
  duration: number
  type: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  notes: string
}

interface Challenge {
  id: string
  title: string
  description: string
  participants: number
  deadline: string
  prizePool: number
  status: 'active' | 'completed' | 'upcoming'
  category: string
  isJoined: boolean
}

export default function StylistDashboardContent() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [stats, setStats] = useState<StylistStats | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMockStats = useCallback(() => {
    const mockStats: StylistStats = {
      activeClients: 24,
      totalAppointments: 156,
      monthlyEarnings: 2847.50,
      averageRating: 4.8,
      totalReviews: 89,
      completedSessions: 142,
      pendingSessions: 14,
      totalEarnings: 15420.75
    }
    setStats(mockStats)
  }, [])

  const loadMockClients = useCallback(() => {
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '/mock/avatar1.jpg',
        lastSession: '2024-01-15',
        nextSession: '2024-01-22',
        totalSpent: 450.00,
        rating: 5,
        status: 'active'
      },
      {
        id: '2',
        name: 'Michael Chen',
        avatar: '/mock/avatar2.jpg',
        lastSession: '2024-01-14',
        nextSession: '2024-01-21',
        totalSpent: 320.00,
        rating: 4,
        status: 'active'
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        avatar: '/mock/avatar3.jpg',
        lastSession: '2024-01-13',
        nextSession: '2024-01-20',
        totalSpent: 680.00,
        rating: 5,
        status: 'active'
      },
      {
        id: '4',
        name: 'David Kim',
        avatar: '/mock/avatar4.jpg',
        lastSession: '2024-01-12',
        nextSession: '2024-01-19',
        totalSpent: 240.00,
        rating: 4,
        status: 'new'
      },
      {
        id: '5',
        name: 'Lisa Thompson',
        avatar: '/mock/avatar5.jpg',
        lastSession: '2024-01-10',
        nextSession: '2024-01-17',
        totalSpent: 890.00,
        rating: 5,
        status: 'active'
      }
    ]
    setClients(mockClients)
  }, [])

  const loadMockAppointments = useCallback(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        clientName: 'Sarah Johnson',
        clientAvatar: '/mock/avatar1.jpg',
        date: '2024-01-22',
        time: '10:00 AM',
        duration: 60,
        type: 'Style Consultation',
        status: 'confirmed',
        notes: 'Focus on professional wardrobe update'
      },
      {
        id: '2',
        clientName: 'Michael Chen',
        clientAvatar: '/mock/avatar2.jpg',
        date: '2024-01-21',
        time: '2:00 PM',
        duration: 90,
        type: 'Full Wardrobe Review',
        status: 'confirmed',
        notes: 'Preparing for job interview'
      },
      {
        id: '3',
        clientName: 'Emma Rodriguez',
        clientAvatar: '/mock/avatar3.jpg',
        date: '2024-01-20',
        time: '11:00 AM',
        duration: 60,
        type: 'Style Consultation',
        status: 'pending',
        notes: 'New client - first session'
      },
      {
        id: '4',
        clientName: 'David Kim',
        clientAvatar: '/mock/avatar4.jpg',
        date: '2024-01-19',
        time: '3:00 PM',
        duration: 60,
        type: 'Style Consultation',
        status: 'pending',
        notes: 'First-time client'
      },
      {
        id: '5',
        clientName: 'Lisa Thompson',
        clientAvatar: '/mock/avatar5.jpg',
        date: '2024-01-17',
        time: '1:00 PM',
        duration: 90,
        type: 'Full Wardrobe Review',
        status: 'confirmed',
        notes: 'Seasonal wardrobe update'
      }
    ]
    setAppointments(mockAppointments)
  }, [])

  const loadMockChallenges = useCallback(() => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Style Transformation Challenge',
        description: 'Transform 5 clients with complete style makeovers',
        participants: 47,
        deadline: '2024-02-15',
        prizePool: 2500,
        status: 'active',
        category: 'Transformation',
        isJoined: true
      },
      {
        id: '2',
        title: 'Client Satisfaction Master',
        description: 'Achieve 100% client satisfaction for 30 days',
        participants: 23,
        deadline: '2024-01-31',
        prizePool: 1500,
        status: 'active',
        category: 'Quality',
        isJoined: false
      },
      {
        id: '3',
        title: 'Social Media Influencer',
        description: 'Grow social media following by 1000+ followers',
        participants: 89,
        deadline: '2024-03-01',
        prizePool: 3000,
        status: 'upcoming',
        category: 'Marketing',
        isJoined: false
      }
    ]
    setChallenges(mockChallenges)
  }, [])

  const loadStats = useCallback(async () => {
    try {
      // Try to load from real API first
      const response = await fetch('/api/stylist/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || null)
      } else {
        throw new Error('Failed to load stats')
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      // Fallback to mock data
      loadMockStats()
    }
  }, [loadMockStats])

  const loadClients = useCallback(async () => {
    try {
      // Try to load from real API first
      const response = await fetch('/api/stylist/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      } else {
        throw new Error('Failed to load clients')
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      // Fallback to mock data
      loadMockClients()
    }
  }, [loadMockClients])

  const loadAppointments = useCallback(async () => {
    try {
      // Try to load from real API first
      const response = await fetch('/api/stylist/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else {
        throw new Error('Failed to load appointments')
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      // Fallback to mock data
      loadMockAppointments()
    }
  }, [loadMockAppointments])

  const loadChallenges = useCallback(async () => {
    try {
      // Try to load from real API first
      const response = await fetch('/api/stylist/challenges')
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges || [])
      } else {
        throw new Error('Failed to load challenges')
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
      // Fallback to mock data
      loadMockChallenges()
    }
  }, [loadMockChallenges])

  const loadMockData = useCallback(() => {
    loadMockStats()
    loadMockClients()
    loadMockAppointments()
    loadMockChallenges()
  }, [loadMockStats, loadMockClients, loadMockAppointments, loadMockChallenges])

  const loadStylistData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Load all data in parallel
      await Promise.all([
        loadStats(),
        loadClients(),
        loadAppointments(),
        loadChallenges()
      ])
    } catch (error) {
      console.error('Error loading stylist data:', error)
      setError('Failed to load some data. Showing demo content.')
      // Fallback to mock data for demo purposes
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }, [loadStats, loadClients, loadAppointments, loadChallenges, loadMockData])

  useEffect(() => {
    loadStylistData()
  }, [loadStylistData])

  const handleClientClick = (clientId: string) => {
    router.push(`/stylist/clients/${clientId}`)
  }

  const handleAppointmentClick = (appointmentId: string) => {
    router.push(`/stylist/appointments/${appointmentId}`)
  }

  const handleChallengeJoin = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId ? { ...challenge, isJoined: true } : challenge
    ))
    alert('Challenge joined successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-ink-500/20 text-ink-400'
    }
  }

  const getClientStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'new': return 'bg-blue-500/20 text-blue-400'
      case 'inactive': return 'bg-ink-500/20 text-ink-400'
      default: return 'bg-ink-500/20 text-ink-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-300">Loading stylist dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Stylist Dashboard</h1>
              <p className="text-ink-300">Manage your clients, appointments, and grow your business</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="bg-ink-800 border-b border-ink-700 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Clients */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-purple-400">{stats.activeClients}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Active Clients</h3>
                <p className="text-ink-400 text-sm">Currently managed</p>
              </div>

              {/* Total Appointments */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{stats.totalAppointments}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Total Appointments</h3>
                <p className="text-ink-400 text-sm">All time</p>
              </div>

              {/* Monthly Earnings */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-green-400">${stats.monthlyEarnings.toLocaleString()}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Monthly Earnings</h3>
                <p className="text-ink-400 text-sm">This month</p>
              </div>

              {/* Average Rating */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">{stats.averageRating}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Average Rating</h3>
                <p className="text-ink-400 text-sm">From {stats.totalReviews} reviews</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'clients', name: 'Clients', icon: UserGroupIcon },
              { id: 'appointments', name: 'Appointments', icon: CalendarIcon },
              { id: 'challenges', name: 'Challenges', icon: FireIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-ink-300">New client Sarah Johnson booked consultation</span>
                    <span className="text-ink-400 text-sm">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-ink-300">Completed styling session with Michael Chen</span>
                    <span className="text-ink-400 text-sm">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-ink-300">Received 5-star review from Emma Rodriguez</span>
                    <span className="text-ink-400 text-sm">2 days ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-ink-300">Joined Style Transformation Challenge</span>
                    <span className="text-ink-400 text-sm">3 days ago</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors">
                    Schedule New Appointment
                  </button>
                  <button className="w-full bg-ink-800 hover:bg-ink-700 text-white py-3 rounded-lg font-semibold transition-colors">
                    Add New Client
                  </button>
                  <button className="w-full bg-ink-800 hover:bg-ink-700 text-white py-3 rounded-lg font-semibold transition-colors">
                    View Analytics
                  </button>
                  <button className="w-full bg-ink-800 hover:bg-ink-700 text-white py-3 rounded-lg font-semibold transition-colors">
                    Manage Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-xl font-bold text-white mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats?.completedSessions || 0}</div>
                  <div className="text-ink-300">Completed Sessions</div>
                  <div className="text-ink-400 text-sm">This month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stats?.pendingSessions || 0}</div>
                  <div className="text-ink-300">Pending Sessions</div>
                  <div className="text-ink-400 text-sm">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">${stats?.totalEarnings.toLocaleString() || 0}</div>
                  <div className="text-ink-300">Total Earnings</div>
                  <div className="text-ink-400 text-sm">All time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Client Management</h2>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                + Add Client
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleClientClick(client.id)}
                  className="bg-ink-900 rounded-xl p-6 border border-ink-800 cursor-pointer hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/mock/default-avatar.jpg'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{client.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClientStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Last Session:</span>
                      <span className="text-ink-300">{client.lastSession}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Next Session:</span>
                      <span className="text-ink-300">{client.nextSession}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Total Spent:</span>
                      <span className="text-green-400 font-semibold">${client.totalSpent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-ink-300">{client.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Appointment Schedule</h2>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                + New Appointment
              </button>
            </div>
            
            <div className="bg-ink-900 rounded-xl border border-ink-800 overflow-hidden">
              <div className="p-6 border-b border-ink-800">
                <h3 className="text-lg font-semibold text-white mb-2">Upcoming Sessions</h3>
                <p className="text-ink-300 text-sm">Manage your client appointments</p>
              </div>
              
              <div className="divide-y divide-ink-800">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => handleAppointmentClick(appointment.id)}
                    className="p-6 hover:bg-ink-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={appointment.clientAvatar}
                          alt={appointment.clientName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/mock/default-avatar.jpg'
                          }}
                        />
                        <div>
                          <h4 className="font-semibold text-white">{appointment.clientName}</h4>
                          <p className="text-ink-400 text-sm">{appointment.type}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <CalendarIcon className="w-4 h-4 text-ink-400" />
                          <span className="text-ink-300">{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <ClockIcon className="w-4 h-4 text-ink-400" />
                          <span className="text-ink-300">{appointment.time} ({appointment.duration}min)</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-ink-800 rounded-lg">
                        <p className="text-ink-300 text-sm">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'challenges' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Styling Challenges</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-ink-900 rounded-xl border border-ink-800 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        challenge.status === 'active' ? 'bg-green-500 text-white' :
                        challenge.status === 'completed' ? 'bg-blue-500 text-white' :
                        'bg-ink-700 text-ink-300'
                      }`}>
                        {challenge.status === 'upcoming' ? 'Coming Soon' : challenge.status}
                      </span>
                    </div>
                    
                    <p className="text-ink-300 text-sm mb-4">{challenge.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-400">Participants:</span>
                        <span className="text-white font-semibold">{challenge.participants}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-400">Deadline:</span>
                        <span className="text-ink-300">{challenge.deadline}</span>
                      </div>
                      {challenge.prizePool > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-400">Prize Pool:</span>
                          <span className="text-green-400 font-semibold">${challenge.prizePool.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-medium">{challenge.category}</span>
                      
                      {challenge.status === 'active' && !challenge.isJoined && (
                        <button
                          onClick={() => handleChallengeJoin(challenge.id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Join Challenge
                        </button>
                      )}
                      
                      {challenge.isJoined && (
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                          Joined ✓
                        </button>
                      )}
                      
                      {challenge.status === 'upcoming' && (
                        <button className="bg-ink-700 text-ink-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

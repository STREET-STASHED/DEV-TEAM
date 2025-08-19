'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  service: string
  date: string
  time: string
  duration: number // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  price: number
  notes?: string
  createdAt: string
}

export default function StylistAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      clientName: 'Emma Rodriguez',
      clientEmail: 'emma.rodriguez@email.com',
      service: 'Personal Shopping Session',
      date: '2024-01-25',
      time: '10:00 AM',
      duration: 120,
      status: 'confirmed',
      price: 150.00,
      notes: 'Looking for work wardrobe refresh',
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      clientName: 'Sarah Kim',
      clientEmail: 'sarah.kim@email.com',
      service: 'Wardrobe Consultation',
      date: '2024-01-25',
      time: '2:00 PM',
      duration: 90,
      status: 'confirmed',
      price: 120.00,
      notes: 'Spring cleaning and organization',
      createdAt: '2024-01-19'
    },
    {
      id: '3',
      clientName: 'Michael Chen',
      clientEmail: 'michael.chen@email.com',
      service: 'Style Refresh',
      date: '2024-01-25',
      time: '4:30 PM',
      duration: 60,
      status: 'pending',
      price: 85.00,
      notes: 'Career transition styling',
      createdAt: '2024-01-21'
    },
    {
      id: '4',
      clientName: 'Jessica Martinez',
      clientEmail: 'jessica.martinez@email.com',
      service: 'Special Event Styling',
      date: '2024-01-20',
      time: '11:00 AM',
      duration: 120,
      status: 'completed',
      price: 200.00,
      notes: 'Wedding guest outfit',
      createdAt: '2024-01-15'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success-400/20 text-success-400'
      case 'pending': return 'bg-warning-400/20 text-warning-400'
      case 'completed': return 'bg-brand-400/20 text-brand-400'
      case 'cancelled': return 'bg-error-400/20 text-error-400'
      default: return 'bg-ink-600 text-ink-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓'
      case 'pending': return '⏳'
      case 'completed': return '✓'
      case 'cancelled': return '✕'
      default: return '•'
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (activeTab === 'upcoming') {
      return appointmentDate >= today && appointment.status !== 'cancelled'
    } else if (activeTab === 'past') {
      return appointmentDate < today || appointment.status === 'completed'
    }
    return true
  })

  const upcomingAppointments = appointments.filter(a => {
    const date = new Date(a.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today && a.status !== 'cancelled'
  })

  const totalEarnings = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Appointments</h1>
          <p className="mt-2 text-ink-400">
            Manage your styling sessions and client appointments
          </p>
        </div>
        <Link
          href="/stylist/appointments/schedule"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-ink-black font-medium rounded-lg transition-colors"
        >
          Schedule Session
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-white">{upcomingAppointments.length}</div>
          <div className="text-ink-400 text-sm">Upcoming Sessions</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-success-400">
            {appointments.filter(a => a.status === 'confirmed').length}
          </div>
          <div className="text-ink-400 text-sm">Confirmed</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">
            {appointments.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-ink-400 text-sm">Completed</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">${totalEarnings}</div>
          <div className="text-ink-400 text-sm">Total Earnings</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-ink-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-brand-600 text-ink-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-brand-600 text-ink-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Past ({appointments.filter(a => {
            const date = new Date(a.date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return date < today || a.status === 'completed'
          }).length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-600 text-ink-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          All ({appointments.length})
        </button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7l8 0M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No appointments found</h3>
          <p className="text-ink-400 mb-4">
            {activeTab === 'upcoming' 
              ? 'No upcoming appointments scheduled'
              : activeTab === 'past'
              ? 'No past appointments yet'
              : 'No appointments found'
            }
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/stylist/appointments/schedule"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-ink-black font-medium rounded-lg transition-colors"
            >
              Schedule Your First Session
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{appointment.clientName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)} {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-ink-400 text-sm">Service</div>
                      <div className="text-white font-medium">{appointment.service}</div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-sm">Date & Time</div>
                      <div className="text-white font-medium">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-sm">Duration</div>
                      <div className="text-white font-medium">{appointment.duration} minutes</div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-sm">Price</div>
                      <div className="text-brand-400 font-medium">${appointment.price}</div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mb-4">
                      <div className="text-ink-400 text-sm mb-1">Notes</div>
                      <div className="text-ink-300 text-sm bg-ink-700/30 rounded p-3">
                        {appointment.notes}
                      </div>
                    </div>
                  )}

                  <div className="text-ink-500 text-xs">
                    Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-white text-sm rounded transition-colors">
                    View Details
                  </button>
                  {appointment.status === 'pending' && (
                    <button className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white text-sm rounded transition-colors">
                      Confirm
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-ink-black text-sm rounded transition-colors">
                      Start Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Schedule */}
      {activeTab === 'upcoming' && upcomingAppointments.length > 0 && (
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Schedule</h3>
          <div className="space-y-3">
            {upcomingAppointments
              .filter(a => new Date(a.date).toDateString() === new Date().toDateString())
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-ink-700/30 rounded border border-ink-600">
                  <div className="flex items-center space-x-4">
                    <div className="text-brand-400 font-mono text-sm">
                      {appointment.time}
                    </div>
                    <div>
                      <div className="text-white font-medium">{appointment.clientName}</div>
                      <div className="text-ink-400 text-sm">{appointment.service} • {appointment.duration}min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">${appointment.price}</div>
                    <div className={`text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

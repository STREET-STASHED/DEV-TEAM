'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  totalSessions: number
  totalSpent: number
  lastSession: string
  status: 'active' | 'inactive' | 'new'
  preferences: {
    style: string[]
    budget: 'low' | 'medium' | 'high'
    occasions: string[]
    notes: string
  }
  upcomingAppointments: number
  createdAt: string
}

export default function StylistClientsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'new'>('all')
  const [clients] = useState<Client[]>([
    {
      id: '1',
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      phone: '+1 (555) 123-4567',
      totalSessions: 8,
      totalSpent: 1200.00,
      lastSession: '2024-01-20',
      status: 'active',
      preferences: {
        style: ['Business Casual', 'Minimalist'],
        budget: 'medium',
        occasions: ['Work', 'Weekend'],
        notes: 'Prefers sustainable brands, loves neutral colors'
      },
      upcomingAppointments: 1,
      createdAt: '2023-08-15'
    },
    {
      id: '2',
      name: 'Sarah Kim',
      email: 'sarah.kim@email.com',
      phone: '+1 (555) 234-5678',
      totalSessions: 12,
      totalSpent: 1850.00,
      lastSession: '2024-01-18',
      status: 'active',
      preferences: {
        style: ['Trendy', 'Street Style'],
        budget: 'high',
        occasions: ['Social Events', 'Travel'],
        notes: 'Loves bold colors and statement pieces'
      },
      upcomingAppointments: 2,
      createdAt: '2023-06-22'
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 345-6789',
      totalSessions: 3,
      totalSpent: 450.00,
      lastSession: '2024-01-15',
      status: 'new',
      preferences: {
        style: ['Classic', 'Professional'],
        budget: 'medium',
        occasions: ['Work', 'Interviews'],
        notes: 'Career transition, needs professional wardrobe'
      },
      upcomingAppointments: 1,
      createdAt: '2024-01-10'
    },
    {
      id: '4',
      name: 'Jessica Martinez',
      email: 'jessica.martinez@email.com',
      phone: '+1 (555) 456-7890',
      totalSessions: 5,
      totalSpent: 800.00,
      lastSession: '2024-01-12',
      status: 'active',
      preferences: {
        style: ['Romantic', 'Feminine'],
        budget: 'medium',
        occasions: ['Date Nights', 'Special Events'],
        notes: 'Loves floral prints and soft fabrics'
      },
      upcomingAppointments: 0,
      createdAt: '2023-10-05'
    },
    {
      id: '5',
      name: 'David Thompson',
      email: 'david.thompson@email.com',
      phone: '+1 (555) 567-8901',
      totalSessions: 2,
      totalSpent: 300.00,
      lastSession: '2023-12-20',
      status: 'inactive',
      preferences: {
        style: ['Casual', 'Athletic'],
        budget: 'low',
        occasions: ['Weekend', 'Gym'],
        notes: 'Prefers comfortable, functional clothing'
      },
      upcomingAppointments: 0,
      createdAt: '2023-11-15'
    }
  ])

  const filteredClients = clients.filter(client => {
    if (activeTab === 'active') return client.status === 'active'
    if (activeTab === 'new') return client.status === 'new'
    return true
  })

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'active').length
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0)
  const averageSpent = totalRevenue / totalClients

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-400/20 text-success-400'
      case 'new': return 'bg-brand-400/20 text-brand-400'
      case 'inactive': return 'bg-ink-600 text-ink-300'
      default: return 'bg-ink-600 text-ink-300'
    }
  }

  const getBudgetColor = (budget: string) => {
    switch (budget) {
      case 'high': return 'text-success-400'
      case 'medium': return 'text-brand-400'
      case 'low': return 'text-ink-400'
      default: return 'text-ink-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Clients</h1>
          <p className="mt-2 text-ink-400">
            Manage your client relationships and track their preferences
          </p>
        </div>
        <Link
          href="/stylist/clients/add"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-black font-medium rounded-lg transition-colors"
        >
          Add Client
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-white">{totalClients}</div>
          <div className="text-ink-400 text-sm">Total Clients</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-success-400">{activeClients}</div>
          <div className="text-ink-400 text-sm">Active Clients</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">${totalRevenue.toFixed(0)}</div>
          <div className="text-ink-400 text-sm">Total Revenue</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">${averageSpent.toFixed(0)}</div>
          <div className="text-ink-400 text-sm">Avg. Spent</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-ink-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          All ({totalClients})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Active ({activeClients})
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'new'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          New ({clients.filter(c => c.status === 'new').length})
        </button>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No clients found</h3>
          <p className="text-ink-400 mb-4">
            {activeTab === 'active' 
              ? 'No active clients yet'
              : activeTab === 'new'
              ? 'No new clients yet'
              : 'No clients added yet'
            }
          </p>
          <Link
            href="/stylist/clients/add"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-black font-medium rounded-lg transition-colors"
          >
            Add Your First Client
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-ink-700 rounded-full flex items-center justify-center">
                    <span className="text-ink-300 font-medium text-lg">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                      {client.upcomingAppointments > 0 && (
                        <span className="px-2 py-1 bg-brand-400/20 text-brand-400 text-xs rounded-full">
                          {client.upcomingAppointments} upcoming
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-ink-400 text-sm">Contact</div>
                        <div className="text-white text-sm">{client.email}</div>
                        {client.phone && (
                          <div className="text-ink-300 text-sm">{client.phone}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-ink-400 text-sm">Sessions</div>
                        <div className="text-white font-medium">{client.totalSessions}</div>
                        <div className="text-ink-300 text-sm">
                          Last: {new Date(client.lastSession).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-ink-400 text-sm">Total Spent</div>
                        <div className="text-brand-400 font-medium">${client.totalSpent}</div>
                        <div className="text-ink-300 text-sm">
                          Avg: ${(client.totalSpent / client.totalSessions).toFixed(0)}/session
                        </div>
                      </div>
                      <div>
                        <div className="text-ink-400 text-sm">Budget</div>
                        <div className={`font-medium ${getBudgetColor(client.preferences.budget)}`}>
                          {client.preferences.budget.charAt(0).toUpperCase() + client.preferences.budget.slice(1)}
                        </div>
                        <div className="text-ink-300 text-sm">
                          {client.preferences.style.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="mb-4">
                      <div className="text-ink-400 text-sm mb-2">Style Preferences</div>
                      <div className="flex flex-wrap gap-2">
                        {client.preferences.style.map((style, index) => (
                          <span key={index} className="px-2 py-1 bg-ink-700 text-ink-300 text-xs rounded">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>

                    {client.preferences.notes && (
                      <div className="mb-4">
                        <div className="text-ink-400 text-sm mb-1">Notes</div>
                        <div className="text-ink-300 text-sm bg-ink-700/30 rounded p-3">
                          {client.preferences.notes}
                        </div>
                      </div>
                    )}

                    <div className="text-ink-500 text-xs">
                      Client since {new Date(client.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-white text-sm rounded transition-colors">
                      View Profile
                    </button>
                    <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-black text-sm rounded transition-colors">
                      Schedule Session
                    </button>
                    <button className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-white text-sm rounded transition-colors">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Insights */}
      {clients.length > 0 && (
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Client Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-white mb-3">Top Clients by Revenue</h4>
              <div className="space-y-2">
                {clients
                  .sort((a, b) => b.totalSpent - a.totalSpent)
                  .slice(0, 3)
                  .map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between p-2 bg-ink-700/30 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-brand-400 font-medium">#{index + 1}</span>
                        <span className="text-white text-sm">{client.name}</span>
                      </div>
                      <div className="text-ink-400 text-sm">${client.totalSpent}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-white mb-3">Style Preferences</h4>
              <div className="space-y-2">
                {Array.from(new Set(clients.flatMap(c => c.preferences.style))).map(style => {
                  const clientsWithStyle = clients.filter(c => c.preferences.style.includes(style))
                  return (
                    <div key={style} className="flex items-center justify-between p-2 bg-ink-700/30 rounded">
                      <span className="text-white text-sm">{style}</span>
                      <div className="text-ink-400 text-sm">
                        {clientsWithStyle.length} clients
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

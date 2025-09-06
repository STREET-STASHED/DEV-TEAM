'use client'

import { useState } from 'react'

interface EarningsData {
  month: string
  revenue: number
  sessions: number
  commission: number
  netEarnings: number
  clients: number
}

interface SessionData {
  id: string
  clientName: string
  service: string
  date: string
  revenue: number
  commission: number
  netEarnings: number
  status: 'completed' | 'pending' | 'cancelled'
}

export default function StylistEarningsPage() {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month')
  
  const earningsData: EarningsData[] = [
    { month: 'Jan 2024', revenue: 3245, sessions: 24, commission: 584, netEarnings: 2661, clients: 18 },
    { month: 'Dec 2023', revenue: 2890, sessions: 22, commission: 520, netEarnings: 2370, clients: 16 },
    { month: 'Nov 2023', revenue: 3150, sessions: 25, commission: 567, netEarnings: 2583, clients: 19 },
    { month: 'Oct 2023', revenue: 2780, sessions: 21, commission: 500, netEarnings: 2280, clients: 15 },
    { month: 'Sep 2023', revenue: 2950, sessions: 23, commission: 531, netEarnings: 2419, clients: 17 },
    { month: 'Aug 2023', revenue: 2620, sessions: 20, commission: 472, netEarnings: 2148, clients: 14 }
  ]

  const recentSessions: SessionData[] = [
    {
      id: '1',
      clientName: 'Emma Rodriguez',
      service: 'Personal Shopping Session',
      date: '2024-01-25',
      revenue: 150.00,
      commission: 27.00,
      netEarnings: 123.00,
      status: 'completed'
    },
    {
      id: '2',
      clientName: 'Sarah Kim',
      service: 'Wardrobe Consultation',
      date: '2024-01-25',
      revenue: 120.00,
      commission: 21.60,
      netEarnings: 98.40,
      status: 'completed'
    },
    {
      id: '3',
      clientName: 'Michael Chen',
      service: 'Style Refresh',
      date: '2024-01-25',
      revenue: 85.00,
      commission: 15.30,
      netEarnings: 69.70,
      status: 'pending'
    },
    {
      id: '4',
      clientName: 'Jessica Martinez',
      service: 'Special Event Styling',
      date: '2024-01-20',
      revenue: 200.00,
      commission: 36.00,
      netEarnings: 164.00,
      status: 'completed'
    },
    {
      id: '5',
      clientName: 'Emma Rodriguez',
      service: 'Wardrobe Audit',
      date: '2024-01-18',
      revenue: 95.00,
      commission: 17.10,
      netEarnings: 77.90,
      status: 'completed'
    }
  ]

  const currentMonth = earningsData[0]
  const totalRevenue = earningsData.reduce((sum, data) => sum + data.revenue, 0)
  const totalSessions = earningsData.reduce((sum, data) => sum + data.sessions, 0)
  const totalCommission = earningsData.reduce((sum, data) => sum + data.commission, 0)
  const totalNetEarnings = earningsData.reduce((sum, data) => sum + data.netEarnings, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-400/20 text-success-400'
      case 'pending': return 'bg-warning-400/20 text-warning-400'
      case 'cancelled': return 'bg-error-400/20 text-error-400'
      default: return 'bg-ink-600 text-ink-300'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Earnings Analytics</h1>
        <p className="mt-2 text-ink-400">
          Track your revenue, commission, and performance metrics
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-1 bg-ink-800 rounded-lg p-1">
        <button
          onClick={() => setTimeframe('month')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            timeframe === 'month'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setTimeframe('quarter')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            timeframe === 'quarter'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Quarterly
        </button>
        <button
          onClick={() => setTimeframe('year')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            timeframe === 'year'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Current Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-white">{formatCurrency(currentMonth.revenue)}</div>
          <div className="text-ink-400 text-sm">This Month Revenue</div>
          <div className="text-success-400 text-xs mt-1">+12.3% vs last month</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">{currentMonth.sessions}</div>
          <div className="text-ink-400 text-sm">Sessions This Month</div>
          <div className="text-success-400 text-xs mt-1">+9.1% vs last month</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-error-400">{formatCurrency(currentMonth.commission)}</div>
          <div className="text-ink-400 text-sm">Platform Commission</div>
          <div className="text-ink-400 text-xs mt-1">18% rate</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-success-400">{formatCurrency(currentMonth.netEarnings)}</div>
          <div className="text-ink-400 text-sm">Net Earnings</div>
          <div className="text-success-400 text-xs mt-1">+13.8% vs last month</div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
          <div className="text-ink-400 text-sm">Total Revenue (6 months)</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">{totalSessions}</div>
          <div className="text-ink-400 text-sm">Total Sessions</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-error-400">{formatCurrency(totalCommission)}</div>
          <div className="text-ink-400 text-sm">Total Commission Paid</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-success-400">{formatCurrency(totalNetEarnings)}</div>
          <div className="text-ink-400 text-sm">Total Net Earnings</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
        <div className="space-y-3">
          {earningsData.map((data, index) => (
            <div key={data.month} className="flex items-center justify-between p-3 bg-ink-700/30 rounded border border-ink-600">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-brand-400/20 rounded-full flex items-center justify-center">
                  <span className="text-brand-400 text-sm font-medium">{index + 1}</span>
                </div>
                <div>
                  <div className="text-white font-medium">{data.month}</div>
                  <div className="text-ink-400 text-sm">{data.sessions} sessions • {data.clients} clients</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{formatCurrency(data.revenue)}</div>
                <div className="text-ink-400 text-sm">Net: {formatCurrency(data.netEarnings)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-ink-500 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7l8 0M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No sessions yet</h3>
            <p className="text-ink-400">Your completed sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-ink-700/30 rounded border border-ink-600">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-ink-700 rounded-full flex items-center justify-center">
                    <span className="text-ink-300 font-medium text-sm">
                      {session.clientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{session.clientName}</div>
                    <div className="text-ink-400 text-sm">{session.service}</div>
                    <div className="text-ink-500 text-xs">{new Date(session.date).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-3">
                                         <div>
                       <div className="text-white font-medium">{formatCurrency(session.commission)}</div>
                       <div className="text-ink-400 text-sm">Commission</div>
                     </div>
                    <div>
                      <div className="text-success-400 font-medium">{formatCurrency(session.netEarnings)}</div>
                      <div className="text-ink-400 text-sm">Net Earnings</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commission Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Commission Analysis</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-ink-400">Total Revenue (6 months)</span>
              <span className="text-white font-medium">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-400">Platform Commission (18%)</span>
              <span className="text-error-400 font-medium">{formatCurrency(totalCommission)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-400">Net Earnings</span>
              <span className="text-success-400 font-medium">{formatCurrency(totalNetEarnings)}</span>
            </div>
            
            <div className="border-t border-ink-600 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Commission Rate</span>
                <span className="text-white font-medium">18%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Average Session Value</span>
                <span className="text-white font-medium">{formatCurrency(totalRevenue / totalSessions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Average Net per Session</span>
                <span className="text-success-400 font-medium">{formatCurrency(totalNetEarnings / totalSessions)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-ink-400">Average Monthly Revenue</span>
              <span className="text-white font-medium">{formatCurrency(totalRevenue / 6)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-400">Average Monthly Sessions</span>
              <span className="text-white font-medium">{(totalSessions / 6).toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-400">Revenue per Session</span>
              <span className="text-white font-medium">{formatCurrency(totalRevenue / totalSessions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-400">Net Earnings per Session</span>
              <span className="text-success-400 font-medium">{formatCurrency(totalNetEarnings / totalSessions)}</span>
            </div>
            
            <div className="border-t border-ink-600 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Growth Rate (6 months)</span>
                <span className="text-success-400 font-medium">+23.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Client Retention Rate</span>
                <span className="text-success-400 font-medium">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Average Client Value</span>
                <span className="text-white font-medium">{formatCurrency(totalRevenue / 18)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

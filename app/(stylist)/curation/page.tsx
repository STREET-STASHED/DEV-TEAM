'use client'

import { useState } from 'react'
import Link from 'next/link'


interface CurationPackage {
  id: string
  clientName: string
  packageType: 'trip' | 'work_week' | 'special_event' | 'seasonal' | 'custom'
  title: string
  description: string
  duration: string
  outfitCount: number
  totalValue: number
  serviceFee: number
  commission: number
  netEarnings: number
  status: 'draft' | 'proposal_sent' | 'approved' | 'completed' | 'cancelled'
  createdAt: string
  deliveryDate?: string
  items: Array<{
    id: string
    name: string
    price: number
    category: string
    outfitDay: string
  }>
  client: {
    id: string
    name: string
    email: string
    preferences: {
      style: string[]
      budget: 'low' | 'medium' | 'high'
      sizes: string[]
    }
  }
}

export default function StylistCurationPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'proposals' | 'completed' | 'all'>('active')
  const [packages] = useState<CurationPackage[]>([
    {
      id: '1',
      clientName: 'Emma Rodriguez',
      packageType: 'trip',
      title: 'Paris Business Trip - 5 Days',
      description: 'Professional looks for business meetings in Paris with evening options',
      duration: '5 days',
      outfitCount: 8,
      totalValue: 890.00,
      serviceFee: 200.00,
      commission: 196.20, // 18% of total (890 + 200)
      netEarnings: 893.80,
      status: 'approved',
      createdAt: '2024-01-20',
      deliveryDate: '2024-02-01',
      items: [
        { id: '1', name: 'Navy Blazer', price: 120.00, category: 'clothing', outfitDay: 'Day 1 - Meeting' },
        { id: '2', name: 'White Silk Blouse', price: 85.00, category: 'clothing', outfitDay: 'Day 1 - Meeting' },
        { id: '3', name: 'Black Trousers', price: 75.00, category: 'clothing', outfitDay: 'Day 1 - Meeting' },
        { id: '4', name: 'Statement Earrings', price: 35.00, category: 'jewelry', outfitDay: 'Day 1 - Meeting' },
        { id: '5', name: 'Midi Dress', price: 95.00, category: 'clothing', outfitDay: 'Day 2 - Conference' },
        { id: '6', name: 'Cardigan', price: 65.00, category: 'clothing', outfitDay: 'Day 2 - Conference' },
        { id: '7', name: 'Evening Dress', price: 180.00, category: 'clothing', outfitDay: 'Day 3 - Dinner' },
        { id: '8', name: 'Cocktail Heels', price: 110.00, category: 'shoes', outfitDay: 'Day 3 - Dinner' }
      ],
      client: {
        id: '1',
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@email.com',
        preferences: {
          style: ['Business Casual', 'Minimalist'],
          budget: 'high',
          sizes: ['M', '8']
        }
      }
    },
    {
      id: '2',
      clientName: 'Sarah Kim',
      packageType: 'work_week',
      title: 'New Job - First Week Wardrobe',
      description: 'Professional outfits for first week at new corporate job',
      duration: '1 week',
      outfitCount: 5,
      totalValue: 540.00,
      serviceFee: 150.00,
      commission: 124.20, // 18% of total (540 + 150)
      netEarnings: 565.80,
      status: 'proposal_sent',
      createdAt: '2024-01-22',
      deliveryDate: '2024-01-29',
      items: [
        { id: '9', name: 'Black Suit Set', price: 180.00, category: 'clothing', outfitDay: 'Monday' },
        { id: '10', name: 'Gray Dress', price: 95.00, category: 'clothing', outfitDay: 'Tuesday' },
        { id: '11', name: 'Blouse & Skirt Set', price: 130.00, category: 'clothing', outfitDay: 'Wednesday' },
        { id: '12', name: 'Knit Dress', price: 85.00, category: 'clothing', outfitDay: 'Thursday' },
        { id: '13', name: 'Casual Friday Look', price: 50.00, category: 'clothing', outfitDay: 'Friday' }
      ],
      client: {
        id: '2',
        name: 'Sarah Kim',
        email: 'sarah.kim@email.com',
        preferences: {
          style: ['Professional', 'Modern'],
          budget: 'medium',
          sizes: ['S', '6']
        }
      }
    },
    {
      id: '3',
      clientName: 'Jessica Martinez',
      packageType: 'special_event',
      title: 'Wedding Guest - Weekend Events',
      description: 'Complete looks for wedding weekend: rehearsal, ceremony, reception',
      duration: '3 days',
      outfitCount: 4,
      totalValue: 420.00,
      serviceFee: 120.00,
      commission: 97.20, // 18% of total (420 + 120)
      netEarnings: 442.80,
      status: 'completed',
      createdAt: '2024-01-15',
      deliveryDate: '2024-01-18',
      items: [
        { id: '14', name: 'Rehearsal Dinner Dress', price: 110.00, category: 'clothing', outfitDay: 'Friday - Rehearsal' },
        { id: '15', name: 'Wedding Guest Dress', price: 150.00, category: 'clothing', outfitDay: 'Saturday - Ceremony' },
        { id: '16', name: 'Reception Jumpsuit', price: 95.00, category: 'clothing', outfitDay: 'Saturday - Reception' },
        { id: '17', name: 'Brunch Outfit', price: 65.00, category: 'clothing', outfitDay: 'Sunday - Brunch' }
      ],
      client: {
        id: '3',
        name: 'Jessica Martinez',
        email: 'jessica.martinez@email.com',
        preferences: {
          style: ['Romantic', 'Feminine'],
          budget: 'medium',
          sizes: ['M', '8']
        }
      }
    }
  ])

  const filteredPackages = packages.filter(pkg => {
    if (activeTab === 'active') return ['approved', 'proposal_sent'].includes(pkg.status)
    if (activeTab === 'proposals') return pkg.status === 'proposal_sent'
    if (activeTab === 'completed') return pkg.status === 'completed'
    return true
  })

  const totalPackages = packages.length
  const activePackages = packages.filter(p => ['approved', 'proposal_sent'].includes(p.status)).length
  const totalRevenue = packages.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.totalValue + p.serviceFee, 0)
  const totalEarnings = packages.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.netEarnings, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success-400/20 text-success-400'
      case 'proposal_sent': return 'bg-brand-400/20 text-brand-400'
      case 'completed': return 'bg-ink-600 text-ink-300'
      case 'draft': return 'bg-warning-400/20 text-warning-400'
      case 'cancelled': return 'bg-error-400/20 text-error-400'
      default: return 'bg-ink-600 text-ink-300'
    }
  }

  const getPackageTypeColor = (type: string) => {
    switch (type) {
      case 'trip': return 'bg-blue-400/20 text-blue-400'
      case 'work_week': return 'bg-green-400/20 text-green-400'
      case 'special_event': return 'bg-purple-400/20 text-purple-400'
      case 'seasonal': return 'bg-orange-400/20 text-orange-400'
      case 'custom': return 'bg-pink-400/20 text-pink-400'
      default: return 'bg-ink-600 text-ink-300'
    }
  }

  const formatPackageType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Curation Services</h1>
          <p className="mt-2 text-ink-400">
            Create custom outfit packages for clients&apos; trips, work weeks, and special events
          </p>
        </div>
        <Link
          href="/stylist/curation/create"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-black font-medium rounded-lg transition-colors"
        >
          Create Package
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-white">{totalPackages}</div>
          <div className="text-ink-400 text-sm">Total Packages</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">{activePackages}</div>
          <div className="text-ink-400 text-sm">Active Projects</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(0)}</div>
          <div className="text-ink-400 text-sm">Total Revenue</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-success-400">${totalEarnings.toFixed(0)}</div>
          <div className="text-ink-400 text-sm">Net Earnings</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-ink-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Active ({activePackages})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'proposals'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Proposals ({packages.filter(p => p.status === 'proposal_sent').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Completed ({packages.filter(p => p.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          All ({totalPackages})
        </button>
      </div>

      {/* Packages List */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No packages found</h3>
          <p className="text-ink-400 mb-4">
            {activeTab === 'active' 
              ? 'No active curation packages'
              : activeTab === 'proposals'
              ? 'No pending proposals'
              : activeTab === 'completed'
              ? 'No completed packages yet'
              : 'No curation packages created yet'
            }
          </p>
          <Link
            href="/stylist/curation/create"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-black font-medium rounded-lg transition-colors"
          >
            Create Your First Package
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{pkg.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                      {pkg.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPackageTypeColor(pkg.packageType)}`}>
                      {formatPackageType(pkg.packageType)}
                    </span>
                  </div>
                  
                  <p className="text-ink-400 text-sm mb-4">{pkg.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-ink-400 text-sm">Client</div>
                      <div className="text-white font-medium">{pkg.clientName}</div>
                      <div className="text-ink-300 text-sm">{pkg.client.email}</div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-sm">Duration</div>
                      <div className="text-white font-medium">{pkg.duration}</div>
                      <div className="text-ink-300 text-sm">{pkg.outfitCount} outfits</div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-sm">Package Value</div>
                      <div className="text-white font-medium">${pkg.totalValue}</div>
                      <div className="text-ink-300 text-sm">Service: ${pkg.serviceFee}</div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-sm">Your Earnings</div>
                      <div className="text-success-400 font-medium">${pkg.netEarnings}</div>
                      <div className="text-ink-300 text-sm">After commission</div>
                    </div>
                  </div>

                  {/* Client Preferences */}
                  <div className="mb-4">
                    <div className="text-ink-400 text-sm mb-2">Client Style Preferences</div>
                    <div className="flex flex-wrap gap-2">
                      {pkg.client.preferences.style.map((style, index) => (
                        <span key={index} className="px-2 py-1 bg-ink-700 text-ink-300 text-xs rounded">
                          {style}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-ink-700 text-ink-300 text-xs rounded">
                        Budget: {pkg.client.preferences.budget}
                      </span>
                      <span className="px-2 py-1 bg-ink-700 text-ink-300 text-xs rounded">
                        Sizes: {pkg.client.preferences.sizes.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Outfit Preview */}
                  <div className="mb-4">
                    <div className="text-ink-400 text-sm mb-2">Outfit Schedule</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(
                        pkg.items.reduce((acc, item) => {
                          if (!acc[item.outfitDay]) acc[item.outfitDay] = []
                          acc[item.outfitDay].push(item)
                          return acc
                        }, {} as Record<string, typeof pkg.items>)
                      ).map(([day, items]) => (
                        <div key={day} className="bg-ink-700/30 rounded p-2">
                          <div className="text-ink-300 text-xs font-medium mb-1">{day}</div>
                          <div className="text-ink-400 text-xs">
                            {items.map(item => item.name).join(', ')} • ${items.reduce((sum, item) => sum + item.price, 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>Created {new Date(pkg.createdAt).toLocaleDateString()}</span>
                    {pkg.deliveryDate && (
                      <span>Delivery: {new Date(pkg.deliveryDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-white text-sm rounded transition-colors">
                    View Details
                  </button>
                  {pkg.status === 'proposal_sent' && (
                    <>
                      <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-black text-sm rounded transition-colors">
                        Edit Proposal
                      </button>
                      <button className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white text-sm rounded transition-colors">
                        Follow Up
                      </button>
                    </>
                  )}
                  {pkg.status === 'approved' && (
                    <button className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white text-sm rounded transition-colors">
                      Start Curation
                    </button>
                  )}
                  <button className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-white text-sm rounded transition-colors">
                    Contact Client
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Types Overview */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Curation Package Types</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-ink-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              <h4 className="text-white font-medium">Trip Packages</h4>
            </div>
            <p className="text-ink-400 text-sm mb-3">Complete wardrobe for business trips, vacations, or travel</p>
            <div className="text-ink-300 text-xs">
              • 3-14 day packages<br/>
              • Climate considerations<br/>
              • Activity-specific outfits
            </div>
          </div>

          <div className="bg-ink-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <h4 className="text-white font-medium">Work Week</h4>
            </div>
            <p className="text-ink-400 text-sm mb-3">Professional wardrobe for new jobs or important work weeks</p>
            <div className="text-ink-300 text-xs">
              • 5-7 day packages<br/>
              • Professional dress codes<br/>
              • Mix & match pieces
            </div>
          </div>

          <div className="bg-ink-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
              <h4 className="text-white font-medium">Special Events</h4>
            </div>
            <p className="text-ink-400 text-sm mb-3">Weddings, parties, conferences, and special occasions</p>
            <div className="text-ink-300 text-xs">
              • 1-3 day packages<br/>
              • Event-appropriate styling<br/>
              • Accessories included
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

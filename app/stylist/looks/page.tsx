'use client'

import { useState } from 'react'
import Link from 'next/link'

interface StylistLook {
  id: string
  name: string
  description: string
  category: string
  imageUrl?: string
  items: Array<{
    id: string
    name: string
    price: number
    category: string
  }>
  likes: number
  saves: number
  views: number
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  totalValue: number
}

export default function StylistLooksPage() {
  const [activeTab, setActiveTab] = useState<'published' | 'draft' | 'all'>('published')
  const [looks] = useState<StylistLook[]>([
    {
      id: '1',
      name: 'Casual Friday Vibes',
      description: 'Perfect for casual office days with a touch of sophistication',
      category: 'Business Casual',
      items: [
        { id: '1', name: 'Vintage Denim Jacket', price: 28.00, category: 'clothing' },
        { id: '2', name: 'White Blouse', price: 22.00, category: 'clothing' },
        { id: '3', name: 'Black Ankle Boots', price: 45.00, category: 'shoes' }
      ],
      likes: 24,
      saves: 8,
      views: 156,
      status: 'published',
      createdAt: '2024-01-20',
      totalValue: 95.00
    },
    {
      id: '2',
      name: 'Date Night Elegance',
      description: 'Sophisticated evening look for special occasions',
      category: 'Evening Wear',
      items: [
        { id: '4', name: 'Black Cocktail Dress', price: 65.00, category: 'clothing' },
        { id: '5', name: 'Statement Necklace', price: 18.00, category: 'jewelry' },
        { id: '6', name: 'Red Heels', price: 38.00, category: 'shoes' }
      ],
      likes: 42,
      saves: 15,
      views: 234,
      status: 'published',
      createdAt: '2024-01-18',
      totalValue: 121.00
    },
    {
      id: '3',
      name: 'Weekend Warrior',
      description: 'Comfortable yet stylish for weekend activities',
      category: 'Casual',
      items: [
        { id: '7', name: 'Oversized Sweater', price: 32.00, category: 'clothing' },
        { id: '8', name: 'High-Waist Jeans', price: 28.00, category: 'clothing' },
        { id: '9', name: 'White Sneakers', price: 25.00, category: 'shoes' }
      ],
      likes: 18,
      saves: 6,
      views: 89,
      status: 'published',
      createdAt: '2024-01-15',
      totalValue: 85.00
    },
    {
      id: '4',
      name: 'Spring Garden Party',
      description: 'Floral and fresh for outdoor events',
      category: 'Special Occasion',
      items: [
        { id: '10', name: 'Floral Dress', price: 55.00, category: 'clothing' },
        { id: '11', name: 'Straw Hat', price: 15.00, category: 'accessories' },
        { id: '12', name: 'Wedge Sandals', price: 32.00, category: 'shoes' }
      ],
      likes: 31,
      saves: 12,
      views: 167,
      status: 'draft',
      createdAt: '2024-01-22',
      totalValue: 102.00
    }
  ])

  const filteredLooks = looks.filter(look => {
    if (activeTab === 'published') return look.status === 'published'
    if (activeTab === 'draft') return look.status === 'draft'
    return true
  })

  const totalLikes = looks.reduce((sum, look) => sum + look.likes, 0)
  const totalSaves = looks.reduce((sum, look) => sum + look.saves, 0)
  const totalValue = looks.reduce((sum, look) => sum + look.totalValue, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-success-400/20 text-success-400'
      case 'draft': return 'bg-warning-400/20 text-warning-400'
      case 'archived': return 'bg-ink-600 text-ink-300'
      default: return 'bg-ink-600 text-ink-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">My Looks</h1>
          <p className="mt-2 text-ink-400">
            Create and manage your curated looks and style collections
          </p>
        </div>
        <Link
          href="/stylist/looks/create"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-black font-medium rounded-lg transition-colors"
        >
          Create Look
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-white">{looks.length}</div>
          <div className="text-ink-400 text-sm">Total Looks</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">{totalLikes}</div>
          <div className="text-ink-400 text-sm">Total Likes</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">{totalSaves}</div>
          <div className="text-ink-400 text-sm">Total Saves</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <div className="text-2xl font-bold text-brand-400">${totalValue}</div>
          <div className="text-ink-400 text-sm">Total Value</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-ink-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('published')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'published'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Published ({looks.filter(l => l.status === 'published').length})
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'draft'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Drafts ({looks.filter(l => l.status === 'draft').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-600 text-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          All ({looks.length})
        </button>
      </div>

      {/* Looks Grid */}
      {filteredLooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No looks found</h3>
          <p className="text-ink-400 mb-4">
            {activeTab === 'published' 
              ? 'No published looks yet'
              : activeTab === 'draft'
              ? 'No draft looks yet'
              : 'No looks created yet'
            }
          </p>
          <Link
            href="/stylist/looks/create"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-black font-medium rounded-lg transition-colors"
          >
            Create Your First Look
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLooks.map((look) => (
            <div key={look.id} className="bg-ink-800 border border-ink-700 rounded-lg shadow-card overflow-hidden">
              {/* Look Image */}
              <div className="aspect-square bg-ink-700 flex items-center justify-center">
                <svg className="w-12 h-12 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Look Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{look.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(look.status)}`}>
                    {look.status}
                  </span>
                </div>

                <p className="text-ink-400 text-sm mb-4 line-clamp-2">{look.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-400">Category:</span>
                    <span className="text-white">{look.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-400">Items:</span>
                    <span className="text-white">{look.items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-400">Total Value:</span>
                    <span className="text-brand-400">${look.totalValue}</span>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-xs text-ink-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>❤️ {look.likes}</span>
                    <span>💾 {look.saves}</span>
                    <span>👁️ {look.views}</span>
                  </div>
                  <span>{new Date(look.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Look Items Preview */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-ink-400 mb-2">Items:</div>
                  <div className="space-y-1">
                    {look.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs text-ink-300">
                        • {item.name} - ${item.price}
                      </div>
                    ))}
                    {look.items.length > 3 && (
                      <div className="text-xs text-ink-400">
                        +{look.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-ink-700 hover:bg-ink-600 text-white text-sm rounded transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-black text-sm rounded transition-colors">
                    View
                  </button>
                  {look.status === 'draft' && (
                    <button className="px-3 py-2 bg-success-600 hover:bg-success-700 text-white text-sm rounded transition-colors">
                      Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Overview */}
      {looks.length > 0 && (
        <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-white mb-3">Top Performing Looks</h4>
              <div className="space-y-2">
                {looks
                  .sort((a, b) => b.likes - a.likes)
                  .slice(0, 3)
                  .map((look, index) => (
                    <div key={look.id} className="flex items-center justify-between p-2 bg-ink-700/30 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-brand-400 font-medium">#{index + 1}</span>
                        <span className="text-white text-sm">{look.name}</span>
                      </div>
                      <div className="text-ink-400 text-sm">{look.likes} likes</div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-white mb-3">Category Breakdown</h4>
              <div className="space-y-2">
                {Array.from(new Set(looks.map(l => l.category))).map(category => {
                  const categoryLooks = looks.filter(l => l.category === category)
                  const totalLikes = categoryLooks.reduce((sum, l) => sum + l.likes, 0)
                  return (
                    <div key={category} className="flex items-center justify-between p-2 bg-ink-700/30 rounded">
                      <span className="text-white text-sm">{category}</span>
                      <div className="text-ink-400 text-sm">
                        {categoryLooks.length} looks • {totalLikes} likes
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

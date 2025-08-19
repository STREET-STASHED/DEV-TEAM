'use client'

import { useState } from 'react'
import { StylistBundleUpload } from '@/components/stylist/StylistBundleUpload'

interface StylistBundle {
  id: string
  name: string
  description: string
  items: Array<{
    id: string
    name: string
    basePrice: number
    category: string
    imageUrl?: string
  }>
  targetProfitMargin: number
  isPilot: boolean
  subscriptionTier?: 'silver' | 'gold' | 'platinum' | 'diamond'
}

export default function StylistBundleUploadPage() {
  const [bundles, setBundles] = useState<StylistBundle[]>([])
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload')

  const handleBundleCreate = (bundle: StylistBundle) => {
    setBundles([bundle, ...bundles])
    setActiveTab('gallery')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Stylist Bundle Upload</h1>
        <p className="mt-2 text-ink-400">
          Create and upload your curated bundles and outfits with commission-aware pricing
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-ink-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-brand-600 text-ink-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          Create Bundle
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'gallery'
              ? 'bg-brand-600 text-ink-black'
              : 'text-ink-400 hover:text-ink-300'
          }`}
        >
          My Bundles ({bundles.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'upload' ? (
        <div className="max-w-4xl mx-auto">
          <StylistBundleUpload onBundleCreate={handleBundleCreate} />
        </div>
      ) : (
        <div className="space-y-6">
          {bundles.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No bundles yet</h3>
              <p className="text-ink-400 mb-4">Create your first curated bundle to get started</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-ink-black font-medium rounded-lg transition-colors"
              >
                Create Your First Bundle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{bundle.name}</h3>
                  <p className="text-ink-400 text-sm mb-4">{bundle.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Items:</span>
                      <span className="text-white">{bundle.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Target Profit:</span>
                      <span className="text-brand-400">{bundle.targetProfitMargin}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Phase:</span>
                      <span className="text-white">{bundle.isPilot ? 'Pilot' : 'Subscription'}</span>
                    </div>
                    {!bundle.isPilot && (
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-400">Tier:</span>
                        <span className="text-white capitalize">{bundle.subscriptionTier}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-medium text-ink-400 mb-2">Bundle Items:</div>
                    {bundle.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs text-ink-300">
                        • {item.name} - ${item.basePrice}
                      </div>
                    ))}
                    {bundle.items.length > 3 && (
                      <div className="text-xs text-ink-400">
                        +{bundle.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-ink-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ink-400">Status:</span>
                      <span className="px-2 py-1 bg-success-400/20 text-success-400 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Commission Info */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Commission Structure for Stylists</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-white mb-3">Pilot Phase (Current)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-400">Commission Rate:</span>
                <span className="text-white">18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Monthly Fee:</span>
                <span className="text-white">$0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Best for:</span>
                <span className="text-white">Getting started</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-white mb-3">Post-Pilot Subscription</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-400">Commission Rate:</span>
                <span className="text-white">5-12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Monthly Fee:</span>
                <span className="text-white">$20-100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Best for:</span>
                <span className="text-white">High-volume stylists</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-brand-400/10 border border-brand-400/30 rounded">
          <div className="text-brand-400 text-sm">
            <strong>Pro Tip:</strong> Use the bundle pricing preview to see how different commission rates affect your profit margins. 
            Higher subscription tiers offer lower commission rates but require monthly fees.
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { FeeBreakdown } from '@/lib/feeConfig'
import { useState } from 'react'

interface FeeBreakdownProps {
  breakdown: FeeBreakdown
  distanceMiles: number
  cartSubtotal: number
  className?: string
}

export function FeeBreakdownComponent({ 
  breakdown, 
  distanceMiles, 
  cartSubtotal, 
  className = '' 
}: FeeBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getTooltipText = (type: string) => {
    switch (type) {
      case 'buyerCap':
        return 'Your delivery fee is capped to keep costs reasonable for longer trips'
      case 'split':
        return 'Delivery costs are shared between buyer and seller based on cart value and distance'
      case 'driver':
        return '70% of the total fee goes directly to your driver'
      case 'platform':
        return '30% covers platform operations, support, and technology'
      case 'night':
        return 'Additional fee for deliveries after 10pm'
      case 'weather':
        return '15% increase for deliveries during bad weather conditions'
      case 'longDistance':
        return 'Trips over 20 miles require explicit consent due to higher costs'
      default:
        return ''
    }
  }

  const getAppliedBadges = () => {
    const badges = []
    
    if (breakdown.applied.buyerCapApplied) {
      badges.push({ text: 'Capped', type: 'buyerCap', color: 'bg-brand-500/20 text-brand-400' })
    }
    if (breakdown.applied.nightBonus) {
      badges.push({ text: 'Night', type: 'night', color: 'bg-ink-500/20 text-ink-400' })
    }
    if (breakdown.applied.badWeatherAdjust) {
      badges.push({ text: 'Weather', type: 'weather', color: 'bg-warning-500/20 text-warning-400' })
    }
    if (breakdown.applied.highCartRelief) {
      badges.push({ text: 'High Value', type: 'split', color: 'bg-success-500/20 text-success-400' })
    }
    if (breakdown.applied.smallCartRule) {
      badges.push({ text: 'Small Cart', type: 'split', color: 'bg-ink-500/20 text-ink-400' })
    }
    
    return badges
  }

  return (
    <div className={`bg-ink-900 border border-ink-800 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Stashed Support Fee</h3>
        <div className="flex items-center space-x-2">
          {getAppliedBadges().map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
              title={getTooltipText(badge.type)}
            >
              {badge.text}
            </span>
          ))}
        </div>
      </div>

      {/* Main Fee Display */}
      <div className="space-y-3">
        {/* Total Fee */}
        <div className="flex justify-between items-center py-2 border-b border-ink-700">
          <span className="text-white font-medium">Total Support Fee</span>
          <span className="text-2xl font-bold text-brand-400">${breakdown.total.toFixed(2)}</span>
        </div>

        {/* Buyer/Seller Split */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-ink-800/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-ink-300">You Pay</span>
              <span className="text-lg font-semibold text-white">${breakdown.buyer.toFixed(2)}</span>
            </div>
            <div className="text-xs text-ink-400">
              {breakdown.applied.buyerCapApplied && '(capped)'}
            </div>
          </div>
          
          <div className="bg-ink-800/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-ink-300">Seller Pays</span>
              <span className="text-lg font-semibold text-white">${breakdown.seller.toFixed(2)}</span>
            </div>
            <div className="text-xs text-ink-400">
              Deducted from seller payout
            </div>
          </div>
        </div>

        {/* Driver/Platform Breakdown */}
        <div className="bg-ink-800/30 rounded-lg p-3">
          <div className="text-sm text-ink-300 mb-2">Fee Breakdown</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-400">Driver (70%)</span>
              <span className="text-brand-400 font-medium">${breakdown.driver.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Platform (30%)</span>
              <span className="text-ink-300 font-medium">${breakdown.platform.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm text-ink-400 hover:text-brand-400 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-ink-700">
            <div className="text-sm text-ink-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Distance:</span> {distanceMiles.toFixed(1)} mi
                </div>
                <div>
                  <span className="font-medium">Cart Value:</span> ${cartSubtotal.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-ink-500 space-y-1">
              <div>• Driver compensation covers fuel, time, and vehicle costs</div>
              <div>• Platform fee supports operations, customer service, and technology</div>
              <div>• Fees are calculated based on distance, time, and cart value</div>
              {breakdown.applied.requiresLongDistanceConsent && (
                <div className="text-warning-400">• Long distance trips require explicit consent</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Long Distance Consent Modal Component
export function LongDistanceConsentModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  distanceMiles 
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  distanceMiles: number
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-ink-900 border border-ink-800 rounded-lg p-6 max-w-md mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Long Distance Delivery</h3>
            <p className="text-ink-300 mb-4">
              Your delivery distance is {distanceMiles.toFixed(1)} miles, which exceeds our standard 20-mile limit.
            </p>
            <div className="bg-ink-800/50 rounded-lg p-3 text-sm text-ink-300 mb-4">
              <div className="font-medium mb-2">What this means:</div>
              <ul className="space-y-1 text-left">
                <li>• Higher delivery fees due to increased distance</li>
                <li>• Longer delivery times (up to 2+ hours)</li>
                <li>• Driver compensation covers extended travel</li>
                <li>• You&apos;ll see the exact fee before confirming</li>
              </ul>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-ink-300 hover:text-white border border-ink-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
            >
              Continue with Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

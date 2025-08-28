'use client'

import { StreetStashedLogo } from '@/components/StreetStashedLogo'
import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Check initial status
    checkOnlineStatus()

    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  useEffect(() => {
    if (isOnline) {
      // Redirect to home page when back online
      window.location.href = '/'
    }
  }, [isOnline])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const handleGoHome = () => {
    // Try to navigate to home page
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <StreetStashedLogo className="w-32 h-32 mx-auto" />
        </div>

        {/* Offline Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-ink-800 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-ink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-ink-100 mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-ink-300 text-center mb-8">
          You&apos;re currently offline. Don&apos;t worry - you can still browse previously loaded content and access your saved items.
        </p>

        <div className="bg-ink-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-ink-100 mb-4">What&apos;s Available Offline?</h3>
          <p className="text-ink-400 text-sm">
            • Previously viewed products<br/>
            • Your shopping cart<br/>
            • Saved favorites<br/>
            • User preferences
          </p>
        </div>

        {/* Status */}
        <div className="mb-8 p-4 bg-ink-800 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-ink-300">
              {isOnline ? 'Back Online!' : 'Still Offline'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={retryCount > 3}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-ink-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {retryCount > 3 ? 'Too Many Retries' : 'Try Again'}
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-ink-800 hover:bg-ink-700 text-ink-200 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go to Home Page
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-ink-800/50 rounded-lg">
          <h3 className="text-sm font-medium text-ink-200 mb-2">
            💡 Offline Tips
          </h3>
          <ul className="text-xs text-ink-400 space-y-1">
            <li>• Check your Wi-Fi connection</li>
            <li>• Try switching to mobile data</li>
            <li>• Restart your router if needed</li>
            <li>• Previously viewed products are cached</li>
          </ul>
        </div>

        {/* Retry Counter */}
        {retryCount > 0 && (
          <div className="mt-4 text-xs text-ink-500">
            Retry attempts: {retryCount}
          </div>
        )}
      </div>
    </div>
  )
}

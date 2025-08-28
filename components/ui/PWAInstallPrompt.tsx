'use client'

import { Download, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    checkIfInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstalled(true)
        setShowPrompt(false)
      } else {
        console.log('User dismissed the install prompt')
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Hide for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-ink-800 border border-ink-700 rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-brand-400" />
            <h3 className="font-medium text-ink-100">Install App</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-ink-400 hover:text-ink-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-ink-300 mb-4">
          Install StreetStashed on your device for a better experience.
          Get quick access, offline support, and app-like features.
        </p>

        {/* Benefits */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-ink-400">
            <div className="w-2 h-2 bg-brand-400 rounded-full"></div>
            <span>Quick access from home screen</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-ink-400">
            <div className="w-2 h-2 bg-brand-400 rounded-full"></div>
            <span>Offline browsing capability</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-ink-400">
            <div className="w-2 h-2 bg-brand-400 rounded-full"></div>
            <span>Faster loading times</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Install</span>
          </button>

          <button
            onClick={handleDismiss}
            className="flex-1 bg-ink-700 hover:bg-ink-600 text-ink-200 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Platform-specific info */}
        <div className="mt-3 text-xs text-ink-500 text-center">
          {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? (
            <span>
              Tap the share button and select "Add to Home Screen"
            </span>
          ) : navigator.userAgent.includes('Android') ? (
            <span>
              Tap "Install" or "Add to Home Screen"
            </span>
          ) : (
            <span>
              Click "Install" to add to your desktop
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for PWA installation
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Installation failed:', error)
      return false
    }
  }

  return { isInstallable, install }
}

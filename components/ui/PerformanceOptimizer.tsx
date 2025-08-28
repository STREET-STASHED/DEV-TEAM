'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkRequests: number
}

interface PerformanceOptimizerProps {
  children: ReactNode
  onMetrics?: (metrics: PerformanceMetrics) => void
  showMetrics?: boolean
  className?: string
}

export default function PerformanceOptimizer({
  children,
  onMetrics,
  showMetrics = false,
  className = ""
}: PerformanceOptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  })
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationStatus, setOptimizationStatus] = useState<string>('')

  // Measure performance metrics
  const measurePerformance = useCallback(() => {
    const startTime = performance.now()
    
    // Measure load time
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.navigationStart
        setMetrics(prev => ({ ...prev, loadTime }))
      }
    }

    // Measure render time
    const renderTime = performance.now() - startTime
    setMetrics(prev => ({ ...prev, renderTime }))

    // Measure memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
      setMetrics(prev => ({ ...prev, memoryUsage }))
    }

    // Count network requests
    const networkRequests = performance.getEntriesByType('resource').length
    setMetrics(prev => ({ ...prev, networkRequests }))

    // Notify parent component
    if (onMetrics) {
      onMetrics(metrics)
    }
  }, [onMetrics, metrics])

  // Optimize performance
  const optimizePerformance = useCallback(async () => {
    setIsOptimizing(true)
    setOptimizationStatus('Analyzing performance...')

    try {
      // Simulate optimization steps
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOptimizationStatus('Optimizing bundle...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOptimizationStatus('Compressing assets...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOptimizationStatus('Optimizing images...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOptimizationStatus('Performance optimized!')
      
      // Re-measure metrics after optimization
      setTimeout(() => {
        measurePerformance()
        setIsOptimizing(false)
      }, 1000)

    } catch (error) {
      setOptimizationStatus('Optimization failed')
      setIsOptimizing(false)
    }
  }, [measurePerformance])

  // Monitor performance on mount
  useEffect(() => {
    measurePerformance()
    
    // Set up performance monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          measurePerformance()
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })

    return () => observer.disconnect()
  }, [measurePerformance])

  return (
    <div className={className}>
      {/* Performance Metrics Display */}
      {showMetrics && (
        <div className="mb-4 p-4 bg-ink-800 rounded-lg border border-ink-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink-200">Performance Metrics</h3>
            <button
              onClick={optimizePerformance}
              disabled={isOptimizing}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-ink-600 text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-2"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Optimize</span>
                </>
              )}
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-ink-100">
                {metrics.loadTime > 0 ? `${Math.round(metrics.loadTime)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-ink-400">Load Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-ink-100">
                {metrics.renderTime > 0 ? `${Math.round(metrics.renderTime)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-ink-400">Render Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-ink-100">
                {metrics.memoryUsage > 0 ? `${metrics.memoryUsage.toFixed(1)}MB` : 'N/A'}
              </div>
              <div className="text-xs text-ink-400">Memory Usage</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-ink-100">
                {metrics.networkRequests}
              </div>
              <div className="text-xs text-ink-400">Network Requests</div>
            </div>
          </div>

          {/* Optimization Status */}
          {optimizationStatus && (
            <div className="mt-3 p-2 bg-ink-700 rounded text-xs text-ink-300 text-center">
              {optimizationStatus}
            </div>
          )}

          {/* Performance Tips */}
          <div className="mt-3 p-3 bg-ink-700/50 rounded">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-ink-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-ink-400">
                <strong>Performance Tips:</strong> Use lazy loading for images, implement code splitting, 
                and optimize bundle size for better performance.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

// Loading State Component
export function LoadingState({ 
  message = "Loading...", 
  size = "default",
  className = "" 
}: {
  message?: string
  size?: "small" | "default" | "large"
  className?: string
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8"
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-brand-500`} />
        <span className="text-ink-400">{message}</span>
      </div>
    </div>
  )
}

// Error Boundary Component
export function ErrorBoundary({ 
  children, 
  fallback,
  onError 
}: {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: Error, errorInfo: any) => {
      setHasError(true)
      setError(error)
      if (onError) {
        onError(error, errorInfo)
      }
    }

    // Global error handler
    window.addEventListener('error', (event) => {
      handleError(event.error, event)
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new Error(event.reason), event)
    })

    return () => {
      window.removeEventListener('error', handleError as any)
      window.removeEventListener('unhandledrejection', handleError as any)
    }
  }, [onError])

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="p-6 bg-red-900/20 border border-red-700/30 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-300">Something went wrong</h3>
            <p className="text-sm text-red-200 mt-1">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Lazy Load Component
export function LazyLoad({ 
  children, 
  threshold = 0.1,
  fallback,
  className = ""
}: {
  children: ReactNode
  threshold?: number
  fallback?: ReactNode
  className?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    const element = document.querySelector(`[data-lazy-load]`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [threshold])

  useEffect(() => {
    if (isVisible) {
      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsLoaded(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible) {
    return (
      <div data-lazy-load className={className}>
        {fallback || <LoadingState message="Loading..." size="small" />}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={className}>
        {fallback || <LoadingState message="Loading..." size="small" />}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

// Performance Monitor Hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  })

  const measurePerformance = useCallback(() => {
    const startTime = performance.now()
    
    // Measure various performance metrics
    const newMetrics: PerformanceMetrics = {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkRequests: 0
    }

    // Load time
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        newMetrics.loadTime = navigation.loadEventEnd - navigation.navigationStart
      }
    }

    // Render time
    newMetrics.renderTime = performance.now() - startTime

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory
      newMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024
    }

    // Network requests
    newMetrics.networkRequests = performance.getEntriesByType('resource').length

    setMetrics(newMetrics)
    return newMetrics
  }, [])

  return { metrics, measurePerformance }
}

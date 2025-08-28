// Performance Optimization Utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private cache = new Map<string, any>()
  private imageCache = new Map<string, HTMLImageElement>()

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // Image optimization
  async optimizeImage(
    src: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'jpeg'
    } = {}
  ): Promise<string> {
    const cacheKey = `${src}-${JSON.stringify(options)}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      // In a real app, this would use a service like Cloudinary or ImageKit
      // For now, we'll return the original src with query parameters
      const params = new URLSearchParams()
      
      if (options.width) params.append('w', options.width.toString())
      if (options.height) params.append('h', options.height.toString())
      if (options.quality) params.append('q', options.quality.toString())
      if (options.format) params.append('f', options.format)
      
      const optimizedSrc = params.toString() ? `${src}?${params.toString()}` : src
      
      // Cache the result
      this.cache.set(cacheKey, optimizedSrc)
      
      return optimizedSrc
    } catch (error) {
      console.error('Image optimization failed:', error)
      return src
    }
  }

  // Lazy load images
  async lazyLoadImage(
    img: HTMLImageElement,
    src: string,
    placeholder?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set placeholder if provided
      if (placeholder) {
        img.src = placeholder
      }

      // Create intersection observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Load the actual image
              const actualImg = new Image()
              
              actualImg.onload = () => {
                img.src = actualImg.src
                img.classList.remove('lazy')
                observer.unobserve(img)
                resolve()
              }
              
              actualImg.onerror = () => {
                reject(new Error(`Failed to load image: ${src}`))
              }
              
              actualImg.src = src
            }
          })
        },
        { threshold: 0.1 }
      )

      observer.observe(img)
    })
  }

  // Preload critical resources
  preloadResources(resources: Array<{ href: string; as: string; type?: string }>): void {
    resources.forEach(({ href, as, type }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      if (type) link.type = type
      document.head.appendChild(link)
    })
  }

  // Prefetch non-critical resources
  prefetchResources(resources: string[]): void {
    resources.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
    })
  }

  // Optimize CSS delivery
  optimizeCSSDelivery(criticalCSS: string, nonCriticalCSS: string[]): void {
    // Inline critical CSS
    const style = document.createElement('style')
    style.textContent = criticalCSS
    document.head.appendChild(style)

    // Load non-critical CSS asynchronously
    nonCriticalCSS.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.media = 'print'
      link.onload = () => {
        link.media = 'all'
      }
      document.head.appendChild(link)
    })
  }

  // Implement virtual scrolling for large lists
  createVirtualScroller<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    renderItem: (item: T, index: number) => HTMLElement
  ): {
    container: HTMLElement
    updateItems: (newItems: T[]) => void
  } {
    const container = document.createElement('div')
    container.style.height = `${containerHeight}px`
    container.style.overflow = 'auto'
    container.style.position = 'relative'

    const totalHeight = items.length * itemHeight
    const content = document.createElement('div')
    content.style.height = `${totalHeight}px`
    content.style.position = 'relative'

    let currentItems = items
    let scrollTop = 0

    const updateVisibleItems = () => {
      const startIndex = Math.floor(scrollTop / itemHeight)
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        currentItems.length
      )

      // Clear existing items
      content.innerHTML = ''

      // Render only visible items
      for (let i = startIndex; i < endIndex; i++) {
        const item = currentItems[i]
        const itemElement = renderItem(item, i)
        itemElement.style.position = 'absolute'
        itemElement.style.top = `${i * itemHeight}px`
        itemElement.style.height = `${itemHeight}px`
        itemElement.style.width = '100%'
        content.appendChild(itemElement)
      }
    }

    container.addEventListener('scroll', () => {
      scrollTop = container.scrollTop
      updateVisibleItems()
    })

    container.appendChild(content)
    updateVisibleItems()

    return {
      container,
      updateItems: (newItems: T[]) => {
        currentItems = newItems
        const newTotalHeight = newItems.length * itemHeight
        content.style.height = `${newTotalHeight}px`
        updateVisibleItems()
      }
    }
  }

  // Implement debounced function calls
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Implement throttled function calls
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Optimize bundle loading
  async loadBundle(bundlePath: string): Promise<any> {
    if (this.cache.has(bundlePath)) {
      return this.cache.get(bundlePath)
    }

    try {
      // Dynamic import for code splitting
      const module = await import(/* webpackChunkName: "[request]" */ bundlePath)
      this.cache.set(bundlePath, module)
      return module
    } catch (error) {
      console.error('Bundle loading failed:', error)
      throw error
    }
  }

  // Implement service worker caching strategies
  async setupServiceWorkerCaching(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)
        
        // Set up cache strategies
        await this.setupCacheStrategies()
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  private async setupCacheStrategies(): Promise<void> {
    // This would be implemented in the service worker
    // For now, we'll just log the setup
    console.log('Setting up cache strategies...')
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => any): any {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    console.log(`${name} took ${(end - start).toFixed(2)}ms`)
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(end - start)
      })
    }
    
    return result
  }

  // Memory management
  cleanupMemory(): void {
    // Clear caches
    this.cache.clear()
    this.imageCache.clear()
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    console.log('Memory cleanup completed')
  }

  // Get performance metrics
  getPerformanceMetrics(): {
    loadTime: number
    domContentLoaded: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
  } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = performance.getEntriesByType('paint')
    const layoutShiftEntries = performance.getEntriesByType('layout-shift')
    
    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : 0,
      firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0, // Would need to observe LCP
      cumulativeLayoutShift: layoutShiftEntries.reduce((sum, entry) => sum + (entry as any).value, 0)
    }
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance()

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) =>
  performanceOptimizer.debounce(func, wait)

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) =>
  performanceOptimizer.throttle(func, limit)

export const measurePerformance = (name: string, fn: () => any) =>
  performanceOptimizer.measurePerformance(name, fn)

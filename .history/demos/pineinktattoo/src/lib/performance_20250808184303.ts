// Performance monitoring utilities
export interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  ttfb: number
  fcp: number
  loadTime: number
  memoryUsage: number
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initObservers()
  }

  private initObservers() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        this.metrics.lcp = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const perfEntry = entry as any;
          this.metrics.fid = (perfEntry.processingStart || 0) - entry.startTime
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)

      // CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          const perfEntry = entry as any;
          if (!perfEntry.hadRecentInput) {
            clsValue += perfEntry.value || 0
          }
        }
        this.metrics.cls = clsValue
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)
    }

    // Navigation timing
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart
        this.metrics.fcp = navigation.domContentLoadedEventEnd - navigation.fetchStart
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart
      }
    }

    // Memory usage
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  getScore(): { lcp: string; fid: string; cls: string } {
    const lcpScore = this.metrics.lcp ? (this.metrics.lcp < 2500 ? 'good' : this.metrics.lcp < 4000 ? 'needs-improvement' : 'poor') : 'unknown'
    const fidScore = this.metrics.fid ? (this.metrics.fid < 100 ? 'good' : this.metrics.fid < 300 ? 'needs-improvement' : 'poor') : 'unknown'
    const clsScore = this.metrics.cls ? (this.metrics.cls < 0.1 ? 'good' : this.metrics.cls < 0.25 ? 'needs-improvement' : 'poor') : 'unknown'

    return { lcp: lcpScore, fid: fidScore, cls: clsScore }
  }

  logMetrics() {
    console.group('🚀 Performance Metrics')
    console.log('LCP:', this.metrics.lcp?.toFixed(2), 'ms')
    console.log('FID:', this.metrics.fid?.toFixed(2), 'ms')
    console.log('CLS:', this.metrics.cls?.toFixed(3))
    console.log('TTFB:', this.metrics.ttfb?.toFixed(2), 'ms')
    console.log('Load Time:', this.metrics.loadTime?.toFixed(2), 'ms')
    console.log('Memory Usage:', this.metrics.memoryUsage?.toFixed(2), 'MB')
    console.groupEnd()
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
  }
}

// Image optimization utilities
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export function preloadCriticalImages(images: string[]): Promise<void[]> {
  return Promise.all(images.map(preloadImage))
}

// Animation performance utilities
export function isReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function shouldUseReducedAnimations(): boolean {
  return isReducedMotion() || navigator.connection?.effectiveType === 'slow-2g'
}

// Network utilities
export function getConnectionInfo() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    }
  }
  return null
}

// Cache utilities
export function clearImageCache(): void {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('image')) {
          caches.delete(name)
        }
      })
    })
  }
}

// Performance budget utilities
export const PERFORMANCE_BUDGET = {
  lcp: 2500, // 2.5 seconds
  fid: 100,   // 100 milliseconds
  cls: 0.1,   // 0.1
  bundleSize: 200, // 200KB gzipped
  imageSize: 500,   // 500KB total
}

export function checkPerformanceBudget(metrics: Partial<PerformanceMetrics>): {
  passed: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (metrics.lcp && metrics.lcp > PERFORMANCE_BUDGET.lcp) {
    issues.push(`LCP (${metrics.lcp.toFixed(0)}ms) exceeds budget (${PERFORMANCE_BUDGET.lcp}ms)`)
  }

  if (metrics.fid && metrics.fid > PERFORMANCE_BUDGET.fid) {
    issues.push(`FID (${metrics.fid.toFixed(0)}ms) exceeds budget (${PERFORMANCE_BUDGET.fid}ms)`)
  }

  if (metrics.cls && metrics.cls > PERFORMANCE_BUDGET.cls) {
    issues.push(`CLS (${metrics.cls.toFixed(3)}) exceeds budget (${PERFORMANCE_BUDGET.cls})`)
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}

// Initialize performance monitoring
let performanceMonitor: PerformanceMonitor | null = null

export function initPerformanceMonitoring(): PerformanceMonitor {
  if (typeof window !== 'undefined' && !performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor!
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return performanceMonitor
}

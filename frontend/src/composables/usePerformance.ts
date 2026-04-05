/**
 * 性能监控和优化工具
 */

import { ref, onUnmounted } from 'vue'

/**
 * 性能指标收集
 */
export function usePerformanceMonitor() {
  const metrics = ref({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    tti: 0
  })
  
  const collectMetrics = (): (() => void) | undefined => {
    if (typeof window === 'undefined' || !('performance' in window)) return undefined
    
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcpEntry) {
      metrics.value.fcp = fcpEntry.startTime
    }
    
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.value.lcp = lastEntry.startTime
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
        
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            metrics.value.fid = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ type: 'first-input', buffered: true })
        
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          metrics.value.cls = clsValue
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })
        
        return () => {
          lcpObserver.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
        }
      } catch {
        console.warn('PerformanceObserver not supported')
      }
    }
    
    metrics.value.tti = performance.now()
  }
  
  return { metrics, collectMetrics }
}

/**
 * 图片懒加载
 */
export function useLazyLoad() {
  let observer: IntersectionObserver | null = null
  
  const observe = (el: HTMLImageElement) => {
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              if (img.dataset.src) {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
              }
              observer?.unobserve(img)
            }
          })
        },
        { rootMargin: '50px 0px', threshold: 0.01 }
      )
    }
    observer.observe(el)
  }
  
  const disconnect = () => {
    observer?.disconnect()
    observer = null
  }
  
  onUnmounted(disconnect)
  
  return { observe, disconnect }
}

/**
 * 防抖
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * 节流
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

/**
 * RAF 节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      fn.apply(this, args)
      rafId = null
    })
  }
}

/**
 * 组件可见性检测
 */
export function useVisibility(callback?: (isVisible: boolean) => void) {
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null
  
  const observe = (el: HTMLElement) => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.value = entry.isIntersecting
          callback?.(entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
  }
  
  const unobserve = () => {
    observer?.disconnect()
    observer = null
  }
  
  onUnmounted(unobserve)
  
  return { isVisible, observe, unobserve }
}

/**
 * 预加载资源
 */
export function usePreload() {
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }
  
  const preloadImages = async (srcs: string[]): Promise<void[]> => {
    return Promise.all(srcs.map(preloadImage))
  }
  
  const preloadLink = (href: string, as: string = 'fetch') => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
  
  return { preloadImage, preloadImages, preloadLink }
}

/**
 * 内存缓存
 */
export function useMemoryCache<T>() {
  const cache = new Map<string, { data: T; timestamp: number }>()
  const maxAge = 5 * 60 * 1000
  
  const get = (key: string): T | null => {
    const item = cache.get(key)
    if (!item) return null
    if (Date.now() - item.timestamp > maxAge) {
      cache.delete(key)
      return null
    }
    return item.data
  }
  
  const set = (key: string, data: T) => {
    cache.set(key, { data, timestamp: Date.now() })
  }
  
  const clear = () => cache.clear()
  
  return { get, set, clear }
}
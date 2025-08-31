/**
 * Performance monitoring utilities
 */

// Debounce function for search inputs and API calls
export function debounce(fn, delay = 300) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// Throttle function for scroll events
export function throttle(fn, limit = 100) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy loading observer for images
export function createLazyImageObserver(callback) {
  if (!window.IntersectionObserver) {
    // Fallback for older browsers
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    }
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target)
      }
    })
  }, {
    rootMargin: '50px'
  })
}

// Memory leak prevention
export function cleanupEventListeners(element, events) {
  events.forEach(({ event, handler }) => {
    element.removeEventListener(event, handler)
  })
}

// Component performance monitoring
export function measureComponentRender(componentName) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now()
    return {
      end: () => {
        const endTime = performance.now()
        console.log(`${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`)
      }
    }
  }
  return { end: () => {} }
}

// Virtual scrolling helper for large lists
export function createVirtualScrolling(containerHeight, itemHeight, buffer = 5) {
  return {
    getVisibleRange(scrollTop, totalItems) {
      const visibleItems = Math.ceil(containerHeight / itemHeight)
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
      const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + buffer * 2)
      
      return {
        startIndex,
        endIndex,
        offsetY: startIndex * itemHeight
      }
    }
  }
}

// Memoization helper for expensive computations
export function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  
  return function (...args) {
    const key = keyFn(...args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn.apply(this, args)
    cache.set(key, result)
    
    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }
}

// Bundle size analyzer helper
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle Analysis:')
    console.log('- Enable production build to see actual bundle sizes')
    console.log('- Run "npm run build" to generate optimized bundles')
  }
}
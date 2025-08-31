/**
 * Performance optimization mixin for Vue components
 */
import { debounce, throttle, measureComponentRender } from '../utils/performance'

export const performanceMixin = {
  data() {
    return {
      isVisible: true,
      renderTimer: null
    }
  },

  created() {
    // Measure component render time in development
    this.renderTimer = measureComponentRender(this.$options.name || 'Component')
  },

  mounted() {
    this.renderTimer?.end()
    
    // Set up intersection observer for visibility optimization
    if (this.$el && window.IntersectionObserver) {
      this.visibilityObserver = new IntersectionObserver((entries) => {
        this.isVisible = entries[0].isIntersecting
      }, { threshold: 0.1 })
      
      this.visibilityObserver.observe(this.$el)
    }
  },

  beforeUnmount() {
    // Cleanup to prevent memory leaks
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect()
    }
    
    // Clear any pending timers
    if (this._timers) {
      this._timers.forEach(timer => clearTimeout(timer))
    }
  },

  methods: {
    // Debounced method creator
    createDebouncedMethod(method, delay = 300) {
      if (!this._debouncedMethods) {
        this._debouncedMethods = new Map()
      }
      
      if (!this._debouncedMethods.has(method)) {
        this._debouncedMethods.set(method, debounce(method, delay))
      }
      
      return this._debouncedMethods.get(method)
    },

    // Throttled method creator
    createThrottledMethod(method, limit = 100) {
      if (!this._throttledMethods) {
        this._throttledMethods = new Map()
      }
      
      if (!this._throttledMethods.has(method)) {
        this._throttledMethods.set(method, throttle(method, limit))
      }
      
      return this._throttledMethods.get(method)
    },

    // Safe timer creation (auto-cleanup)
    createTimer(callback, delay) {
      if (!this._timers) {
        this._timers = []
      }
      
      const timer = setTimeout(() => {
        callback()
        // Remove from tracking
        const index = this._timers.indexOf(timer)
        if (index > -1) {
          this._timers.splice(index, 1)
        }
      }, delay)
      
      this._timers.push(timer)
      return timer
    },

    // Batch DOM updates
    batchUpdate(updates) {
      return this.$nextTick(() => {
        updates.forEach(update => update())
      })
    }
  }
}

export const listPerformanceMixin = {
  mixins: [performanceMixin],
  
  data() {
    return {
      visibleItems: [],
      virtualScrolling: {
        itemHeight: 60,
        containerHeight: 400,
        scrollTop: 0,
        buffer: 5
      }
    }
  },

  computed: {
    // Virtualized list computation
    virtualizedItems() {
      if (!this.items?.length) return []
      
      const { scrollTop, itemHeight, containerHeight, buffer } = this.virtualScrolling
      const visibleCount = Math.ceil(containerHeight / itemHeight)
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
      const endIndex = Math.min(this.items.length - 1, startIndex + visibleCount + buffer * 2)
      
      return {
        items: this.items.slice(startIndex, endIndex + 1),
        startIndex,
        endIndex,
        offsetY: startIndex * itemHeight,
        totalHeight: this.items.length * itemHeight
      }
    }
  },

  methods: {
    // Handle virtual scroll
    handleVirtualScroll(event) {
      this.virtualScrolling.scrollTop = event.target.scrollTop
    },

    // Update virtual scroll container height
    updateContainerHeight(height) {
      this.virtualScrolling.containerHeight = height
    }
  }
}

export default performanceMixin
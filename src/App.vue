<template>
  <div id="app">
    <!-- Debug info in development -->
    <div v-if="$route.query.debug" class="debug-info" style="position: fixed; top: 0; right: 0; background: red; color: white; padding: 10px; z-index: 9999; font-size: 12px;">
      Auth: {{ authStore.isAuthenticated }}<br>
      Route: {{ $route.path }}<br>
      Token: {{ authStore.token ? 'Present' : 'None' }}<br>
      User: {{ authStore.user ? 'Present' : 'None' }}<br>
      ShowAuth: {{ isAuthenticated }}<br>
      Initialized: {{ authInitialized }}
    </div>
    
    <!-- Loading state during auth initialization -->
    <div v-if="!authInitialized" class="auth-loading">
      <div class="loading-spinner">
        <i class="fas fa-heart-pulse"></i>
        <p>Initializing DASYIN CRM...</p>
      </div>
    </div>
    
    <!-- Show full layout only when authenticated -->
    <div v-else-if="isAuthenticated" class="app-container">
      <!-- Mobile overlay when sidebar is open -->
      <div 
        v-if="sidebarOpen && isMobile"
        class="sidebar-overlay"
        @click="sidebarOpen = false"
      ></div>
      
      <!-- Sidebar Component (only show when authenticated) -->
      <Sidebar 
        :is-open="sidebarOpen"
        :current-page="currentPage"
        @toggle="toggleSidebar"
        @navigate="setCurrentPage"
      />

      <!-- Main Content -->
      <main class="main-content" :class="{ 'expanded': !sidebarOpen }">
        <!-- Header Component -->
        <Header 
          :page-title="pageTitle"
          :sidebar-open="sidebarOpen"
          @toggle-sidebar="toggleSidebar"
        />

        <!-- Router View for different pages -->
        <div class="content">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Show only router view when not authenticated (Login page) -->
    <div v-else class="auth-container">
      <router-view />
    </div>

    <!-- Global Modal Component -->
    <ModalNotification
      v-if="modalStore.currentModal"
      :show="!!modalStore.currentModal"
      :type="modalStore.currentModal.type"
      :title="modalStore.currentModal.title"
      :message="modalStore.currentModal.message"
      :confirm-text="modalStore.currentModal.confirmText"
      :cancel-text="modalStore.currentModal.cancelText"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
      @close="handleModalClose"
    />

    <!-- Inactivity Warning Component -->
    <InactivityWarning />
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import ModalNotification from './components/ModalNotification.vue'
import InactivityWarning from './components/InactivityWarning.vue'
import { useAuthStore } from './stores/auth'
import { useModalStore } from './stores/modal'

export default {
  name: 'App',
  components: {
    Sidebar,
    Header,
    ModalNotification,
    InactivityWarning
  },
  data() {
    return {
      currentPage: 'dashboard',
      sidebarOpen: true,
      authInitialized: false,
      windowWidth: window.innerWidth
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    modalStore() {
      return useModalStore()
    },
    isAuthenticated() {
      // Show authenticated layout when user is authenticated and not on login or landing page
      return this.authStore.isAuthenticated && this.$route.path !== '/login' && this.$route.path !== '/landing'
    },
    pageTitle() {
      const titles = {
        dashboard: 'Dashboard',
        participants: 'Participants',
        staff: 'Staff Management',
        scheduling: 'Shift Scheduling',
        'care-plans': 'Care Plans Management',
        careplans: 'Care Plans Management',
        documents: 'Document Management',
        billing: 'Billing & Invoicing',
        reports: 'Reports & Analytics',
        settings: 'Settings',
        superadmin: 'Super Admin - Organizations',
        database: 'Database Management'
      }
      return titles[this.currentPage] || 'Dashboard'
    },
    isMobile() {
      return this.windowWidth <= 1024
    }
  },
  methods: {
    toggleSidebar() {
      // Immediately respond to avoid double-click issues
      this.sidebarOpen = !this.sidebarOpen
    },
    async setCurrentPage(page) {
      try {
        // Prevent duplicate navigation to same route
        if (this.$route.path === `/${page}`) {
          console.log('Already on page:', page)
          return
        }
        
        console.log('Navigating to page:', page)
        this.currentPage = page
        
        await this.$router.push(`/${page}`)
        
        if (this.isMobile) {
          this.sidebarOpen = false
        }
      } catch (error) {
        // Handle navigation errors gracefully (like duplicate navigation)
        if (error.name !== 'NavigationDuplicated') {
          console.error('Navigation error:', error)
        }
      }
    },
    handleModalConfirm() {
      this.modalStore.closeModal(true)
    },
    handleModalCancel() {
      this.modalStore.closeModal(false)
    },
    handleModalClose() {
      this.modalStore.closeModal(null)
    },

    // Handle user activity to reset inactivity timer
    handleUserActivity() {
      if (this.authStore.isAuthenticated) {
        this.authStore.resetInactivityTimer()
      }
    },

    // Throttled version of handleUserActivity to avoid excessive calls
    throttledActivityHandler: null,

    // Throttle utility function
    throttle(func, delay) {
      let timeoutId
      let lastExecTime = 0
      return function (...args) {
        const currentTime = Date.now()
        
        if (currentTime - lastExecTime > delay) {
          func.apply(this, args)
          lastExecTime = currentTime
        } else {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            func.apply(this, args)
            lastExecTime = Date.now()
          }, delay - (currentTime - lastExecTime))
        }
      }
    }
  },
  watch: {
    // Update current page based on route
    '$route'(to) {
      const routeName = to.name?.toLowerCase() || 'dashboard'
      this.currentPage = routeName
    }
  },
  async mounted() {
    // Initialize authentication first
    try {
      console.log('🔄 App mounted: Initializing authentication...')
      await this.authStore.initializeAuth()
      this.authInitialized = true
      console.log('✅ Authentication initialized:', this.authStore.isAuthenticated)
    } catch (error) {
      console.error('❌ Authentication initialization failed:', error)
      this.authInitialized = true // Still mark as initialized to avoid infinite loading
    }
    
    // Set initial page based on current route
    const routeName = this.$route.name?.toLowerCase() || 'dashboard'
    this.currentPage = routeName

    // Handle root path redirects
    if (this.$route.path === '/') {
      const lastRoute = localStorage.getItem('lastRoute')
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedToken && lastRoute) {
        console.log('🔄 App mounted: Restoring last route:', lastRoute)
        this.$router.push(lastRoute)
      } else if (storedToken) {
        // Set default landing page based on user role
        if (this.authStore.user?.role === 'support_coordinator') {
          this.$router.push('/care-plans')
        } else if (this.authStore.user?.role === 'care_worker') {
          this.$router.push('/scheduling')
        } else {
          this.$router.push('/dashboard')
        }
      } else {
        this.$router.push('/login')
      }
      return
    }

    console.log('🚀 App mounted on route:', this.$route.path)

    // Set up throttled activity handler for performance
    this.throttledActivityHandler = this.throttle(this.handleUserActivity, 1000)
    
    // Add event listeners for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      document.addEventListener(event, this.throttledActivityHandler, true)
    })

    const handleResize = () => {
      this.windowWidth = window.innerWidth
      if (window.innerWidth <= 1024) {
        this.sidebarOpen = false
      } else {
        this.sidebarOpen = true
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
  },

  beforeUnmount() {
    // Clean up event listeners
    if (this.throttledActivityHandler) {
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      activityEvents.forEach(event => {
        document.removeEventListener(event, this.throttledActivityHandler, true)
      })
    }
    
    // Clear any inactivity timers
    if (this.authStore) {
      this.authStore.clearInactivityTimer()
    }
  }
}
</script>

<style>
/* App.vue - Minimal styles, main styles are in main.css */

.debug-info {
  position: fixed;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  padding: 10px;
  z-index: 9999;
  font-size: 12px;
  font-family: var(--font-family);
  border-radius: 0 0 0 8px;
  box-shadow: var(--shadow-medium);
}

.auth-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

.loading-spinner p {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
  font-family: var(--font-family);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}
</style>

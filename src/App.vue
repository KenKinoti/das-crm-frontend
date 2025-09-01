<template>
  <div id="app">
    <!-- Debug info in development -->
    <div v-if="$route.query.debug" class="debug-info" style="position: fixed; top: 0; right: 0; background: red; color: white; padding: 10px; z-index: 9999; font-size: 12px;">
      Auth: {{ authStore.isAuthenticated }}<br>
      Route: {{ $route.path }}<br>
      Token: {{ authStore.token ? 'Present' : 'None' }}<br>
      User: {{ authStore.user ? 'Present' : 'None' }}<br>
      ShowAuth: {{ isAuthenticated }}
    </div>
    
    <!-- Show full layout only when authenticated -->
    <div v-if="isAuthenticated" class="app-container">
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
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import ModalNotification from './components/ModalNotification.vue'
import { useAuthStore } from './stores/auth'
import { useModalStore } from './stores/modal'

export default {
  name: 'App',
  components: {
    Sidebar,
    Header,
    ModalNotification
  },
  data() {
    return {
      currentPage: 'dashboard',
      sidebarOpen: true
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
      // Show authenticated layout when user is authenticated and not on login page
      return this.authStore.isAuthenticated && this.$route.path !== '/login'
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
    }
  },
  methods: {
    toggleSidebar() {
      // Immediately respond to avoid double-click issues
      this.sidebarOpen = !this.sidebarOpen
    },
    setCurrentPage(page) {
      this.currentPage = page
      this.$router.push(`/${page}`)
      if (window.innerWidth <= 768) {
        this.sidebarOpen = false
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
        this.$router.push('/dashboard')
      } else {
        this.$router.push('/login')
      }
      return
    }

    console.log('🚀 App mounted on route:', this.$route.path)

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        this.sidebarOpen = false
      } else {
        this.sidebarOpen = true
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
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
</style>

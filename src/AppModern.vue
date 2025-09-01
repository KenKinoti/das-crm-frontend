<template>
  <div id="app" class="min-h-screen bg-secondary-50">
    <!-- Debug info in development -->
    <div v-if="$route.query.debug" class="fixed top-4 right-4 bg-danger-600 text-white p-3 rounded-xl shadow-large z-50 text-xs font-mono">
      <div>Auth: {{ authStore.isAuthenticated }}</div>
      <div>Route: {{ $route.path }}</div>
      <div>Token: {{ authStore.token ? 'Present' : 'None' }}</div>
      <div>User: {{ authStore.user ? 'Present' : 'None' }}</div>
      <div>ShowAuth: {{ isAuthenticated }}</div>
    </div>
    
    <!-- Authenticated Layout -->
    <div v-if="isAuthenticated" class="flex h-screen bg-secondary-50">
      <!-- Modern Sidebar -->
      <ModernSidebar 
        :is-open="sidebarOpen"
        :current-page="currentPage"
        @toggle="toggleSidebar"
        @navigate="setCurrentPage"
      />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden" :class="{ 'ml-0': !sidebarOpen, 'ml-64': sidebarOpen }">
        <!-- Modern Header -->
        <ModernHeader 
          :page-title="pageTitle"
          :sidebar-open="sidebarOpen"
          @toggle-sidebar="toggleSidebar"
        />

        <!-- Page Content -->
        <main class="flex-1 overflow-auto bg-white/50 backdrop-blur-sm">
          <div class="container mx-auto px-6 py-8">
            <router-view />
          </div>
        </main>
      </div>
    </div>

    <!-- Login Layout -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script>
import ModernSidebar from './components/ModernSidebar.vue'
import ModernHeader from './components/ModernHeader.vue'
import { useAuthStore } from './stores/auth'

export default {
  name: 'AppModern',
  components: {
    ModernSidebar,
    ModernHeader
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
      this.sidebarOpen = !this.sidebarOpen
    },
    setCurrentPage(page) {
      this.currentPage = page
      this.$router.push(`/${page}`)
      // Auto-close sidebar on mobile
      if (window.innerWidth <= 768) {
        this.sidebarOpen = false
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
    // Set initial page based on current route
    const routeName = this.$route.name?.toLowerCase() || 'dashboard'
    this.currentPage = routeName

    // Ensure auth is checked after page refresh
    if (this.authStore.token && !this.authStore.user) {
      try {
        await this.authStore.getCurrentUser()
      } catch (error) {
        console.error('Failed to get current user after refresh:', error)
        if (this.$route.path !== '/login') {
          this.$router.push('/login')
        }
      }
    }

    // Handle responsive sidebar
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
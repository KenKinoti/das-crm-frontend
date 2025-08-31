<template>
  <div id="app">
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
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  components: {
    Sidebar,
    Header
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
      // Don't show authenticated layout on login page
      return this.authStore.isAuthenticated && this.$route.name !== 'Login'
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

    // Only redirect if we're on the root path
    if (this.$route.path === '/') {
      if (this.authStore.isAuthenticated) {
        this.$router.push('/dashboard')
      } else {
        this.$router.push('/login')
      }
    }

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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --warning-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --danger-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  
  --primary-color: #667eea;
  --secondary-color: #f093fb;
  --success-color: #4facfe;
  --warning-color: #43e97b;
  --danger-color: #fa709a;
  
  --text-dark: #2c3e50;
  --text-medium: #5a6c7d;
  --text-light: #8492a6;
  --background: #f8fafc;
  --white: #ffffff;
  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.12);
  --border-radius: 16px;
  --border-radius-sm: 8px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #f8fafc 100%);
  background-attachment: fixed;
  color: var(--text-dark);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.auth-container {
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.2s ease;
}

.main-content.expanded {
  margin-left: 0;
}

.content {
  padding: 1rem;
}

/* Global Button Styles - Based on Scheduling Page Best Practice */
.btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.btn:not(:disabled):active {
  transform: scale(0.98);
}

/* Primary Button - Blue */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

/* Secondary Button - Gray */
.btn-secondary {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Success/Shift Buttons - Green */
.btn-success, .btn-shift {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-success:hover:not(:disabled), .btn-shift:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

/* Danger/Delete/Cancel Buttons - Red */
.btn-danger, .btn-delete, .btn-cancel {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.btn-danger:hover:not(:disabled), .btn-delete:hover:not(:disabled), .btn-cancel:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

/* View Buttons - White as requested */
.btn-view, .btn-white {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-view:hover:not(:disabled), .btn-white:hover:not(:disabled) {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Warning Buttons - Yellow/Orange */
.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
}

/* Info Buttons - Blue */
.btn-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-info:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

/* Edit Button - Blue */
.btn-edit {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-edit:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

/* Outline Buttons */
.btn-outline {
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

/* Button Sizes */
.btn-small {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  min-width: 90px;
}

.btn-mini {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-mini:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Action Button Status Colors */
.btn-start {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-start:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-complete {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-complete:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

/* Elegant Outline Button */
.btn-outline-elegant {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid rgba(0, 0, 0, 0.08);
  color: #4a5568;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.btn-outline-elegant:hover {
  border-color: #667eea;
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(102, 126, 234, 0.04) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .content {
    padding: 1rem;
  }
}
</style>

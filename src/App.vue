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
      return this.authStore.isAuthenticated
    },
    pageTitle() {
      const titles = {
        dashboard: 'Dashboard',
        participants: 'Participants',
        staff: 'Staff Management',
        scheduling: 'Shift Scheduling',
        documents: 'Document Management',
        billing: 'Billing & Invoicing',
        reports: 'Reports & Analytics',
        settings: 'Settings'
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
  mounted() {
    // Set initial page based on current route
    const routeName = this.$route.name?.toLowerCase() || 'dashboard'
    this.currentPage = routeName

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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--background);
  color: var(--text-dark);
  line-height: 1.6;
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
  margin-left: 280px;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: 0;
}

.content {
  padding: 2rem;
}

/* Button Styles */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
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

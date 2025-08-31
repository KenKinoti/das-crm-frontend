<template>
  <nav class="sidebar" :class="{ 'collapsed': !isOpen, 'open': isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="fas fa-heart-pulse"></i>
        </div>
        <span class="logo-text">DASYIN PRO</span>
      </div>
    </div>
    
    <div class="nav-menu">
      <div v-if="visibleNavigation.includes('dashboard')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'dashboard' }" @click="navigate('dashboard')">
          <i class="fas fa-chart-line nav-icon"></i>
          Dashboard
        </a>
      </div>
      <div v-if="visibleNavigation.includes('participants')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'participants' }" @click="navigate('participants')">
          <i class="fas fa-users nav-icon"></i>
          Participants
        </a>
      </div>
      <div v-if="visibleNavigation.includes('staff')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'staff' }" @click="navigate('staff')">
          <i class="fas fa-user-nurse nav-icon"></i>
          Staff
        </a>
      </div>
      <div v-if="visibleNavigation.includes('scheduling')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'scheduling' }" @click="navigate('scheduling')">
          <i class="fas fa-calendar-alt nav-icon"></i>
          Scheduling
        </a>
      </div>
      <div v-if="visibleNavigation.includes('care-plans')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'care-plans' || currentPage === 'careplans' }" @click="navigate('care-plans')">
          <i class="fas fa-clipboard-list nav-icon"></i>
          Care Plans
        </a>
      </div>
      <div v-if="visibleNavigation.includes('documents')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'documents' }" @click="navigate('documents')">
          <i class="fas fa-file-medical nav-icon"></i>
          Documents
        </a>
      </div>
      <div v-if="visibleNavigation.includes('billing')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'billing' }" @click="navigate('billing')">
          <i class="fas fa-dollar-sign nav-icon"></i>
          Billing
        </a>
      </div>
      <div v-if="visibleNavigation.includes('reports')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'reports' }" @click="navigate('reports')">
          <i class="fas fa-chart-bar nav-icon"></i>
          Reports
        </a>
      </div>
      <div v-if="visibleNavigation.includes('settings')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'settings' }" @click="navigate('settings')">
          <i class="fas fa-cog nav-icon"></i>
          Settings
        </a>
      </div>
      
      <!-- Super Admin Section -->
      <div v-if="visibleNavigation.includes('superadmin')" class="nav-section">
        <div class="nav-divider"></div>
        <div class="nav-section-title">Super Admin</div>
        <div class="nav-item">
          <a href="#" class="nav-link" :class="{ active: currentPage === 'superadmin' }" @click="navigate('superadmin')">
            <i class="fas fa-crown nav-icon"></i>
            Organizations
          </a>
        </div>
        <div class="nav-item">
          <a href="#" class="nav-link" :class="{ active: currentPage === 'database' }" @click="navigate('database')">
            <i class="fas fa-database nav-icon"></i>
            Database Management
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { usePermissionsStore } from '../stores/permissions'

export default {
  name: 'Sidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: true
    },
    currentPage: {
      type: String,
      default: 'dashboard'
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    permissionsStore() {
      return usePermissionsStore()
    },
    isSuperAdmin() {
      return this.authStore.isSuperAdmin
    },
    visibleNavigation() {
      // Ensure we always return an array even if permissions store isn't ready
      const navigation = this.permissionsStore.visibleNavigation
      return Array.isArray(navigation) ? navigation : []
    }
  },
  methods: {
    navigate(page) {
      this.$emit('navigate', page)
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.02);
  position: fixed;
  height: 100vh;
  z-index: 1000;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(241, 245, 249, 0.5);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, transparent 100%);
  position: relative;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 2rem;
  right: 2rem;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 6px 18px rgba(102, 126, 234, 0.25), inset 0 1px 2px rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4), inset 0 1px 2px rgba(255,255,255,0.3);
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

.nav-menu {
  padding: 1rem 0;
  overflow-y: auto;
  flex: 1;
}

.nav-item {
  margin: 3px 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: rgba(107, 114, 128, 0.8);
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.6s;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(102, 126, 234, 0.06) 100%);
  color: #667eea;
  transform: translateX(8px) scale(1.02);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3), inset 0 1px 2px rgba(255,255,255,0.2);
  transform: translateX(8px) scale(1.05);
}

.nav-link.active::before {
  display: none;
}

.nav-icon {
  width: 24px;
  text-align: center;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-link.active .nav-icon {
  transform: scale(1.15);
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.nav-section {
  margin-top: 1.5rem;
}

.nav-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.2) 50%, transparent 100%);
  margin: 1rem 20px;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(102, 126, 234, 0.7);
  padding: 0.5rem 20px 1rem 20px;
  margin: 0;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
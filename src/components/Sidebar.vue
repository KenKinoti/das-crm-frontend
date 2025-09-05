<template>
  <nav class="sidebar" :class="{ 'collapsed': !isOpen, 'open': isOpen }">
    <div class="sidebar-header">
      <div class="logo" @click="goToDashboard" role="button" tabindex="0" @keydown.enter="goToDashboard" @keydown.space.prevent="goToDashboard">
        <div class="logo-icon">
          <i class="fas fa-heart-pulse"></i>
        </div>
        <span class="logo-text">DASYIN CRM</span>
      </div>
    </div>
    
    <div class="nav-menu">
      <div v-if="visibleNavigation.includes('dashboard')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'dashboard' }" @click.prevent="navigate('dashboard')">
          <i class="fas fa-chart-line nav-icon"></i>
          Dashboard
        </a>
      </div>
      <div v-if="visibleNavigation.includes('participants')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'participants' }" @click.prevent="navigate('participants')">
          <i class="fas fa-users nav-icon"></i>
          Participants
        </a>
      </div>
      <div v-if="visibleNavigation.includes('staff')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'staff' }" @click.prevent="navigate('staff')">
          <i class="fas fa-user-nurse nav-icon"></i>
          Staff
        </a>
      </div>
      <div v-if="visibleNavigation.includes('scheduling')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'scheduling' }" @click.prevent="navigate('scheduling')">
          <i class="fas fa-calendar-alt nav-icon"></i>
          Scheduling
        </a>
      </div>
      <div v-if="visibleNavigation.includes('care-plans')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'care-plans' || currentPage === 'careplans' }" @click.prevent="navigate('care-plans')">
          <i class="fas fa-clipboard-list nav-icon"></i>
          Care Plans
        </a>
      </div>
      <div v-if="visibleNavigation.includes('documents')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'documents' }" @click.prevent="navigate('documents')">
          <i class="fas fa-file-medical nav-icon"></i>
          Documents
        </a>
      </div>
      <div v-if="visibleNavigation.includes('billing')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'billing' }" @click.prevent="navigate('billing')">
          <i class="fas fa-dollar-sign nav-icon"></i>
          Billing
        </a>
      </div>
      <div v-if="visibleNavigation.includes('reports')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'reports' }" @click.prevent="navigate('reports')">
          <i class="fas fa-chart-bar nav-icon"></i>
          Reports
        </a>
      </div>
      <div v-if="visibleNavigation.includes('settings')" class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'settings' }" @click.prevent="navigate('settings')">
          <i class="fas fa-cog nav-icon"></i>
          Settings
        </a>
      </div>
      
      <!-- Super Admin Section -->
      <div v-if="visibleNavigation.includes('superadmin')" class="nav-section">
        <div class="nav-divider"></div>
        <div class="nav-section-title">Super Admin</div>
        <div class="nav-item">
          <a href="#" class="nav-link" :class="{ active: currentPage === 'superadmin' }" @click.prevent="navigate('superadmin')">
            <i class="fas fa-crown nav-icon"></i>
            Organizations
          </a>
        </div>
        <div class="nav-item">
          <a href="#" class="nav-link" :class="{ active: currentPage === 'database' }" @click.prevent="navigate('database')">
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
    },
    goToDashboard() {
      this.$emit('navigate', 'dashboard')
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--card-background);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255,255,255,0.2);
  box-shadow: var(--shadow-medium);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: var(--transition-smooth);
  overflow-y: auto;
  font-family: var(--font-family);
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 0 var(--spacing-md);
  height: 70px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(102, 126, 234, 0.02);
  position: relative;
  display: flex;
  align-items: center;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient);
  border-radius: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: var(--transition-smooth);
  padding: 8px;
  border-radius: var(--border-radius-sm);
  margin: -8px;
}

.logo:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateY(-1px);
}

.logo:active {
  transform: translateY(0);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-gradient);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-white);
  font-size: 1.5rem;
  box-shadow: var(--shadow-soft);
  transition: var(--transition-bounce);
}

.logo-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--shadow-strong);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--font-family);
  letter-spacing: -0.02em;
}

.nav-menu {
  padding: var(--spacing-lg) 0;
  overflow-y: auto;
  flex: 1;
  margin-top: 0;
}

.nav-item {
  margin: 0 var(--spacing-md) var(--spacing-xs) var(--spacing-md);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.875rem var(--spacing-lg);
  text-decoration: none;
  color: var(--text-medium);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-smooth);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.25rem;
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
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
  transform: translateX(4px);
  box-shadow: var(--shadow-soft);
}

.nav-link.active {
  background: var(--primary-gradient);
  color: var(--text-white);
  box-shadow: var(--shadow-medium);
  transform: translateX(4px);
}

.nav-link.active::before {
  display: none;
}

.nav-icon {
  width: 18px;
  text-align: center;
  font-size: 1rem;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-link.active .nav-icon {
  transform: scale(1.1);
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.nav-section {
  margin-top: var(--spacing-xxl);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-left: var(--spacing-md);
  margin-right: var(--spacing-md);
}

.nav-divider {
  display: none;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--primary-color);
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-sm) var(--spacing-lg);
  margin: 0;
  font-family: var(--font-family);
  opacity: 0.9;
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 1001;
    box-shadow: var(--shadow-strong);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 280px;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
    padding: var(--spacing-md);
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
}
</style>
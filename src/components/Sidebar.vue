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
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'dashboard' }" @click="navigate('dashboard')">
          <i class="fas fa-chart-line nav-icon"></i>
          Dashboard
        </a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'participants' }" @click="navigate('participants')">
          <i class="fas fa-users nav-icon"></i>
          Participants
        </a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'staff' }" @click="navigate('staff')">
          <i class="fas fa-user-nurse nav-icon"></i>
          Staff
        </a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'scheduling' }" @click="navigate('scheduling')">
          <i class="fas fa-calendar-alt nav-icon"></i>
          Scheduling
        </a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'documents' }" @click="navigate('documents')">
          <i class="fas fa-file-medical nav-icon"></i>
          Documents
        </a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'billing' }" @click="navigate('billing')">
          <i class="fas fa-dollar-sign nav-icon"></i>
          Billing
        </a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'reports' }" @click="navigate('reports')">
          <i class="fas fa-chart-bar nav-icon"></i>
          Reports
        </a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link" :class="{ active: currentPage === 'settings' }" @click="navigate('settings')">
          <i class="fas fa-cog nav-icon"></i>
          Settings
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
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
  methods: {
    navigate(page) {
      this.$emit('navigate', page)
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: var(--white);
  box-shadow: var(--shadow-soft);
  position: fixed;
  height: 100vh;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  padding: 1rem 0;
}

.nav-item {
  margin: 4px 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-medium);
  border-radius: var(--border-radius-sm);
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
  transform: translateX(4px);
}

.nav-link.active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-soft);
}

.nav-icon {
  width: 20px;
  text-align: center;
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
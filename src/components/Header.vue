<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-toggle" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="header-right">
      <div class="search-box">
        <input type="text" class="search-input" placeholder="Search participants, staff, or documents...">
        <i class="fas fa-search search-icon"></i>
      </div>
      
      <div class="user-menu" @click="toggleUserDropdown">
        <div class="user-avatar">{{ userInitials }}</div>
        <span>{{ userName }}</span>
        <i class="fas fa-chevron-down"></i>
        
        <!-- User Dropdown -->
        <div v-if="showUserDropdown" class="user-dropdown">
          <div class="dropdown-item">
            <i class="fas fa-user"></i>
            Profile
          </div>
          <div class="dropdown-item">
            <i class="fas fa-cog"></i>
            Settings
          </div>
          <hr class="dropdown-divider">
          <div class="dropdown-item logout" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Header',
  props: {
    pageTitle: {
      type: String,
      default: 'Dashboard'
    },
    sidebarOpen: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showUserDropdown: false
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    userName() {
      return this.authStore.userName || 'User'
    },
    userInitials() {
      if (this.authStore.user) {
        return (this.authStore.user.first_name?.[0] || '') + (this.authStore.user.last_name?.[0] || '')
      }
      return 'U'
    }
  },
  methods: {
    toggleUserDropdown() {
      this.showUserDropdown = !this.showUserDropdown
    },
    async handleLogout() {
      try {
        await this.authStore.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showUserDropdown = false
      }
    })
  }
}
</script>

<style scoped>
.header {
  background: var(--white);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-medium);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--border-radius-sm);
  transition: all 0.3s ease;
}

.menu-toggle:hover {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-dark);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 12px 40px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  width: 300px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.user-menu:hover {
  background: rgba(102, 126, 234, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--white);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-medium);
  min-width: 180px;
  z-index: 1000;
  margin-top: 8px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-dark);
  cursor: pointer;
  transition: background 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.dropdown-item.logout {
  color: var(--danger-color);
}

.dropdown-item.logout:hover {
  background: rgba(250, 112, 154, 0.1);
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .search-input {
    width: 200px;
  }

  .header {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .search-box {
    display: none;
  }
}
</style>

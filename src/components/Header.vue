<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-toggle" @click.stop="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="header-right">
      <div class="search-box">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search participants, staff, or documents..."
          v-model="searchQuery"
          @input="handleSearch"
          @keyup.enter="performSearch"
          @focus="showSearchResults = true"
          @blur="hideSearchResults"
        >
        <i class="fas fa-search search-icon" @click="performSearch"></i>
        
        <!-- Search Results Dropdown -->
        <div v-if="showSearchResults && (searchResults.length > 0 || isSearching)" class="search-results">
          <div v-if="isSearching" class="search-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Searching...
          </div>
          <div v-else-if="searchResults.length === 0 && searchQuery.trim()" class="search-no-results">
            No results found for "{{ searchQuery }}"
          </div>
          <div v-else>
            <div v-for="result in searchResults" :key="`${result.type}-${result.id}`" 
                 class="search-result-item" @click="navigateToResult(result)">
              <div class="result-icon">
                <i :class="getResultIcon(result.type)"></i>
              </div>
              <div class="result-content">
                <div class="result-title">{{ result.title }}</div>
                <div class="result-subtitle">{{ result.subtitle }}</div>
              </div>
              <div class="result-type">{{ result.type }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="user-menu" @click="toggleUserDropdown">
        <div class="user-avatar">{{ userInitials }}</div>
        <span>{{ userName }}</span>
        <i class="fas fa-chevron-down"></i>
        
        <!-- User Dropdown -->
        <div v-if="showUserDropdown" class="user-dropdown">
          <div class="dropdown-item" @click="navigateToProfile">
            <i class="fas fa-user"></i>
            Profile
          </div>
          <div class="dropdown-item" @click="navigateToSettings">
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
import api from '../services/api'

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
      showUserDropdown: false,
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      isSearching: false,
      searchTimeout: null
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
    },
    
    handleSearch() {
      // Debounce search to avoid too many API calls
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        if (this.searchQuery.trim().length >= 2) {
          this.performSearch()
        } else {
          this.searchResults = []
        }
      }, 300)
    },
    
    async performSearch() {
      if (!this.searchQuery.trim()) {
        this.searchResults = []
        return
      }
      
      this.isSearching = true
      try {
        // For MVP, implement basic search across participants, staff, and documents
        const promises = [
          this.searchParticipants(),
          this.searchStaff(),
          this.searchDocuments()
        ]
        
        const results = await Promise.allSettled(promises)
        this.searchResults = results
          .filter(result => result.status === 'fulfilled')
          .flatMap(result => result.value)
          .slice(0, 8) // Limit to 8 results
        
      } catch (error) {
        console.error('Search error:', error)
        this.searchResults = []
      } finally {
        this.isSearching = false
      }
    },
    
    async searchParticipants() {
      try {
        const response = await api.get('/participants', {
          params: { search: this.searchQuery, limit: 3 }
        })
        
        if (response.success && response.data.participants) {
          return response.data.participants.map(participant => ({
            id: participant.id,
            type: 'participant',
            title: `${participant.first_name} ${participant.last_name}`,
            subtitle: participant.ndis_number || 'Participant',
            route: `/participants/${participant.id}`
          }))
        }
        return []
      } catch (error) {
        console.log('Participant search failed:', error.message)
        return []
      }
    },
    
    async searchStaff() {
      try {
        const response = await api.get('/users', {
          params: { search: this.searchQuery, limit: 3 }
        })
        
        if (response.success && response.data.users) {
          return response.data.users.map(user => ({
            id: user.id,
            type: 'staff',
            title: `${user.first_name} ${user.last_name}`,
            subtitle: user.role || 'Staff Member',
            route: `/staff/${user.id}`
          }))
        }
        return []
      } catch (error) {
        console.log('Staff search failed:', error.message)
        return []
      }
    },
    
    async searchDocuments() {
      try {
        const response = await api.get('/documents', {
          params: { search: this.searchQuery, limit: 2 }
        })
        
        if (response.success && response.data.documents) {
          return response.data.documents.map(doc => ({
            id: doc.id,
            type: 'document',
            title: doc.title || doc.original_filename,
            subtitle: doc.category || 'Document',
            route: `/documents`
          }))
        }
        return []
      } catch (error) {
        console.log('Document search failed:', error.message)
        return []
      }
    },
    
    getResultIcon(type) {
      const icons = {
        participant: 'fas fa-user',
        staff: 'fas fa-user-tie',
        document: 'fas fa-file'
      }
      return icons[type] || 'fas fa-search'
    },
    
    navigateToResult(result) {
      this.searchQuery = ''
      this.searchResults = []
      this.showSearchResults = false
      this.$router.push(result.route)
    },
    
    hideSearchResults() {
      // Add small delay to allow click events on results
      setTimeout(() => {
        this.showSearchResults = false
      }, 200)
    },
    
    navigateToProfile() {
      this.showUserDropdown = false
      this.$router.push('/profile')
    },
    
    navigateToSettings() {
      this.showUserDropdown = false
      this.$router.push('/settings')
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
  transition: all 0.15s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
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
  cursor: pointer;
  transition: color 0.3s ease;
}

.search-icon:hover {
  color: var(--primary-color);
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-medium);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid #e2e8f0;
}

.search-loading,
.search-no-results {
  padding: 1rem;
  text-align: center;
  color: var(--text-medium);
  font-size: 0.9rem;
}

.search-loading i {
  margin-right: 0.5rem;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 1px solid #f1f5f9;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: rgba(102, 126, 234, 0.1);
}

.result-icon {
  width: 32px;
  height: 32px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-icon i {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 500;
  color: var(--text-dark);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-subtitle {
  font-size: 0.8rem;
  color: var(--text-medium);
  margin-top: 2px;
}

.result-type {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: capitalize;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 12px;
  flex-shrink: 0;
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

<template>
  <div class="participants-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-users"></i>
          Participants Management
        </h1>
        <p>Manage participant profiles, enrollment, and care coordination</p>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Add New Participant
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card info">
        <div class="stat-icon info-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ participants.length }}</h3>
          <p>Total Participants</p>
        </div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-icon success-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ activeParticipants }}</h3>
          <p>Active</p>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon warning-icon">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ inactiveParticipants }}</h3>
          <p>Inactive</p>
        </div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-icon info-icon">
          <i class="fas fa-calendar-plus"></i>
        </div>
        <div class="stat-content">
          <h3>{{ newThisMonth }}</h3>
          <p>New This Month</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search participants..." 
            class="form-input"
            @input="filterParticipants"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterParticipants" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant">
            <i class="fas fa-times"></i>
            Clear Filters
          </button>
          
          <!-- View Toggle -->
          <div class="view-toggle">
            <button 
              @click="currentView = 'list'" 
              :class="['view-btn-elegant', { active: currentView === 'list' }]"
              title="List View"
            >
              <i class="fas fa-list"></i>
            </button>
            <button 
              @click="currentView = 'grid'" 
              :class="['view-btn-elegant', { active: currentView === 'grid' }]"
              title="Grid View"
            >
              <i class="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="content-card">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading participants...</p>
      </div>

      <div v-else-if="filteredParticipants.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <h3>No Participants Found</h3>
        <p>Get started by adding your first participant</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Add First Participant
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="currentView === 'grid'" class="participants-grid">
        <div v-for="participant in paginatedParticipants" :key="participant.id" class="participant-card">
          <div class="participant-header">
            <div class="participant-avatar">
              {{ getInitials(participant.first_name, participant.last_name) }}
            </div>
            <div class="participant-info">
              <h3>{{ participant.first_name }} {{ participant.last_name }}</h3>
              <p class="participant-ndis">NDIS: {{ participant.ndis_number || 'Not provided' }}</p>
            </div>
            <div class="participant-status">
              <div class="status-toggle">
                <label class="toggle-switch">
                  <input 
                    type="checkbox" 
                    :checked="participant.is_active !== false"
                    @change="toggleParticipantStatus(participant)"
                    :disabled="isSubmitting"
                  />
                  <span class="slider"></span>
                </label>
                <span :class="['status-badge', participant.is_active !== false ? 'active' : 'inactive']">
                  {{ participant.is_active !== false ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="participant-details">
            <div class="detail-row">
              <i class="fas fa-phone"></i>
              <span>{{ participant.phone || 'No phone' }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-envelope"></i>
              <span>{{ participant.email || 'No email' }}</span>
            </div>
          </div>
          
          <div class="participant-actions">
            <button @click="viewParticipant(participant)" class="action-btn view-btn" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editParticipant(participant)" class="action-btn edit-btn" title="Edit Participant">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteParticipant(participant)" class="action-btn delete-btn" title="Delete Participant">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else class="participants-list">
        <div class="list-header">
          <div class="header-cell">Name</div>
          <div class="header-cell">NDIS Number</div>
          <div class="header-cell">Contact</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>
        <div v-for="participant in paginatedParticipants" :key="participant.id" class="list-row">
          <div class="list-cell">
            <div class="participant-avatar">
              {{ getInitials(participant.first_name, participant.last_name) }}
            </div>
            <div class="participant-name">
              <span class="name">{{ participant.first_name }} {{ participant.last_name }}</span>
              <span class="email">{{ participant.email }}</span>
            </div>
          </div>
          <div class="list-cell">{{ participant.ndis_number || 'Not provided' }}</div>
          <div class="list-cell">
            <div class="contact-info">
              <div>{{ participant.phone || 'No phone' }}</div>
              <div>{{ participant.email || 'No email' }}</div>
            </div>
          </div>
          <div class="list-cell">
            <div class="status-toggle">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  :checked="participant.is_active !== false"
                  @change="toggleParticipantStatus(participant)"
                  :disabled="isSubmitting"
                />
                <span class="slider"></span>
              </label>
              <span :class="['status-badge', participant.is_active !== false ? 'active' : 'inactive']">
                {{ participant.is_active !== false ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <div class="list-cell">
            <div class="action-buttons">
              <button @click="viewParticipant(participant)" class="action-btn view-btn" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editParticipant(participant)" class="action-btn edit-btn" title="Edit Participant">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteParticipant(participant)" class="action-btn delete-btn" title="Delete Participant">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useParticipantsStore } from '../stores/participants'
import { useAuthStore } from '../stores/auth'
import { useOrganizationContextStore } from '../stores/organizationContext'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'ParticipantsView',
  data() {
    return {
      filteredParticipants: [],
      searchQuery: '',
      statusFilter: '',
      currentView: 'list',
      currentPage: 1,
      itemsPerPage: 25,
      showAddModal: false,
      isSubmitting: false
    }
  },
  computed: {
    ...mapState(useParticipantsStore, ['participants', 'isLoading', 'error']),
    ...mapState(useAuthStore, ['user']),
    ...mapState(useOrganizationContextStore, ['organizations', 'currentOrganization']),
    
    isSuperAdmin() {
      return this.user?.role === 'super_admin'
    },
    
    availableOrganizations() {
      return this.organizations || []
    },
    orgFilteredParticipants() {
      if (!this.isSuperAdmin) {
        // Non-super admins only see their org participants
        return this.participants.filter(p => p.organization_id === this.user?.organization_id)
      }
      
      if (this.currentOrganization === null) {
        // Super admin with no org selected - show ALL data
        return this.participants
      }
      
      // Super admin with specific org selected
      return this.participants.filter(p => p.organization_id === this.currentOrganization.id)
    },
    
    activeParticipants() {
      return this.orgFilteredParticipants.filter(p => p.is_active !== false).length
    },
    inactiveParticipants() {
      return this.orgFilteredParticipants.filter(p => p.is_active === false).length
    },
    newThisMonth() {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return this.orgFilteredParticipants.filter(p => {
        if (!p.created_at) return false
        const createdDate = new Date(p.created_at)
        return createdDate >= thisMonthStart
      }).length
    },
    paginatedParticipants() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredParticipants.slice(start, end)
    }
  },
  watch: {
    currentOrganization: {
      handler() {
        // Re-filter participants when organization changes
        this.filterParticipants()
      },
      immediate: false
    }
  },
  methods: {
    ...mapActions(useParticipantsStore, ['fetchParticipants', 'updateParticipant']),
    ...mapActions(useOrganizationContextStore, ['fetchOrganizations', 'setCurrentOrganization']),
    async loadParticipants() {
      try {
        await this.fetchParticipants({ limit: 1000, page: 1 })
        this.filterParticipants()
      } catch (error) {
        console.error('Error loading participants:', error)
        showErrorNotification(error, 'Failed to load participants. Please try again.')
      }
    },
    filterParticipants() {
      // Start with organization filtered participants
      let filtered = [...this.orgFilteredParticipants]
      
      // Apply search filter
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(p => {
          const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
          return fullName.includes(query) ||
                 (p.first_name && p.first_name.toLowerCase().includes(query)) ||
                 (p.last_name && p.last_name.toLowerCase().includes(query)) ||
                 (p.email && p.email.toLowerCase().includes(query)) ||
                 (p.phone && p.phone.includes(query)) ||
                 (p.ndis_number && p.ndis_number.toLowerCase().includes(query))
        })
      }
      
      // Apply status filter
      if (this.statusFilter) {
        if (this.statusFilter === 'active') {
          filtered = filtered.filter(p => p.is_active !== false)
        } else if (this.statusFilter === 'inactive') {
          filtered = filtered.filter(p => p.is_active === false)
        }
      }
      
      // Sort by last name, then first name
      filtered.sort((a, b) => {
        const lastNameComparison = (a.last_name || '').localeCompare(b.last_name || '')
        if (lastNameComparison !== 0) return lastNameComparison
        return (a.first_name || '').localeCompare(b.first_name || '')
      })
      
      this.filteredParticipants = filtered
      this.currentPage = 1
    },
    
    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
      this.filterParticipants()
    },
    getInitials(firstName, lastName) {
      return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase()
    },
    async toggleParticipantStatus(participant) {
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      try {
        const newStatus = participant.is_active === false ? true : false
        const updateData = { is_active: newStatus }
        
        console.log('Toggling participant status:', participant.id, 'from:', participant.is_active, 'to:', newStatus)
        
        await this.updateParticipant(participant.id, updateData)
        
        // Update the local participant object immediately
        participant.is_active = newStatus
        
        // Re-filter to update counts
        this.filterParticipants()
        
        const statusText = newStatus ? 'activated' : 'deactivated'
        showSuccessNotification(`Participant ${statusText} successfully!`)
      } catch (error) {
        console.error('Error toggling participant status:', error)
        showErrorNotification(error, 'Error updating participant status. Please try again.')
        // Revert the local change on error
        participant.is_active = participant.is_active === false ? true : false
      } finally {
        this.isSubmitting = false
      }
    },
    viewParticipant(participant) {
      console.log('View participant:', participant)
    },
    editParticipant(participant) {
      console.log('Edit participant:', participant)
    },
    deleteParticipant(participant) {
      console.log('Delete participant:', participant)
    }
  },
  async mounted() {
    await this.loadParticipants()
    
    // Listen for organization changes from header
    this.$root.$on('organization-changed', () => {
      this.filterParticipants()
    })
  },
  
  beforeDestroy() {
    // Clean up event listener
    this.$root.$off('organization-changed')
  }
}
</script>

<style scoped>
/* Page Container */
.participants-container {
  padding: 1.5rem;
  min-height: 100vh;
}

/* Enhanced Stats Cards with Matching Colors */
.stats-overview {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex: 1;
  min-width: 250px;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s;
}

.stat-card:hover::after {
  left: 100%;
}

.stat-card.info {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-card.success {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(16, 185, 129, 0.3);
}

.stat-card.warning {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(245, 158, 11, 0.3);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  border-radius: 16px 0 0 16px;
}

.stat-card.info::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card.success::before {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.warning::before {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-icon.info-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.stat-icon.success-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.stat-icon.warning-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  flex: 1;
  text-align: right;
}

.stat-content h3 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .stat-content h3 {
    color: #1f2937;
  }
  
  .stat-content p {
    color: #6b7280;
  }
}

.stat-content p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  background: #fafafa;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.header-content h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content h1 i {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
}

.header-content p {
  font-size: 1rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
}


/* Filters */
.filters-section {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 1rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  font-size: 0.8125rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.form-select {
  padding: 0.625rem 0.75rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  font-size: 0.8125rem;
  background: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  min-width: 120px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  padding-right: 32px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn-outline-elegant {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid rgba(0, 0, 0, 0.08);
  color: #4a5568;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.8125rem;
}

.btn-outline-elegant:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
  transform: translateY(-2px);
}

.view-toggle {
  display: flex;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
}

.view-btn-elegant {
  padding: 0.625rem 0.75rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-width: 36px;
}

.view-btn-elegant:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: translateY(-1px);
}

.view-btn-elegant.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
}

/* Content */
.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.participant-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.participant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.participant-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.participant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.participant-info {
  flex: 1;
}

.participant-info h3 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1.125rem;
}

.participant-ndis {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, #e2e8f0, #cbd5e0);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 28px;
  box-shadow: 
    inset 2px 2px 5px rgba(0, 0, 0, 0.1),
    inset -2px -2px 5px rgba(255, 255, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  top: 3px;
  background: linear-gradient(145deg, #ffffff, #f1f5f9);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 50%;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 1px 1px 3px rgba(255, 255, 255, 0.8),
    inset -1px -1px 3px rgba(0, 0, 0, 0.05);
}

input:checked + .slider {
  background: linear-gradient(145deg, #10b981, #059669);
  box-shadow: 
    inset 2px 2px 5px rgba(16, 185, 129, 0.2),
    inset -2px -2px 5px rgba(5, 150, 105, 0.1),
    0 2px 8px rgba(16, 185, 129, 0.3);
}

input:checked + .slider:before {
  transform: translateX(24px);
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  box-shadow: 
    0 3px 12px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.15),
    inset 1px 1px 3px rgba(255, 255, 255, 0.9),
    inset -1px -1px 3px rgba(0, 0, 0, 0.03);
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.status-badge.inactive {
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  box-shadow: 0 2px 6px rgba(100, 116, 139, 0.3);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.participant-actions {
  display: flex;
  gap: 8px;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  min-width: 44px;
  min-height: 40px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.view-btn {
  background: #10b981;
  color: white;
}

.action-btn.edit-btn {
  background: #3b82f6;
  color: white;
}

.action-btn.delete-btn {
  background: #ef4444;
  color: white;
}

/* List View */
.participants-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1.5fr 1.2fr;
  gap: 16px;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1.5fr 1.2fr;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  align-items: center;
}

.list-row:hover {
  background: #f8fafc;
}

.list-row:last-child {
  border-bottom: none;
}

.list-cell {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
}

.list-cell .participant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 16px;
  margin-right: 12px;
}

.participant-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.participant-name .name {
  font-weight: 600;
  color: #1f2937;
}

.participant-name .email {
  font-size: 12px;
  color: #6b7280;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-info > div {
  font-size: 13px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .participants-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    display: none;
  }
  
  .list-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
}
</style>
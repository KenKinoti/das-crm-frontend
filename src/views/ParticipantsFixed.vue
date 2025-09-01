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
        <div class="search-section">
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
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterParticipants" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant">
            <i class="fas fa-times"></i>
            Clear
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
                    :disabled="isSubmitting || (authStore.isSuperAdmin && !orgContextStore.currentOrgId)"
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
            <button @click="deleteParticipantWithConfirm(participant)" class="action-btn delete-btn" title="Delete Participant">
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
                  :disabled="isSubmitting || (authStore.isSuperAdmin && !orgContextStore.currentOrgId)"
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
              <button @click="deleteParticipantWithConfirm(participant)" class="action-btn delete-btn" title="Delete Participant">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="filteredParticipants.length > itemsPerPage" class="pagination-container">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredParticipants.length) }} of {{ filteredParticipants.length }} participants
        </div>
        
        <div class="pagination-controls">
          <button 
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="First Page"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          
          <button 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="Previous Page"
          >
            <i class="fas fa-angle-left"></i>
            Previous
          </button>
          
          <div class="page-numbers">
            <span 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              :class="['page-number', { active: page === currentPage }]"
            >
              {{ page }}
            </span>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="pagination-btn"
            title="Next Page"
          >
            Next
            <i class="fas fa-angle-right"></i>
          </button>
          
          <button 
            @click="goToPage(totalPages)"
            :disabled="currentPage >= totalPages"
            class="pagination-btn"
            title="Last Page"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
        
        <div class="items-per-page">
          <label>
            Show:
            <select v-model="itemsPerPage" @change="currentPage = 1">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            per page
          </label>
        </div>
      </div>
    </div>

    <!-- Add Participant Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-user-plus"></i>
            Add New Participant
          </h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="submitNewParticipant" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input
                v-model="newParticipant.first_name"
                type="text"
                id="firstName"
                class="form-input"
                maxlength="50"
                required
              />
              <small class="field-hint">Maximum 50 characters ({{ newParticipant.first_name.length }}/50)</small>
            </div>
            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input
                v-model="newParticipant.last_name"
                type="text"
                id="lastName"
                class="form-input"
                maxlength="50"
                required
              />
              <small class="field-hint">Maximum 50 characters ({{ newParticipant.last_name.length }}/50)</small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                v-model="newParticipant.email"
                type="email"
                id="email"
                class="form-input"
                maxlength="100"
              />
              <small class="field-hint">Maximum 100 characters ({{ newParticipant.email.length }}/100)</small>
            </div>
            <div class="form-group">
              <label for="phone">Phone</label>
              <input
                v-model="newParticipant.phone"
                type="tel"
                id="phone"
                class="form-input"
                maxlength="20"
                placeholder="e.g., +61 400 123 456"
              />
              <small class="field-hint">Maximum 20 characters ({{ newParticipant.phone.length }}/20)</small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="ndisNumber">NDIS Number</label>
              <input
                v-model="newParticipant.ndis_number"
                type="text"
                id="ndisNumber"
                class="form-input"
                maxlength="10"
                placeholder="123456789"
                @input="validateNdisNumber"
                pattern="[0-9]*"
              />
              <small class="field-hint">Maximum 10 characters ({{ newParticipant.ndis_number.length }}/10)</small>
            </div>
            <div class="form-group">
              <label for="dateOfBirth">Date of Birth</label>
              <input
                v-model="newParticipant.date_of_birth"
                type="date"
                id="dateOfBirth"
                class="form-input"
              />
            </div>
          </div>
          
          <AddressSearch
            v-model="newParticipant.address"
            label="Address"
            placeholder="Start typing an address..."
            field-id="newParticipantAddress"
            @address-selected="handleNewParticipantAddressSelected"
          />
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-outline-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-plus"></i>
              {{ isSubmitting ? 'Adding...' : 'Add Participant' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Participant Modal -->
    <div v-if="showViewModal && selectedParticipant" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-eye"></i>
            Participant Details
          </h3>
          <button @click="closeViewModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="participant-details">
            <div class="detail-section">
              <h4>Personal Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Full Name</label>
                  <span>{{ selectedParticipant.first_name }} {{ selectedParticipant.last_name }}</span>
                </div>
                <div class="detail-item">
                  <label>Date of Birth</label>
                  <span>{{ selectedParticipant.date_of_birth ? new Date(selectedParticipant.date_of_birth).toLocaleDateString() : 'Not provided' }}</span>
                </div>
                <div class="detail-item">
                  <label>NDIS Number</label>
                  <span>{{ selectedParticipant.ndis_number || 'Not provided' }}</span>
                </div>
                <div class="detail-item">
                  <label>Status</label>
                  <span :class="['status-badge', selectedParticipant.is_active ? 'active' : 'inactive']">
                    {{ selectedParticipant.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Contact Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Email</label>
                  <span>{{ selectedParticipant.email || 'Not provided' }}</span>
                </div>
                <div class="detail-item">
                  <label>Phone</label>
                  <span>{{ selectedParticipant.phone || 'Not provided' }}</span>
                </div>
                <div class="detail-item full-width">
                  <label>Address</label>
                  <span>{{ selectedParticipant.address || 'Not provided' }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>System Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Created</label>
                  <span>{{ selectedParticipant.created_at ? new Date(selectedParticipant.created_at).toLocaleDateString() : 'Unknown' }}</span>
                </div>
                <div class="detail-item">
                  <label>Last Updated</label>
                  <span>{{ selectedParticipant.updated_at ? new Date(selectedParticipant.updated_at).toLocaleDateString() : 'Unknown' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button @click="editParticipant(selectedParticipant); closeViewModal()" class="btn btn-primary">
              <i class="fas fa-edit"></i>
              Edit Participant
            </button>
            <button @click="closeViewModal" class="btn btn-outline-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Participant Modal -->
    <div v-if="showEditModal && editParticipantData" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-edit"></i>
            Edit Participant
          </h3>
          <button @click="closeEditModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="submitEditParticipant" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="editFirstName">First Name *</label>
              <input
                id="editFirstName"
                v-model="editParticipantData.first_name"
                type="text"
                class="form-control"
                placeholder="Enter first name"
                maxlength="50"
                required
              >
              <small class="field-hint">Maximum 50 characters ({{ editParticipantData.first_name?.length || 0 }}/50)</small>
            </div>
            <div class="form-group">
              <label for="editLastName">Last Name *</label>
              <input
                id="editLastName"
                v-model="editParticipantData.last_name"
                type="text"
                class="form-control"
                placeholder="Enter last name"
                maxlength="50"
                required
              >
              <small class="field-hint">Maximum 50 characters ({{ editParticipantData.last_name?.length || 0 }}/50)</small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editEmail">Email Address</label>
              <input
                id="editEmail"
                v-model="editParticipantData.email"
                type="email"
                class="form-control"
                placeholder="Enter email address"
                maxlength="255"
              >
              <small class="field-hint">Maximum 255 characters ({{ editParticipantData.email?.length || 0 }}/255)</small>
            </div>
            <div class="form-group">
              <label for="editPhone">Phone Number</label>
              <input
                id="editPhone"
                v-model="editParticipantData.phone"
                type="tel"
                class="form-control"
                placeholder="Enter phone number"
                maxlength="20"
              >
              <small class="field-hint">Maximum 20 characters ({{ editParticipantData.phone?.length || 0 }}/20)</small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editNdisNumber">NDIS Number</label>
              <input
                id="editNdisNumber"
                v-model="editParticipantData.ndis_number"
                type="text"
                class="form-control"
                placeholder="Enter NDIS number (digits only)"
                maxlength="10"
                @input="editParticipantData.ndis_number = editParticipantData.ndis_number.replace(/[^0-9]/g, '')"
              >
              <small class="field-hint">Maximum 10 digits ({{ editParticipantData.ndis_number?.length || 0 }}/10)</small>
            </div>
            <div class="form-group">
              <label for="editDateOfBirth">Date of Birth</label>
              <input
                id="editDateOfBirth"
                v-model="editParticipantData.date_of_birth"
                type="date"
                class="form-control"
              >
            </div>
          </div>
          
          <AddressSearch
            v-model="editParticipantData.address"
            label="Address"
            placeholder="Start typing an address..."
            field-id="editParticipantAddress"
            @address-selected="handleEditParticipantAddressSelected"
          />
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="editParticipantData.is_active"
                type="checkbox"
                class="form-checkbox"
              >
              <span class="checkmark"></span>
              Active Participant
            </label>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn btn-outline-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useParticipantsStore } from '../stores/participants'
import { useAuthStore } from '../stores/auth'
import { useOrganizationContextStore } from '../stores/organizationContext'
import { showError, showSuccess } from '../utils/notifications'
import GlobalModal from '../components/GlobalModal.vue'
import AddressSearch from '../components/AddressSearch.vue'

export default {
  name: 'ParticipantsView',
  components: {
    GlobalModal,
    AddressSearch
  },
  data() {
    return {
      filteredParticipants: [],
      searchQuery: '',
      statusFilter: '',
      currentView: 'list',
      currentPage: 1,
      itemsPerPage: 25,
      showAddModal: false,
      showViewModal: false,
      showEditModal: false,
      isSubmitting: false,
      selectedParticipant: null,
      editParticipantData: {},
      newParticipant: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        ndis_number: '',
        date_of_birth: '',
        address: '',
        is_active: true
      }
    }
  },
  computed: {
    ...mapState(useParticipantsStore, ['participants', 'isLoading', 'error']),
    ...mapState(useAuthStore, ['user']),
    ...mapState(useOrganizationContextStore, ['organizations', 'currentOrganization']),
    
    authStore() {
      return useAuthStore()
    },
    
    orgContextStore() {
      return useOrganizationContextStore()
    },
    
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
    },
    totalPages() {
      return Math.ceil(this.filteredParticipants.length / this.itemsPerPage)
    },
    visiblePages() {
      const total = this.totalPages
      const current = this.currentPage
      const delta = 2 // Show 2 pages before and after current page
      
      if (total <= 7) {
        // Show all pages if total is 7 or fewer
        return Array.from({ length: total }, (_, i) => i + 1)
      }
      
      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)
      
      // Adjust start and end to show exactly 5 pages when possible
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4)
        } else if (end === total) {
          start = Math.max(1, end - 4)
        }
      }
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
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
    ...mapActions(useParticipantsStore, ['fetchParticipants', 'updateParticipant', 'createParticipant']),
    ...mapActions(useOrganizationContextStore, ['fetchOrganizations', 'setCurrentOrganization']),
    async loadParticipants() {
      try {
        await this.fetchParticipants({ limit: 1000, page: 1 })
        this.filterParticipants()
      } catch (error) {
        console.error('Error loading participants:', error)
        await showError('Load Failed', 'Failed to load participants. Please try again.')
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
      
      // Check if we can update this participant (super admin viewing all orgs vs specific org)
      const currentOrgId = this.orgContextStore.currentOrgId
      
      if (this.authStore.isSuperAdmin && !currentOrgId) {
        // Super admin viewing "All Organizations" - warn about the limitation
        await showError('Update Restricted', 'To update participant status, please select a specific organization from the dropdown first.')
        return
      }
      
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
        await showSuccess('Status Updated', `Participant ${statusText} successfully!`)
      } catch (error) {
        console.error('Error toggling participant status:', error)
        if (error.response?.status === 404) {
          await showError('Participant Not Found', 'This participant may belong to a different organization. Please select the correct organization first.')
        } else {
          await showError('Update Failed', 'Error updating participant status. Please try again.')
        }
        // Revert the local change on error
        participant.is_active = participant.is_active === false ? true : false
      } finally {
        this.isSubmitting = false
      }
    },
    viewParticipant(participant) {
      this.selectedParticipant = participant
      this.showViewModal = true
    },
    editParticipant(participant) {
      this.selectedParticipant = participant
      this.editParticipantData = { ...participant }
      // Format date for input field
      if (this.editParticipantData.date_of_birth) {
        const date = new Date(this.editParticipantData.date_of_birth)
        this.editParticipantData.date_of_birth = date.toISOString().split('T')[0]
      }
      this.showEditModal = true
    },
    async deleteParticipantWithConfirm(participant) {
      const { showConfirm } = await import('../utils/notifications')
      
      const confirmed = await showConfirm(
        'Delete Participant',
        `Are you sure you want to delete ${participant.first_name} ${participant.last_name}? This action cannot be undone.`,
        {
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      )
      
      if (!confirmed) {
        return
      }
      
      try {
        await this.deleteParticipant(participant.id)
        await showSuccess('Deleted', 'Participant deleted successfully!')
        await this.loadParticipants()
      } catch (error) {
        console.error('Error deleting participant:', error)
        await showError('Delete Failed', 'Failed to delete participant. Please try again.')
      }
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        // Scroll to top of participants list for better UX
        const container = document.querySelector('.participants-container')
        if (container) {
          container.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    },
    
    closeModal() {
      // Force close modal and reset form
      this.showAddModal = false
      this.isSubmitting = false
      this.resetNewParticipant()
      
      // Use nextTick to ensure DOM updates
      this.$nextTick(() => {
        console.log('Modal closed, showAddModal:', this.showAddModal)
      })
    },
    
    closeViewModal() {
      this.showViewModal = false
      this.selectedParticipant = null
    },
    
    closeEditModal() {
      this.showEditModal = false
      this.selectedParticipant = null
      this.editParticipantData = {}
      this.isSubmitting = false
    },
    
    async submitEditParticipant() {
      this.isSubmitting = true
      
      try {
        // Format the data for the API
        const participantData = {
          ...this.editParticipantData,
          // Format date_of_birth for backend
          date_of_birth: this.editParticipantData.date_of_birth 
            ? new Date(this.editParticipantData.date_of_birth + 'T00:00:00Z').toISOString()
            : null
        }
        
        await this.updateParticipant(this.editParticipantData.id, participantData)
        
        // Close modal first
        this.closeEditModal()
        
        // Show success and reload
        await showSuccess('Updated', 'Participant updated successfully!')
        await this.loadParticipants()
        
      } catch (error) {
        console.error('Error updating participant:', error)
        await showError('Update Failed', 'Failed to update participant. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },
    
    resetNewParticipant() {
      this.newParticipant = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        ndis_number: '',
        date_of_birth: '',
        address: '',
        is_active: true
      }
    },
    
    validateNdisNumber(event) {
      // Only allow numbers
      const value = event.target.value.replace(/[^0-9]/g, '')
      this.newParticipant.ndis_number = value
    },
    
    async submitNewParticipant() {
      if (!this.newParticipant.first_name || !this.newParticipant.last_name) {
        await showError('Required Fields', 'First name and last name are required')
        return
      }
      
      this.isSubmitting = true
      
      try {
        // Add organization_id for non-super admins and format date_of_birth
        const participantData = {
          ...this.newParticipant,
          organization_id: this.isSuperAdmin && this.currentOrganization 
            ? this.currentOrganization.id 
            : this.user?.organization_id,
          // Format date_of_birth for backend - convert YYYY-MM-DD to ISO string
          date_of_birth: this.newParticipant.date_of_birth 
            ? new Date(this.newParticipant.date_of_birth + 'T00:00:00Z').toISOString()
            : null
        }
        
        await this.createParticipant(participantData)
        
        // Close modal first
        this.closeModal()
        
        // Show success notification and reload data
        await showSuccess('Added', 'Participant added successfully!')
        await this.loadParticipants()
        
      } catch (error) {
        console.error('Error creating participant:', error)
        await showError('Add Failed', 'Failed to add participant. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    handleNewParticipantAddressSelected(addressData) {
      // Store the selected address and optionally its components
      this.newParticipant.address = addressData.fullAddress
      console.log('New participant address selected:', addressData)
    },

    handleEditParticipantAddressSelected(addressData) {
      // Store the selected address and optionally its components
      this.editParticipantData.address = addressData.fullAddress
      console.log('Edit participant address selected:', addressData)
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
  background: rgba(255, 255, 255, 0.9);
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

/* Dark theme styling for stat cards */
[data-theme="dark"] .stat-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .stat-content h3 {
  color: #f3f4f6;
}

[data-theme="dark"] .stat-content p {
  color: #9ca3af;
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .page-header {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 1rem;
}

[data-theme="dark"] .header-content h1 {
  color: #f3f4f6;
}

.header-content h1 i {
  color: #3b82f6;
  font-size: 2rem;
}

.header-content p {
  font-size: 1rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
}

[data-theme="dark"] .header-content p {
  color: #9ca3af;
}


/* Filters */
.filters-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}

[data-theme="dark"] .filters-section {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
}

.search-section {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
  z-index: 2;
  pointer-events: none;
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
  gap: 1rem;
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
  min-width: 110px;
  width: 110px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  padding-right: 28px;
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
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.8125rem;
  min-width: auto;
  white-space: nowrap;
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
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
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
  width: 36px;
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .content-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #374151;
}

[data-theme="dark"] .loading-state,
[data-theme="dark"] .empty-state {
  color: #e5e7eb;
}

.empty-state h3 {
  color: #1f2937;
  margin: 1rem 0 0.5rem 0;
}

[data-theme="dark"] .empty-state h3 {
  color: #f3f4f6;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

[data-theme="dark"] .empty-state p {
  color: #9ca3af;
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

[data-theme="dark"] .participant-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.participant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .participant-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
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

[data-theme="dark"] .participant-info h3 {
  color: #f3f4f6;
}

.participant-ndis {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

[data-theme="dark"] .participant-ndis {
  color: #9ca3af;
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

[data-theme="dark"] .detail-row {
  color: #9ca3af;
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .participants-list {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1.5fr 1.2fr;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
  font-weight: 600;
  color: #374151;
}

[data-theme="dark"] .list-header {
  background: rgba(31, 41, 55, 0.8);
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  color: #e5e7eb;
  font-size: 14px;
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1.5fr 1.2fr;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.3);
  transition: all 0.2s ease;
  align-items: center;
}

[data-theme="dark"] .list-row {
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.list-row:hover {
  background: rgba(248, 250, 252, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transform: translateX(4px);
}

[data-theme="dark"] .list-row:hover {
  background: rgba(31, 41, 55, 0.6);
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

[data-theme="dark"] .list-cell {
  color: #e5e7eb;
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
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-section {
    min-width: auto;
    max-width: none;
  }
  
  .filter-controls {
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 0.75rem;
  }
  
  .form-select {
    min-width: 100px;
    width: 100px;
  }
  
  .btn-outline-elegant {
    padding: 0.625rem 0.5rem;
  }
  
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 90vw;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

[data-theme="dark"] .modal-content {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .modal-header {
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

[data-theme="dark"] .modal-header h3 {
  color: #f3f4f6;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

[data-theme="dark"] .modal-close {
  color: #9ca3af;
}

[data-theme="dark"] .modal-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
}

.modal-body {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

[data-theme="dark"] .form-group label {
  color: #d1d5db;
}

.form-input, .form-textarea {
  padding: 0.75rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  color: #374151;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: rgba(255, 255, 255, 0.95);
}

[data-theme="dark"] .form-input, 
[data-theme="dark"] .form-textarea {
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.3);
  color: #e5e7eb;
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-textarea:focus {
  background: rgba(55, 65, 81, 0.95);
  border-color: #3b82f6;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
  opacity: 0.8;
}

[data-theme="dark"] .field-hint {
  color: #9ca3af;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .modal-actions {
  border-top: 1px solid rgba(75, 85, 99, 0.3);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline-secondary {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(107, 114, 128, 0.3);
  color: #6b7280;
}

.btn-outline-secondary:hover {
  background: rgba(107, 114, 128, 0.1);
  border-color: #6b7280;
  color: #374151;
}

[data-theme="dark"] .btn-outline-secondary {
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(107, 114, 128, 0.3);
  color: #9ca3af;
}

[data-theme="dark"] .btn-outline-secondary:hover {
  background: rgba(75, 85, 99, 0.3);
  border-color: #9ca3af;
  color: #d1d5db;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95vw;
    margin: 1rem;
  }
  
  .modal-header, .modal-body {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin-top: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .pagination-container {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

[data-theme="dark"] .pagination-info {
  color: #9ca3af;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
  color: #94a3b8;
}

[data-theme="dark"] .pagination-btn {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
}

[data-theme="dark"] .pagination-btn:hover:not(:disabled) {
  background: rgba(55, 65, 81, 0.8);
  border-color: #3b82f6;
  color: #60a5fa;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.page-number.active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

[data-theme="dark"] .page-number {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
}

[data-theme="dark"] .page-number:hover {
  background: rgba(55, 65, 81, 0.8);
  border-color: #3b82f6;
  color: #60a5fa;
}

[data-theme="dark"] .page-number.active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

[data-theme="dark"] .items-per-page label {
  color: #9ca3af;
}

.items-per-page select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.items-per-page select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

[data-theme="dark"] .items-per-page select {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
}

/* Mobile pagination styles */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .pagination-info, .items-per-page {
    text-align: center;
  }
  
  .page-numbers {
    margin: 0;
  }
  
  .pagination-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .pagination-btn span {
    display: none;
  }
  
  .page-numbers {
    display: none;
  }
  
  .pagination-controls {
    justify-content: space-between;
    gap: 1rem;
  }
  
  .pagination-info {
    font-size: 0.8rem;
  }
}

/* Participant Detail View Styles */
.participant-details {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  position: relative;
}

[data-theme="dark"] .detail-section h4 {
  color: #f3f4f6;
  border-bottom-color: rgba(75, 85, 99, 0.5);
}

.detail-section h4::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 50px;
  height: 2px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

[data-theme="dark"] .detail-item label {
  color: #9ca3af;
}

.detail-item span {
  font-size: 1rem;
  color: #374151;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 44px;
  display: flex;
  align-items: center;
}

[data-theme="dark"] .detail-item span {
  color: #f3f4f6;
  background: rgba(31, 41, 55, 0.5);
  border-color: rgba(75, 85, 99, 0.5);
}

.detail-item span:empty::before {
  content: 'Not provided';
  color: #9ca3af;
  font-style: italic;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .participant-details {
    max-height: 50vh;
  }
  
  .detail-section h4 {
    font-size: 1rem;
  }
  
  .detail-item span {
    font-size: 0.875rem;
    padding: 0.625rem;
  }
}

/* Dark theme search and form styles */
[data-theme="dark"] .search-box i {
  color: #6b7280;
}

[data-theme="dark"] .form-input {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.3);
  color: #e5e7eb;
}

[data-theme="dark"] .form-input:focus {
  border-color: var(--primary-color);
  background: rgba(31, 41, 55, 0.9);
}

[data-theme="dark"] .form-input::placeholder {
  color: #9ca3af;
}

[data-theme="dark"] .form-select {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.3);
  color: #e5e7eb;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
}

[data-theme="dark"] .form-select:focus {
  border-color: var(--primary-color);
  background: rgba(31, 41, 55, 0.9);
}

[data-theme="dark"] .form-select option {
  background: #1f2937;
  color: #e5e7eb;
}
</style>
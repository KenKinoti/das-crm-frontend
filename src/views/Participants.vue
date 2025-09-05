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
            @input="filterItems"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterParticipants" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant" title="Clear">
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

    <!-- Participants List -->
    <div class="content-card">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading participants...</p>
      </div>

      <div v-else-if="filteredParticipants.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-users"></i>
        <h3>No Participants Yet</h3>
        <p>Get started by adding your first participant</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Add First Participant
        </button>
      </div>

      <div v-else-if="filteredParticipants.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
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
            <div class="detail-row">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ formatAddress(participant.address) }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ calculateAge(participant.date_of_birth) }} years old</span>
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
          <div class="header-cell">Age</div>
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
          <div class="list-cell">{{ calculateAge(participant.date_of_birth) }} years</div>
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
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredParticipants.length }} participants
        </div>
        <div class="pagination">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="First Page"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="Previous Page"
          >
            <i class="fas fa-angle-left"></i>
          </button>
          
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="currentPage = page"
              :class="['pagination-btn', { active: currentPage === page }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            title="Next Page"
          >
            <i class="fas fa-angle-right"></i>
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            title="Last Page"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
        <div class="per-page-selector">
          <label>Per page:</label>
          <select v-model="itemsPerPage" @change="currentPage = 1" class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Add Participant Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Participant</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addParticipant">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input 
                  v-model="newParticipant.first_name" 
                  type="text" 
                  required 
                  placeholder="Enter first name"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  v-model="newParticipant.last_name" 
                  type="text" 
                  required 
                  placeholder="Enter last name"
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input 
                  v-model="newParticipant.email" 
                  type="email" 
                  placeholder="Enter email address"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input 
                  v-model="newParticipant.phone" 
                  type="tel" 
                  placeholder="Enter phone number"
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">NDIS Number</label>
                <input 
                  v-model="newParticipant.ndis_number" 
                  type="text" 
                  placeholder="Enter NDIS number"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <input 
                  v-model="newParticipant.date_of_birth" 
                  type="date" 
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street Address</label>
              <input 
                v-model="newParticipant.address.street" 
                type="text" 
                placeholder="Enter street address"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Suburb</label>
                <input 
                  v-model="newParticipant.address.suburb" 
                  type="text" 
                  placeholder="Enter suburb"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <select v-model="newParticipant.address.state" class="form-select">
                  <option value="">Select State</option>
                  <option value="SA">SA</option>
                  <option value="NSW">NSW</option>
                  <option value="VIC">VIC</option>
                  <option value="QLD">QLD</option>
                  <option value="WA">WA</option>
                  <option value="TAS">TAS</option>
                  <option value="NT">NT</option>
                  <option value="ACT">ACT</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Postcode</label>
                <input 
                  v-model="newParticipant.address.postcode" 
                  type="text" 
                  placeholder="Postcode"
                  class="form-input"
                />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Adding...
                </span>
                <span v-else>
                  <i class="fas fa-plus"></i>
                  Add Participant
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Participant Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Participant</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateEditedParticipant">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input 
                  v-model="newParticipant.first_name" 
                  type="text" 
                  required 
                  placeholder="Enter first name"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  v-model="newParticipant.last_name" 
                  type="text" 
                  required 
                  placeholder="Enter last name"
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input 
                  v-model="newParticipant.email" 
                  type="email" 
                  placeholder="Enter email address"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input 
                  v-model="newParticipant.phone" 
                  type="tel" 
                  placeholder="Enter phone number"
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">NDIS Number</label>
                <input 
                  v-model="newParticipant.ndis_number" 
                  type="text" 
                  placeholder="Enter NDIS number"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <input 
                  v-model="newParticipant.date_of_birth" 
                  type="date" 
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street Address</label>
              <input 
                v-model="newParticipant.address.street" 
                type="text" 
                placeholder="Enter street address"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Suburb</label>
                <input 
                  v-model="newParticipant.address.suburb" 
                  type="text" 
                  placeholder="Enter suburb"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <select v-model="newParticipant.address.state" class="form-select">
                  <option value="">Select State</option>
                  <option value="SA">SA</option>
                  <option value="NSW">NSW</option>
                  <option value="VIC">VIC</option>
                  <option value="QLD">QLD</option>
                  <option value="WA">WA</option>
                  <option value="TAS">TAS</option>
                  <option value="NT">NT</option>
                  <option value="ACT">ACT</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Postcode</label>
                <input 
                  v-model="newParticipant.address.postcode" 
                  type="text" 
                  placeholder="Postcode"
                  class="form-input"
                />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-edit" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Updating...
                </span>
                <span v-else>
                  <i class="fas fa-save"></i>
                  Update Participant
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal && participantToDelete" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Participant</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="delete-confirmation">
            <div class="delete-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Are you sure you want to delete this participant?</h4>
            <div class="participant-summary">
              <p><strong>Name:</strong> {{ participantToDelete.first_name }} {{ participantToDelete.last_name }}</p>
              <p><strong>Email:</strong> {{ participantToDelete.email || 'Not provided' }}</p>
              <p><strong>Phone:</strong> {{ participantToDelete.phone || 'Not provided' }}</p>
              <p><strong>NDIS Number:</strong> {{ participantToDelete.ndis_number || 'Not provided' }}</p>
            </div>
            <p class="warning-text">
              <i class="fas fa-exclamation-circle"></i>
              This action cannot be undone. All participant data including shifts, notes, and medical information will be permanently deleted.
            </p>
          </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn btn-view">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmDeleteParticipant" class="btn btn-delete" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              Deleting...
            </span>
            <span v-else>
              <i class="fas fa-trash"></i>
              Delete Participant
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Participant Modal -->
    <div v-if="showViewModal && selectedParticipant" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h3>Participant Details</h3>
          <button @click="closeViewModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="participant-detail-grid">
            <div class="detail-section">
              <h4><i class="fas fa-user"></i> Personal Information</h4>
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value">{{ selectedParticipant.first_name }} {{ selectedParticipant.last_name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ selectedParticipant.email || 'Not provided' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Phone:</span>
                <span class="value">{{ selectedParticipant.phone || 'Not provided' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">NDIS Number:</span>
                <span class="value">{{ selectedParticipant.ndis_number || 'Not provided' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-info-circle"></i> Status</h4>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['status-badge', selectedParticipant.is_active ? 'active' : 'inactive']">
                  {{ selectedParticipant.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Added:</span>
                <span class="value">{{ formatDate(selectedParticipant.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeViewModal" class="btn btn-view">Close</button>
            <button @click="editParticipant(selectedParticipant); closeViewModal()" class="btn btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteParticipantHandler(selectedParticipant); closeViewModal()" class="btn btn-delete">
              <i class="fas fa-trash"></i>
              Delete
            </button>
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
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'Participants',
  data() {
    return {
      filteredParticipants: [],
      searchQuery: '',
      statusFilter: 'active',
      currentView: 'list',
      currentPage: 1,
      itemsPerPage: 25,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showViewModal: false,
      editingParticipant: null,
      participantToDelete: null,
      selectedParticipant: null,
      isSubmitting: false,
      newParticipant: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        ndis_number: '',
        date_of_birth: '',
        address: {
          street: '',
          suburb: '',
          state: '',
          postcode: '',
          country: 'Australia'
        },
        medical_information: {
          conditions: '[]',
          medications: '[]',
          allergies: '[]',
          doctor_name: '',
          doctor_phone: '',
          notes: ''
        },
        emergency_contacts: []
      }
    }
  },
  computed: {
    ...mapState(useParticipantsStore, ['participants', 'isLoading', 'error']),
    ...mapState(useAuthStore, ['user']),
    isSuperAdmin() {
      return this.user?.role === 'super_admin'
    },
    isAdmin() {
      return this.user?.role === 'admin'
    },
    activeParticipants() {
      return this.participants.filter(p => p.is_active !== false).length
    },
    inactiveParticipants() {
      return this.participants.filter(p => p.is_active === false).length
    },
    newThisMonth() {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return this.participants.filter(p => {
        if (!p.created_at) return false
        const createdDate = new Date(p.created_at)
        return createdDate >= thisMonthStart
      }).length
    },
    
    // Pagination computed properties
    totalPages() {
      return Math.ceil(this.filteredParticipants.length / this.itemsPerPage)
    },
    
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    
    endIndex() {
      return Math.min(this.startIndex + this.itemsPerPage, this.filteredParticipants.length)
    },
    
    paginatedParticipants() {
      return this.filteredParticipants.slice(this.startIndex, this.endIndex)
    },
    
    visiblePages() {
      const current = this.currentPage
      const total = this.totalPages
      const pages = []
      
      // Always show first page
      if (total > 1) pages.push(1)
      
      // Show pages around current page
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      if (start > 2) pages.push('...')
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) pages.push(i)
      }
      
      if (end < total - 1) pages.push('...')
      
      // Always show last page
      if (total > 1) pages.push(total)
      
      return pages.filter((page, index, arr) => arr.indexOf(page) === index)
    }
  },
  methods: {
    ...mapActions(useParticipantsStore, ['fetchParticipants', 'createParticipant', 'updateParticipant', 'deleteParticipant']),
    async loadParticipants() {
      try {
        // Fetch all participants with a large limit for super admin
        await this.fetchParticipants({ limit: 1000, page: 1 })
        this.filterParticipants()
      } catch (error) {
        console.error('Error loading participants:', error)
        showErrorNotification(error, 'Failed to load participants. Please try again.')
      }
    },

    filterParticipants() {
      let filtered = [...this.participants]
      
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
      
      // Organization-based filtering - only show participants from user's organization
      if (!this.isSuperAdmin) {
        const userOrgId = this.user?.organization_id
        if (userOrgId) {
          filtered = filtered.filter(p => 
            p.organization_id === userOrgId || !p.organization_id
          )
        } else {
          // If user has no organization, show no participants
          filtered = []
        }
      }
      
      // Sort by last name, then first name
      filtered.sort((a, b) => {
        const lastNameComparison = (a.last_name || '').localeCompare(b.last_name || '')
        if (lastNameComparison !== 0) return lastNameComparison
        return (a.first_name || '').localeCompare(b.first_name || '')
      })
      
      this.filteredParticipants = filtered
      // Reset to first page when filtering changes
      this.currentPage = 1
    },

    async addParticipant() {
      console.log('🔥 ADD PARTICIPANT: Starting validation')
      if (!this.validateParticipantForm()) {
        console.log('❌ ADD PARTICIPANT: Validation failed')
        return
      }
      
      console.log('✅ ADD PARTICIPANT: Validation passed, preparing data')
      console.log('🔧 DIAGNOSTIC INFO:', {
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        hasAuthToken: !!localStorage.getItem('auth_token'),
        userOrganization: this.user?.organization_id,
        isSuperAdmin: this.isSuperAdmin
      })
      
      try {
        // Validate and prepare data
        const participantData = { ...this.newParticipant }
        
        // Associate participant with current user's organization
        if (!this.isSuperAdmin && this.user?.organization_id) {
          participantData.organization_id = this.user.organization_id
        }
        
        // Trim string fields
        participantData.first_name = participantData.first_name.trim()
        participantData.last_name = participantData.last_name.trim()
        participantData.email = (participantData.email || '').trim()
        participantData.phone = (participantData.phone || '').trim()
        participantData.ndis_number = (participantData.ndis_number || '').trim()
        
        // Trim address fields
        if (participantData.address) {
          participantData.address.street = (participantData.address.street || '').trim()
          participantData.address.suburb = (participantData.address.suburb || '').trim()
          participantData.address.postcode = (participantData.address.postcode || '').trim()
        }
        
        // Fix date format - convert YYYY-MM-DD to ISO 8601
        if (participantData.date_of_birth) {
          participantData.date_of_birth = participantData.date_of_birth + 'T00:00:00Z'
        }
        
        console.log('🚀 ADD PARTICIPANT: Sending data to API:', participantData)
        const result = await this.createParticipant(participantData)
        console.log('✅ ADD PARTICIPANT: API call successful:', result)
        
        this.filterParticipants()
        this.closeModal()
        showSuccessNotification('Participant added successfully!')
        console.log('✅ ADD PARTICIPANT: Complete success!')
      } catch (error) {
        console.error('❌ ADD PARTICIPANT: Error occurred:', error)
        console.error('❌ ADD PARTICIPANT: Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        })
        showErrorNotification(error, 'Error adding participant. Please try again.')
      }
    },

    validateParticipantForm() {
      if (!this.newParticipant.first_name || !this.newParticipant.first_name.trim()) {
        showErrorNotification(new Error('First name is required'))
        return false
      }
      if (!this.newParticipant.last_name || !this.newParticipant.last_name.trim()) {
        showErrorNotification(new Error('Last name is required'))
        return false
      }
      // Email is optional but must be valid if provided
      if (this.newParticipant.email && this.newParticipant.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(this.newParticipant.email.trim())) {
          showErrorNotification(new Error('Please enter a valid email address'))
          return false
        }
      }
      return true
    },

    viewParticipant(participant) {
      this.selectedParticipant = participant
      this.showViewModal = true
    },

    closeViewModal() {
      this.showViewModal = false
      this.selectedParticipant = null
    },

    editParticipant(participant) {
      this.editingParticipant = { ...participant }
      // Pre-populate the form
      this.newParticipant = {
        first_name: participant.first_name || '',
        last_name: participant.last_name || '',
        email: participant.email || '',
        phone: participant.phone || '',
        ndis_number: participant.ndis_number || '',
        date_of_birth: participant.date_of_birth ? participant.date_of_birth.split('T')[0] : '',
        address: {
          street: participant.address?.street || '',
          suburb: participant.address?.suburb || '',
          state: participant.address?.state || '',
          postcode: participant.address?.postcode || '',
          country: participant.address?.country || 'Australia'
        },
        medical_information: {
          conditions: participant.medical_information?.conditions || '[]',
          medications: participant.medical_information?.medications || '[]',
          allergies: participant.medical_information?.allergies || '[]',
          doctor_name: participant.medical_information?.doctor_name || '',
          doctor_phone: participant.medical_information?.doctor_phone || '',
          notes: participant.medical_information?.notes || ''
        },
        emergency_contacts: participant.emergency_contacts || []
      }
      this.showEditModal = true
    },

    async updateEditedParticipant() {
      if (!this.validateParticipantForm()) {
        return
      }
      
      try {
        // Prepare data for update
        const participantData = { ...this.newParticipant }
        
        // Ensure organization ID is preserved/set correctly
        if (!this.isSuperAdmin && this.user?.organization_id) {
          participantData.organization_id = this.user.organization_id
        }
        
        // Trim string fields
        participantData.first_name = participantData.first_name.trim()
        participantData.last_name = participantData.last_name.trim()
        participantData.email = (participantData.email || '').trim()
        participantData.phone = (participantData.phone || '').trim()
        participantData.ndis_number = (participantData.ndis_number || '').trim()
        
        // Trim address fields
        if (participantData.address) {
          participantData.address.street = (participantData.address.street || '').trim()
          participantData.address.suburb = (participantData.address.suburb || '').trim()
          participantData.address.postcode = (participantData.address.postcode || '').trim()
        }
        
        // Fix date format
        if (participantData.date_of_birth) {
          participantData.date_of_birth = participantData.date_of_birth + 'T00:00:00Z'
        }
        
        console.log('Updating participant with data:', participantData)
        await this.updateParticipant(this.editingParticipant.id, participantData)
        this.filterParticipants()
        this.closeEditModal()
        showSuccessNotification('Participant updated successfully!')
      } catch (error) {
        console.error('Error updating participant:', error)
        showErrorNotification(error, 'Error updating participant. Please try again.')
      }
    },

    closeEditModal() {
      this.showEditModal = false
      this.editingParticipant = null
      this.resetForm()
    },

    deleteParticipantHandler(participant) {
      this.participantToDelete = participant
      this.showDeleteModal = true
    },

    async confirmDeleteParticipant() {
      if (!this.participantToDelete) return
      
      try {
        await this.deleteParticipant(this.participantToDelete.id)
        this.filterParticipants()
        this.closeDeleteModal()
        showSuccessNotification('Participant deleted successfully!')
      } catch (error) {
        console.error('Error deleting participant:', error)
        showErrorNotification(error, 'Error deleting participant. Please try again.')
      }
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.participantToDelete = null
    },

    closeModal() {
      this.showAddModal = false
      this.resetForm()
    },

    resetForm() {
      this.newParticipant = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        ndis_number: '',
        date_of_birth: '',
        address: {
          street: '',
          suburb: '',
          state: '',
          postcode: '',
          country: 'Australia'
        },
        medical_information: {
          conditions: '[]',
          medications: '[]',
          allergies: '[]',
          doctor_name: '',
          doctor_phone: '',
          notes: ''
        },
        emergency_contacts: []
      }
    },

    getInitials(firstName, lastName) {
      return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase()
    },

    calculateAge(dateString) {
      if (!dateString) return 'N/A'
      const birthDate = new Date(dateString)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return `${Math.ceil(diffDays / 365)} years ago`
    },

    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
      // Reset to show all participants
      this.filteredParticipants = [...this.participants]
      this.filterParticipants()
    },

    formatAddress(address) {
      if (!address) return 'No address provided'
      const parts = [address.street, address.suburb, address.state, address.postcode].filter(part => part && part.trim())
      return parts.length > 0 ? parts.join(', ') : 'No address provided'
    },


    async toggleParticipantStatus(participant) {
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      try {
        const newStatus = participant.is_active === false ? true : false
        const updateData = {
          is_active: newStatus
        }
        
        console.log('Toggling participant status:', participant.id, 'from:', participant.is_active, 'to:', newStatus)
        await this.updateParticipant(participant.id, updateData)
        
        // Update the local participant object immediately
        participant.is_active = newStatus
        
        // Refresh the full list to ensure consistency
        await this.loadParticipants()
        
        const statusText = newStatus ? 'activated' : 'deactivated'
        showSuccessNotification(`Participant ${statusText} successfully!`)
      } catch (error) {
        console.error('Error toggling participant status:', error)
        showErrorNotification(error, 'Error updating participant status. Please try again.')
        // Revert the local change on error
        participant.is_active = !participant.is_active
      } finally {
        this.isSubmitting = false
      }
    }
  },
  async mounted() {
    await this.loadParticipants()
  }
}
</script>

<style scoped>
/* ==========================================================================
   PARTICIPANTS PAGE - ENHANCED STYLES
   ========================================================================== */

/* Page Container */
.participants-container {
  padding: 1.5rem;
  background: var(--background, #fafafa);
  min-height: 100vh;
  border: none;
  box-shadow: none;
}

.participants-page {
  padding: 0;
  background: var(--background);
  min-height: 100vh;
}

/* Enhanced Page Header */
.page-header-enhanced {
  background: var(--white);
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.title-icon {
  width: 80px;
  height: 80px;
  background: var(--primary-gradient);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.title-icon i {
  font-size: 2.5rem;
  color: white;
}

.title-text .page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.title-text .page-subtitle {
  font-size: 1.125rem;
  color: var(--text-medium);
  margin: 0;
  font-weight: 400;
}

.header-actions .btn-enhanced {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.header-actions .btn-enhanced:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.header-actions .btn-enhanced i {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

/* Main Content Area */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

/* Enhanced Stats Cards */
.stats-overview-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card-enhanced {
  background: var(--white);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card-enhanced:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
}

.stat-card-enhanced .stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-card-enhanced .stat-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.stat-card-enhanced .stat-icon.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
}

.stat-card-enhanced .stat-content {
  flex: 1;
  text-align: right;
}

.stat-card-enhanced .stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-card-enhanced .stat-label {
  font-size: 1.125rem;
  color: var(--text-medium);
  font-weight: 500;
}

/* Search and Filter Bar */
.search-filter-bar {
  background: var(--white);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.search-input-wrapper {
  position: relative;
}

.search-input-wrapper .search-icon {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-medium);
  font-size: 1.125rem;
}

.search-input-enhanced {
  width: 100%;
  padding: 1rem 1.5rem 1rem 3.5rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
}

.search-input-enhanced:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
  background: white;
  transform: translateY(-2px);
}

.search-input-enhanced::placeholder {
  color: var(--text-light);
  font-weight: 400;
}

.controls-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select-enhanced {
  padding: 1rem 1.5rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  font-weight: 500;
  min-width: 160px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 20px;
  padding-right: 3rem;
  transition: all 0.3s ease;
}

.filter-select-enhanced:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.btn-clear {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-clear i {
  margin-right: 0.5rem;
}

.view-toggle-enhanced {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  padding: 0.5rem;
}

.view-btn-enhanced {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text-medium);
  font-size: 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.view-btn-enhanced:hover {
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.view-btn-enhanced.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Dark Theme Overrides */
[data-theme="dark"] .participants-page {
  background: var(--background);
}

[data-theme="dark"] .page-header-enhanced {
  background: var(--card-background);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .title-text .page-title {
  color: var(--text-dark);
}

[data-theme="dark"] .title-text .page-subtitle {
  color: var(--text-medium);
}

[data-theme="dark"] .stat-card-enhanced {
  background: var(--card-background);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .stat-card-enhanced .stat-number {
  color: var(--text-dark);
}

[data-theme="dark"] .stat-card-enhanced .stat-label {
  color: var(--text-medium);
}

[data-theme="dark"] .search-filter-bar {
  background: var(--card-background);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .search-input-enhanced {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-dark);
}

[data-theme="dark"] .search-input-enhanced:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-color);
}

[data-theme="dark"] .filter-select-enhanced {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-dark);
}

[data-theme="dark"] .view-toggle-enhanced {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .view-btn-enhanced {
  color: var(--text-medium);
}

[data-theme="dark"] .view-btn-enhanced:hover {
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.2);
}

/* Enhanced Stats Cards with Matching Colors */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 16px 16px 0 0;
}

.stat-card.primary::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card.success::before {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.warning::before {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.info::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card.primary:hover {
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
}

.stat-card.success:hover {
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);
}

.stat-card.warning:hover {
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.2);
}

.stat-card.info:hover {
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
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

.stat-icon.primary-icon {
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

.stat-icon.info-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
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

.stat-content p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Component-specific styles that extend the global theme */

.search-box {
  max-width: 400px;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-lg);
}

.participant-card {
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: var(--transition-normal);
  background: white;
}

.participant-card:hover {
  border-color: var(--primary-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.participant-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.participant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.participant-info {
  flex: 1;
}

.participant-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--gray-800);
  font-size: var(--font-size-lg);
}

.participant-ndis {
  margin: 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.participant-status {
  flex-shrink: 0;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
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
  background: linear-gradient(145deg, #667eea, #764ba2);
  box-shadow: 
    inset 2px 2px 5px rgba(102, 126, 234, 0.2),
    inset -2px -2px 5px rgba(118, 75, 162, 0.1),
    0 2px 8px rgba(102, 126, 234, 0.3);
}

input:focus + .slider {
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.2),
    inset 2px 2px 5px rgba(0, 0, 0, 0.1),
    inset -2px -2px 5px rgba(255, 255, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.1);
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

input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
}

input:disabled + .slider:before {
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
}

.slider:hover:not(input:disabled + .slider) {
  transform: translateY(-1px);
  box-shadow: 
    inset 2px 2px 5px rgba(0, 0, 0, 0.1),
    inset -2px -2px 5px rgba(255, 255, 255, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

input:checked + .slider:hover {
  box-shadow: 
    inset 2px 2px 5px rgba(102, 126, 234, 0.2),
    inset -2px -2px 5px rgba(118, 75, 162, 0.1),
    0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Enhanced status badge styling */
.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

.participant-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);
}

.participant-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participant-detail-item .label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gray-500);
  font-weight: 600;
}

.participant-detail-item .value {
  color: var(--gray-700);
  font-size: var(--font-size-sm);
}

.participant-actions {
  display: flex;
  gap: var(--space-xs);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--gray-200);
}

.participant-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
}

.detail-section h4 {
  margin: 0 0 var(--space-md) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  padding-bottom: var(--space-xs);
  border-bottom: 2px solid var(--primary-500);
}

.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--gray-100);
}

.detail-list li:last-child {
  border-bottom: none;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.detail-item .label {
  font-weight: 500;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.detail-item .value {
  font-weight: 600;
  color: var(--gray-800);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

@media (max-width: 768px) {
  .participants-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .participant-details-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== FILTER CONTROLS & VIEW TOGGLE ===== */
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
  gap: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-select {
  padding: 0.75rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 140px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
  background-color: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

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

.view-toggle {
  display: flex;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.view-btn-elegant {
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-width: 44px;
}

.view-btn-elegant:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-1px);
}

.view-btn-elegant.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.25);
}

.view-btn-elegant:not(:last-child) {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

/* ===== LIST VIEW STYLES ===== */
.participants-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1.5fr 1.5fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.header-cell {
  display: flex;
  align-items: center;
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1.5fr 1.5fr 1fr;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  margin-right: 12px;
  flex-shrink: 0;
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
  gap: 4px;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== GRID VIEW IMPROVEMENTS ===== */
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
  border: 1px solid transparent;
}

.participant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #e5e7eb;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  /* Filter controls responsive styles handled by global CSS */
  
  .list-header,
  .list-row {
    grid-template-columns: 1fr;
    gap: 8px;
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
  
  .list-cell {
    justify-content: space-between;
  }
  
  .participants-grid {
    grid-template-columns: 1fr;
  }
}

/* Elegant Button Styles */
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-cancel {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
  color: #475569;
  transform: translateY(-1px);
}

.btn-edit {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-edit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(250, 112, 154, 0.3);
}

.btn-view {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-view:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(67, 233, 123, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(250, 112, 154, 0.3);
}

.btn-sm {
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 6px;
  min-width: auto;
}

.btn-participant {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-participant:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

/* Updated search styling to match scheduling page */
.filters-section {
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 140px;
}

.view-toggle {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 12px;
  border: none;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid #e5e7eb;
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
}

/* Action buttons styling */
.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  min-width: 36px;
  min-height: 36px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.view-btn {
  background: #10b981;
  color: white;
}

.action-btn.view-btn:hover {
  background: #059669;
}

.action-btn.edit-btn {
  background: #3b82f6;
  color: white;
}

.action-btn.edit-btn:hover {
  background: #2563eb;
}

.action-btn.delete-btn {
  background: #ef4444;
  color: white;
}

.action-btn.delete-btn:hover {
  background: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Pagination styles */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.per-page-selector select {
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .filter-controls {
    justify-content: space-between;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
  
  .pagination {
    order: 2;
  }
  
  .pagination-info {
    order: 1;
    text-align: center;
  }
  
  .per-page-selector {
    order: 3;
  }
}

/* Enhanced Header Styles */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem !important;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border-radius: 12px;
  padding-left: 2rem;
  padding-right: 2rem;
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
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-content h1 {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 2.25rem !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
  margin: 0 !important;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content h1 i {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2rem;
  display: flex;
  align-items: center;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.2));
}

.header-content p {
  font-family: 'Inter', sans-serif;
  font-size: 1rem !important;
  font-weight: 400 !important;
  color: #64748b !important;
  margin: 0 !important;
  line-height: 1.5 !important;
  max-width: 600px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.25rem 1rem;
    margin-bottom: 1rem !important;
  }
  
  .header-content h1 {
    font-size: 1.875rem !important;
    text-align: center;
  }
  
  .header-content p {
    text-align: center;
    font-size: 0.9rem !important;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 1.625rem !important;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .page-header {
    padding: 1rem 0.75rem;
  }
}

</style>

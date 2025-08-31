<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Participants Management</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Add New Participant
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ participants.length }}</div>
          <div class="stat-label">Total Participants</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ activeParticipants }}</div>
          <div class="stat-label">Active</div>
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
        
        <!-- Filter Controls -->
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
        <div v-for="participant in filteredParticipants" :key="participant.id" class="participant-card">
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
            <button @click="viewParticipant(participant)" class="btn btn-success btn-sm">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editParticipant(participant)" class="btn btn-primary btn-sm">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteParticipant(participant)" class="btn btn-danger btn-sm">
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
        <div v-for="participant in filteredParticipants" :key="participant.id" class="list-row">
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
              <button @click="viewParticipant(participant)" class="btn btn-success btn-sm">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editParticipant(participant)" class="btn btn-primary btn-sm">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteParticipant(participant)" class="btn btn-danger btn-sm">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
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
                <label>First Name *</label>
                <input v-model="newParticipant.first_name" type="text" required placeholder="Enter first name" />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input v-model="newParticipant.last_name" type="text" required placeholder="Enter last name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input v-model="newParticipant.email" type="email" placeholder="Enter email address" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="newParticipant.phone" type="tel" placeholder="Enter phone number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>NDIS Number</label>
                <input v-model="newParticipant.ndis_number" type="text" placeholder="Enter NDIS number" />
              </div>
              <div class="form-group">
                <label>Date of Birth</label>
                <input v-model="newParticipant.date_of_birth" type="date" />
              </div>
            </div>
            <div class="form-group">
              <label>Street Address</label>
              <input v-model="newParticipant.address.street" type="text" placeholder="Enter street address" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Suburb</label>
                <input v-model="newParticipant.address.suburb" type="text" placeholder="Enter suburb" />
              </div>
              <div class="form-group">
                <label>State</label>
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
                <label>Postcode</label>
                <input v-model="newParticipant.address.postcode" type="text" placeholder="Postcode" />
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
                <label>First Name *</label>
                <input v-model="newParticipant.first_name" type="text" required placeholder="Enter first name" />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input v-model="newParticipant.last_name" type="text" required placeholder="Enter last name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input v-model="newParticipant.email" type="email" placeholder="Enter email address" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="newParticipant.phone" type="tel" placeholder="Enter phone number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>NDIS Number</label>
                <input v-model="newParticipant.ndis_number" type="text" placeholder="Enter NDIS number" />
              </div>
              <div class="form-group">
                <label>Date of Birth</label>
                <input v-model="newParticipant.date_of_birth" type="date" />
              </div>
            </div>
            <div class="form-group">
              <label>Street Address</label>
              <input v-model="newParticipant.address.street" type="text" placeholder="Enter street address" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Suburb</label>
                <input v-model="newParticipant.address.suburb" type="text" placeholder="Enter suburb" />
              </div>
              <div class="form-group">
                <label>State</label>
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
                <label>Postcode</label>
                <input v-model="newParticipant.address.postcode" type="text" placeholder="Postcode" />
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
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'Participants',
  data() {
    return {
      filteredParticipants: [],
      searchQuery: '',
      statusFilter: 'active',
      currentView: 'list',
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showViewModal: false,
      editingParticipant: null,
      participantToDelete: null,
      selectedParticipant: null,
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
    activeParticipants() {
      return this.participants.filter(p => p.is_active !== false).length
    }
  },
  methods: {
    ...mapActions(useParticipantsStore, ['fetchParticipants', 'createParticipant', 'updateParticipant', 'deleteParticipant']),
    async loadParticipants() {
      try {
        await this.fetchParticipants()
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
      
      // Sort by last name, then first name
      filtered.sort((a, b) => {
        const lastNameComparison = (a.last_name || '').localeCompare(b.last_name || '')
        if (lastNameComparison !== 0) return lastNameComparison
        return (a.first_name || '').localeCompare(b.first_name || '')
      })
      
      this.filteredParticipants = filtered
    },

    async addParticipant() {
      if (!this.validateParticipantForm()) {
        return
      }
      
      try {
        // Validate and prepare data
        const participantData = { ...this.newParticipant }
        
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
        
        console.log('Creating participant with data:', participantData)
        await this.createParticipant(participantData)
        this.filterParticipants()
        this.closeModal()
        showSuccessNotification('Participant added successfully!')
      } catch (error) {
        console.error('Error adding participant:', error)
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
      this.isSubmitting = true
      try {
        const updateData = {
          is_active: !participant.is_active
        }
        
        console.log('Toggling participant status:', participant.id, 'to:', updateData.is_active)
        await this.updateParticipant(participant.id, updateData)
        await this.fetchParticipants()
        this.filterParticipants()
        
        const statusText = updateData.is_active ? 'activated' : 'deactivated'
        showSuccessNotification(`Participant ${statusText} successfully!`)
      } catch (error) {
        console.error('Error toggling participant status:', error)
        showErrorNotification(error, 'Error updating participant status. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    get isSubmitting() {
      return this.isLoading
    }
  },
  async mounted() {
    await this.loadParticipants()
  }
}
</script>

<style scoped>
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
  width: 44px;
  height: 24px;
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
  background-color: var(--gray-400);
  transition: var(--transition-normal);
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-normal);
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-500);
}

input:focus + .slider {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
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

</style>

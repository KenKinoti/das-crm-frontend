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
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search participants..."
          @input="filterParticipants"
        />
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

      <div v-else class="participants-grid">
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
            <div class="detail-item">
              <i class="fas fa-envelope"></i>
              <span>{{ participant.email || 'No email provided' }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-phone"></i>
              <span>{{ participant.phone || 'No phone provided' }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>Added {{ formatDate(participant.created_at) }}</span>
            </div>
          </div>
          <div class="participant-actions">
            <button @click="viewParticipant(participant)" class="btn-small btn-view">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="editParticipant(participant)" class="btn-small btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteParticipantHandler(participant)" class="btn-small btn-delete">
              <i class="fas fa-trash"></i>
              Delete
            </button>
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
                <select v-model="newParticipant.address.state">
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
                <select v-model="newParticipant.address.state">
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

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return date.toLocaleDateString()
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
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-dark);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-icon.success {
  background: var(--success-gradient);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-medium);
}

.filters-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.content-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  padding: 2rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 4rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-medium);
  margin-bottom: 2rem;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.participant-card {
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.participant-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-soft);
  transform: translateY(-2px);
}

.participant-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.participant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.participant-info {
  flex: 1;
}

.participant-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--text-dark);
  font-size: 1.1rem;
}

.participant-ndis {
  margin: 0;
  color: var(--text-medium);
  font-size: 0.9rem;
}

.participant-status {
  flex-shrink: 0;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Toggle Switch Styles */
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
  background-color: #ccc;
  transition: .4s;
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
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color, #667eea);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-color, #667eea);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.participant-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-medium);
}

.detail-item i {
  width: 16px;
  color: var(--text-light);
}

.participant-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: var(--text-medium);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.btn-danger {
  background: transparent;
  border: 1px solid #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background: #dc2626;
  color: white;
}

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
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: var(--text-dark);
  background: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  transition: border-color 0.3s ease;
  font-size: 1rem;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Premium Button System */
.btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.btn:not(:disabled):active {
  transform: scale(0.98);
}

.btn-small {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  min-width: 90px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.btn-secondary {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

.btn-outline {
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

/* New Color Scheme Buttons */
.btn-view {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-view:hover:not(:disabled) {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-edit:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

.btn-cancel {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.btn-cancel:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

.btn-start {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-start:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-schedule {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-schedule:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Notifications */
:global(.success-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

:global(.error-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #dc2626;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .participants-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .participant-actions {
    flex-wrap: wrap;
  }
}

/* Delete Modal Styles */
.delete-modal {
  max-width: 500px;
}

.delete-confirmation {
  text-align: center;
}

.delete-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.delete-confirmation h4 {
  color: var(--text-dark);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.participant-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.participant-summary p {
  margin: 0.5rem 0;
  display: flex;
  justify-content: space-between;
}

.participant-summary strong {
  color: var(--text-medium);
}

.warning-text {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 1rem;
  color: #92400e;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

/* View Modal Styles */
.view-modal {
  max-width: 700px;
}

.participant-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section .detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-section .detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 500;
  color: var(--text-medium);
}

.detail-item .value {
  font-weight: 600;
  color: var(--text-dark);
}
</style>

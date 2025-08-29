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
              <span :class="['status-badge', participant.is_active ? 'active' : 'inactive']">
                {{ participant.is_active ? 'Active' : 'Inactive' }}
              </span>
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
            <button @click="viewParticipant(participant)" class="btn-small btn-outline">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="editParticipant(participant)" class="btn-small btn-outline">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteParticipantHandler(participant)" class="btn-small btn-danger">
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
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
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
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useParticipantsStore } from '../stores/participants'

export default {
  name: 'Participants',
  data() {
    return {
      filteredParticipants: [],
      searchQuery: '',
      showAddModal: false,
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
    ...mapActions(useParticipantsStore, ['fetchParticipants', 'createParticipant', 'deleteParticipant']),
    async loadParticipants() {
      try {
        await this.fetchParticipants()
        this.filterParticipants()
      } catch (error) {
        console.error('Error loading participants:', error)
        this.showErrorMessage('Failed to load participants. Please try again.')
      }
    },

    filterParticipants() {
      let filtered = [...this.participants]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(p => 
          p.first_name.toLowerCase().includes(query) ||
          p.last_name.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query) ||
          p.phone?.includes(query) ||
          p.ndis_number?.includes(query)
        )
      }
      
      this.filteredParticipants = filtered
    },

    async addParticipant() {
      try {
        // Fix date format - convert YYYY-MM-DD to ISO 8601
        const participantData = { ...this.newParticipant }
        if (participantData.date_of_birth) {
          participantData.date_of_birth = participantData.date_of_birth + 'T00:00:00Z'
        }
        
        await this.createParticipant(participantData)
        this.filterParticipants()
        this.closeModal()
        this.showSuccessMessage('Participant added successfully!')
      } catch (error) {
        console.error('Error adding participant:', error)
        this.showErrorMessage(error.response?.data?.error?.message || 'Error adding participant. Please try again.')
      }
    },

    viewParticipant(participant) {
      alert(`👤 ${participant.first_name} ${participant.last_name}\n📧 ${participant.email || 'No email'}\n📞 ${participant.phone || 'No phone'}\n🆔 NDIS: ${participant.ndis_number || 'Not provided'}`)
    },

    editParticipant(participant) {
      // For now, just show an alert. In full implementation, this would open an edit modal
      alert(`Edit functionality for ${participant.first_name} ${participant.last_name} - Coming soon!`)
    },

    async deleteParticipantHandler(participant) {
      if (confirm(`Are you sure you want to delete ${participant.first_name} ${participant.last_name}?`)) {
        try {
          await this.deleteParticipant(participant.id)
          this.filterParticipants()
          this.showSuccessMessage('Participant deleted successfully!')
        } catch (error) {
          console.error('Error deleting participant:', error)
          this.showErrorMessage('Error deleting participant. Please try again.')
        }
      }
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

    showSuccessMessage(message) {
      // Simple success notification
      const notification = document.createElement('div')
      notification.className = 'success-notification'
      notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 3000)
    },

    showErrorMessage(message) {
      // Simple error notification
      const notification = document.createElement('div')
      notification.className = 'error-notification'
      notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 5000)
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

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: var(--text-medium);
}

.btn-secondary:hover {
  background: #e2e8f0;
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
</style>

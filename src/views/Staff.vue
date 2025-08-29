<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Staff Management</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-user-plus"></i>
        Add New Staff Member
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-nurse"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ staff.length }}</div>
          <div class="stat-label">Total Staff</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ activeStaff }}</div>
          <div class="stat-label">Active</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ availableToday }}</div>
          <div class="stat-label">Available Today</div>
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
          placeholder="Search staff members..."
          @input="filterStaff"
        />
      </div>
      <div class="filter-controls">
        <select v-model="roleFilter" @change="filterStaff">
          <option value="">All Roles</option>
          <option value="care_worker">Care Worker</option>
          <option value="support_coordinator">Support Coordinator</option>
          <option value="manager">Manager</option>
          <option value="admin">Administrator</option>
        </select>
        <select v-model="statusFilter" @change="filterStaff">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Staff List -->
    <div class="content-card">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading staff members...</p>
      </div>

      <div v-else-if="filteredStaff.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-user-nurse"></i>
        <h3>No Staff Members Yet</h3>
        <p>Get started by adding your first staff member</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Add First Staff Member
        </button>
      </div>

      <div v-else-if="filteredStaff.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <div v-else class="staff-grid">
        <div v-for="member in filteredStaff" :key="member.id" class="staff-card">
          <div class="staff-header">
            <div class="staff-avatar">
              {{ getInitials(member.first_name, member.last_name) }}
            </div>
            <div class="staff-info">
              <h3>{{ member.first_name }} {{ member.last_name }}</h3>
              <p class="staff-role">{{ formatRole(member.role) }}</p>
            </div>
            <div class="staff-status">
              <span :class="['status-badge', member.is_active ? 'active' : 'inactive']">
                {{ member.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <div class="staff-details">
            <div class="detail-item">
              <i class="fas fa-envelope"></i>
              <span>{{ member.email }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-phone"></i>
              <span>{{ member.phone || 'No phone provided' }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>Added {{ formatDate(member.created_at) }}</span>
            </div>
          </div>
          <div class="staff-actions">
            <button @click="viewStaff(member)" class="btn-small btn-outline">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="scheduleStaff(member)" class="btn-small btn-outline">
              <i class="fas fa-calendar-plus"></i>
              Schedule
            </button>
            <button @click="editStaff(member)" class="btn-small btn-outline">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteStaff(member)" class="btn-small btn-danger">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Staff Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Staff Member</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addStaff">
            <div class="form-row">
              <div class="form-group">
                <label>First Name *</label>
                <input v-model="newStaff.first_name" type="text" required placeholder="Enter first name" />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input v-model="newStaff.last_name" type="text" required placeholder="Enter last name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input v-model="newStaff.email" type="email" required placeholder="Enter email address" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="newStaff.phone" type="tel" placeholder="Enter phone number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Role *</label>
                <select v-model="newStaff.role" required>
                  <option value="">Select Role</option>
                  <option value="care_worker">Care Worker</option>
                  <option value="support_coordinator">Support Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="form-group">
                <label>Password *</label>
                <input v-model="newStaff.password" type="password" required placeholder="Default password" />
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
                  Add Staff Member
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
import { useUsersStore } from '../stores/users'

export default {
  name: 'Staff',
  data() {
    return {
      filteredStaff: [],
      searchQuery: '',
      roleFilter: '',
      statusFilter: '',
      showAddModal: false,
      newStaff: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        password: 'defaultpassword123' // Will need to be changed
      }
    }
  },
  computed: {
    ...mapState(useUsersStore, { staff: 'users', isLoading: 'isLoading', error: 'error' }),
    activeStaff() {
      return this.staff.filter(s => s.is_active).length
    },
    availableToday() {
      return this.staff.filter(s => s.role !== 'admin' && s.is_active).length
    }
  },
  methods: {
    ...mapActions(useUsersStore, ['fetchUsers', 'createUser', 'deleteUser']),
    
    async loadStaff() {
      try {
        await this.fetchUsers()
        this.filterStaff()
      } catch (error) {
        console.error('Error loading staff:', error)
        this.showErrorMessage('Failed to load staff. Please try again.')
      }
    },

    filterStaff() {
      let filtered = [...this.staff]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(s => 
          s.first_name.toLowerCase().includes(query) ||
          s.last_name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.phone?.includes(query) ||
          s.employee_id?.toLowerCase().includes(query)
        )
      }
      
      if (this.roleFilter) {
        filtered = filtered.filter(s => s.role === this.roleFilter)
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(s => 
          this.statusFilter === 'active' ? s.is_active : !s.is_active
        )
      }
      
      this.filteredStaff = filtered
    },

    async addStaff() {
      try {
        await this.createUser(this.newStaff)
        this.filterStaff()
        this.closeModal()
        this.showSuccessMessage('Staff member added successfully!')
      } catch (error) {
        console.error('Error adding staff:', error)
        this.showErrorMessage('Error adding staff member. Please try again.')
      }
    },

    viewStaff(member) {
      alert(`👤 ${member.first_name} ${member.last_name}\n📧 ${member.email}\n📞 ${member.phone || 'No phone'}\n💼 ${this.formatRole(member.role)}`)
    },

    scheduleStaff(member) {
      alert(`Schedule functionality for ${member.first_name} ${member.last_name} - This would open the scheduling interface`)
    },

    editStaff(member) {
      alert(`Edit functionality for ${member.first_name} ${member.last_name} - Coming soon!`)
    },

    async deleteStaff(member) {
      if (confirm(`Are you sure you want to remove ${member.first_name} ${member.last_name} from staff?`)) {
        try {
          await this.deleteUser(member.id)
          this.filterStaff()
          this.showSuccessMessage('Staff member removed successfully!')
        } catch (error) {
          console.error('Error deleting staff:', error)
          this.showErrorMessage('Error removing staff member. Please try again.')
        }
      }
    },

    closeModal() {
      this.showAddModal = false
      this.resetForm()
    },

    resetForm() {
      this.newStaff = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        password: 'defaultpassword123'
      }
    },

    getInitials(firstName, lastName) {
      return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase()
    },

    formatRole(role) {
      const roleMap = {
        'care_worker': 'Care Worker',
        'support_coordinator': 'Support Coordinator',
        'manager': 'Manager',
        'admin': 'Administrator'
      }
      return roleMap[role] || role
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
      return date.toLocaleDateString()
    },

    showSuccessMessage(message) {
      const notification = document.createElement('div')
      notification.className = 'success-notification'
      notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 3000)
    },

    showErrorMessage(message) {
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
    await this.loadStaff()
  }
}
</script>

<style scoped>
/* Base styles - same as Participants */
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

.stat-icon.warning {
  background: var(--warning-gradient);
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
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
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

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-controls select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.content-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  padding: 2rem;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.staff-card {
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.staff-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-soft);
  transform: translateY(-2px);
}

.staff-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.staff-avatar {
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

.staff-info {
  flex: 1;
}

.staff-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--text-dark);
  font-size: 1.1rem;
}

.staff-role {
  margin: 0 0 0.25rem 0;
  color: var(--primary-color);
  font-size: 0.9rem;
  font-weight: 500;
}

.staff-employee-id {
  margin: 0;
  color: var(--text-medium);
  font-size: 0.8rem;
}

.staff-status {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
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

.availability-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.availability-badge.available {
  background: #dbeafe;
  color: #1e40af;
}

.availability-badge.unavailable {
  background: #fef3c7;
  color: #92400e;
}

.staff-details {
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

.staff-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

/* Modal styles - same as Participants */
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
  max-width: 700px;
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
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
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

/* Loading and Empty states */
.loading-state,
.empty-state {
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

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .filter-controls {
    flex-direction: column;
  }

  .staff-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .staff-actions {
    justify-content: center;
  }
}
</style>

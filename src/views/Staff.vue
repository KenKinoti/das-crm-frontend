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

    <!-- Edit Staff Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Staff Member</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateEditedStaff">
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
                <label>Email</label>
                <input v-model="newStaff.email" type="email" placeholder="Enter email address" />
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
                <label>New Password (optional)</label>
                <input v-model="newStaff.password" type="password" placeholder="Leave blank to keep current password" />
                <small class="form-help">Only enter a password if you want to change it</small>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Updating...
                </span>
                <span v-else>
                  <i class="fas fa-save"></i>
                  Update Staff Member
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal && staffToDelete" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Remove Staff Member</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="delete-confirmation">
            <div class="delete-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Are you sure you want to remove this staff member?</h4>
            <div class="staff-summary">
              <p><strong>Name:</strong> {{ staffToDelete.first_name }} {{ staffToDelete.last_name }}</p>
              <p><strong>Email:</strong> {{ staffToDelete.email }}</p>
              <p><strong>Phone:</strong> {{ staffToDelete.phone || 'Not provided' }}</p>
              <p><strong>Role:</strong> {{ formatRole(staffToDelete.role) }}</p>
            </div>
            <p class="warning-text">
              <i class="fas fa-exclamation-circle"></i>
              This action cannot be undone. The staff member will be removed from the system and will lose access to their account.
            </p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmDeleteStaff" class="btn btn-danger" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              Removing...
            </span>
            <span v-else>
              <i class="fas fa-user-times"></i>
              Remove Staff Member
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Staff Modal -->
    <div v-if="showViewModal && selectedStaffMember" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h3>Staff Member Details</h3>
          <button @click="closeViewModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="staff-detail-grid">
            <div class="detail-section">
              <h4><i class="fas fa-user"></i> Personal Information</h4>
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value">{{ selectedStaffMember.first_name }} {{ selectedStaffMember.last_name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ selectedStaffMember.email }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Phone:</span>
                <span class="value">{{ selectedStaffMember.phone || 'Not provided' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-briefcase"></i> Role & Status</h4>
              <div class="detail-item">
                <span class="label">Role:</span>
                <span class="value">{{ formatRole(selectedStaffMember.role) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['status-badge', selectedStaffMember.is_active ? 'active' : 'inactive']">
                  {{ selectedStaffMember.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Added:</span>
                <span class="value">{{ formatDate(selectedStaffMember.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeViewModal" class="btn btn-secondary">Close</button>
            <button @click="editStaff(selectedStaffMember); closeViewModal()" class="btn btn-outline">
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
import { useUsersStore } from '../stores/users'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'Staff',
  data() {
    return {
      filteredStaff: [],
      searchQuery: '',
      roleFilter: '',
      statusFilter: '',
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showViewModal: false,
      editingStaff: null,
      staffToDelete: null,
      selectedStaffMember: null,
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
    ...mapActions(useUsersStore, ['fetchUsers', 'createUser', 'updateUser', 'deleteUser']),
    
    async loadStaff() {
      try {
        await this.fetchUsers()
        this.filterStaff()
      } catch (error) {
        console.error('Error loading staff:', error)
        showErrorNotification(error, 'Failed to load staff. Please try again.')
      }
    },

    filterStaff() {
      let filtered = [...this.staff]
      
      // Search functionality
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(s => {
          const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
          const roleFormatted = this.formatRole(s.role).toLowerCase()
          
          return fullName.includes(query) ||
                 (s.first_name && s.first_name.toLowerCase().includes(query)) ||
                 (s.last_name && s.last_name.toLowerCase().includes(query)) ||
                 (s.email && s.email.toLowerCase().includes(query)) ||
                 (s.phone && s.phone.includes(query)) ||
                 (s.employee_id && s.employee_id.toLowerCase().includes(query)) ||
                 roleFormatted.includes(query)
        })
      }
      
      // Role filter
      if (this.roleFilter) {
        filtered = filtered.filter(s => s.role === this.roleFilter)
      }
      
      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(s => 
          this.statusFilter === 'active' ? s.is_active : !s.is_active
        )
      }
      
      // Sort by last name, then first name
      filtered.sort((a, b) => {
        const lastNameComparison = (a.last_name || '').localeCompare(b.last_name || '')
        if (lastNameComparison !== 0) return lastNameComparison
        return (a.first_name || '').localeCompare(b.first_name || '')
      })
      
      this.filteredStaff = filtered
    },

    async addStaff() {
      if (!this.validateStaffForm()) {
        return
      }
      
      try {
        // Prepare and validate data
        const staffData = { ...this.newStaff }
        
        // Trim string fields
        staffData.first_name = staffData.first_name.trim()
        staffData.last_name = staffData.last_name.trim()
        staffData.email = (staffData.email || '').trim()
        staffData.phone = (staffData.phone || '').trim()
        
        console.log('Creating staff with data:', staffData)
        await this.createUser(staffData)
        this.filterStaff()
        this.closeModal()
        showSuccessNotification('Staff member added successfully!')
      } catch (error) {
        console.error('Error adding staff:', error)
        showErrorNotification(error, 'Error adding staff member. Please try again.')
      }
    },

    validateStaffForm(isEdit = false) {
      if (!this.newStaff.first_name || !this.newStaff.first_name.trim()) {
        showErrorNotification(new Error('First name is required'))
        return false
      }
      if (!this.newStaff.last_name || !this.newStaff.last_name.trim()) {
        showErrorNotification(new Error('Last name is required'))
        return false
      }
      // Email is optional but must be valid if provided
      if (this.newStaff.email && this.newStaff.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(this.newStaff.email.trim())) {
          showErrorNotification(new Error('Please enter a valid email address'))
          return false
        }
      }
      if (!this.newStaff.role) {
        showErrorNotification(new Error('Please select a role'))
        return false
      }
      if (!isEdit && (!this.newStaff.password || this.newStaff.password.trim().length < 6)) {
        showErrorNotification(new Error('Password must be at least 6 characters long'))
        return false
      }
      if (isEdit && this.newStaff.password && this.newStaff.password.trim().length < 6) {
        showErrorNotification(new Error('If changing password, it must be at least 6 characters long'))
        return false
      }
      return true
    },

    viewStaff(member) {
      this.selectedStaffMember = member
      this.showViewModal = true
    },

    closeViewModal() {
      this.showViewModal = false
      this.selectedStaffMember = null
    },

    scheduleStaff(member) {
      alert(`Schedule functionality for ${member.first_name} ${member.last_name} - This would open the scheduling interface`)
    },

    editStaff(member) {
      this.editingStaff = { ...member }
      // Pre-populate the form
      this.newStaff = {
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || '',
        password: '' // Don't pre-populate password for security
      }
      this.showEditModal = true
    },

    async updateEditedStaff() {
      if (!this.validateStaffForm(true)) {
        return
      }
      
      try {
        // Prepare data for update
        const staffData = { ...this.newStaff }
        
        // Trim string fields
        staffData.first_name = staffData.first_name.trim()
        staffData.last_name = staffData.last_name.trim()
        staffData.email = (staffData.email || '').trim()
        staffData.phone = (staffData.phone || '').trim()
        
        // Only include password if it was changed
        if (!staffData.password.trim()) {
          delete staffData.password
        }
        
        console.log('Updating staff with data:', staffData)
        await this.updateUser(this.editingStaff.id, staffData)
        this.filterStaff()
        this.closeEditModal()
        showSuccessNotification('Staff member updated successfully!')
      } catch (error) {
        console.error('Error updating staff:', error)
        showErrorNotification(error, 'Error updating staff member. Please try again.')
      }
    },

    closeEditModal() {
      this.showEditModal = false
      this.editingStaff = null
      this.resetForm()
    },

    deleteStaff(member) {
      this.staffToDelete = member
      this.showDeleteModal = true
    },

    async confirmDeleteStaff() {
      if (!this.staffToDelete) return
      
      try {
        await this.deleteUser(this.staffToDelete.id)
        this.filterStaff()
        this.closeDeleteModal()
        showSuccessNotification('Staff member removed successfully!')
      } catch (error) {
        console.error('Error deleting staff:', error)
        showErrorNotification(error, 'Error removing staff member. Please try again.')
      }
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.staffToDelete = null
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

.staff-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.staff-summary p {
  margin: 0.5rem 0;
  display: flex;
  justify-content: space-between;
}

.staff-summary strong {
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

.form-help {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 4px;
  display: block;
}

/* View Modal Styles */
.view-modal {
  max-width: 700px;
}

.staff-detail-grid {
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

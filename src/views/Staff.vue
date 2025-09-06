<template>
  <div class="participants-container">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-shimmer" v-if="isLoading"></div>
      <div class="header-content">
        <h1>
          <i class="fas fa-user-nurse"></i>
          Staff Management
        </h1>
        <p>Manage staff members, roles, schedules, and organizational assignments</p>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Add Staff Member
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card info">
        <div class="stat-icon info-icon">
          <i class="fas fa-user-nurse"></i>
        </div>
        <div class="stat-content">
          <h3>{{ staff.length }}</h3>
          <p>Total Staff</p>
        </div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-icon success-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ activeStaffCount }}</h3>
          <p>Active</p>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon warning-icon">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ inactiveStaffCount }}</h3>
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
            placeholder="Search staff members..." 
            class="form-input"
            @input="filterStaff"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterStaff" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select v-model="roleFilter" @change="filterStaff" class="form-select">
            <option value="">All Roles</option>
            <option value="care_worker">Care Worker</option>
            <option value="support_coordinator">Support Coordinator</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
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

    <!-- Staff List/Grid -->
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

      <!-- Grid View -->
      <div v-else-if="currentView === 'grid'" class="participants-grid">
        <div v-for="member in paginatedStaff" :key="member.id" class="participant-card">
          <div class="participant-header">
            <div class="participant-avatar">
              {{ getInitials(member.first_name, member.last_name) }}
            </div>
            <div class="participant-info">
              <h3>{{ member.first_name }} {{ member.last_name }}</h3>
              <p class="participant-ndis">{{ formatRole(member.role) }}</p>
            </div>
            <div class="participant-status">
              <div class="status-toggle">
                <label class="toggle-switch">
                  <input 
                    type="checkbox" 
                    :checked="member.is_active !== false"
                    @change="toggleStaffStatus(member)"
                    :disabled="isSubmitting"
                  />
                  <span class="slider"></span>
                </label>
                <span :class="['status-badge', member.is_active !== false ? 'active' : 'inactive']">
                  {{ member.is_active !== false ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="participant-details">
            <div class="detail-row">
              <i class="fas fa-phone"></i>
              <span>{{ member.phone || 'No phone' }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-envelope"></i>
              <span>{{ member.email || 'No email' }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-building"></i>
              <span>{{ member.organization || 'No organization' }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-calendar-alt"></i>
              <span>Joined {{ formatDate(member.created_at) }}</span>
            </div>
          </div>
          
          <div class="participant-actions">
            <button @click="viewStaffMember(member)" class="action-btn view-btn" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editStaffMember(member)" class="action-btn edit-btn" title="Edit Staff">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteStaffMember(member)" class="action-btn delete-btn" title="Delete Staff">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else class="participants-list">
        <div class="list-header">
          <div class="header-cell">Name</div>
          <div class="header-cell">Role</div>
          <div class="header-cell">Contact</div>
          <div class="header-cell">Organization</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>
        <div v-for="member in paginatedStaff" :key="member.id" class="list-row">
          <div class="list-cell" data-label="Name">
            <div class="user-info">
              <div class="participant-avatar">
                {{ getInitials(member.first_name, member.last_name) }}
              </div>
              <div class="participant-name">
                <span class="name">{{ member.first_name }} {{ member.last_name }}</span>
                <span class="email">{{ member.email }}</span>
              </div>
            </div>
          </div>
          <div class="list-cell" data-label="Role">
            <span class="role-badge" :class="'role-' + member.role">{{ formatRole(member.role) }}</span>
          </div>
          <div class="list-cell" data-label="Contact">
            <div class="contact-info">
              <div><i class="fas fa-envelope"></i> {{ member.email || 'No email' }}</div>
              <div><i class="fas fa-phone"></i> {{ member.phone || 'No phone' }}</div>
            </div>
          </div>
          <div class="list-cell" data-label="Organization">
            {{ member.organization || 'Not assigned' }}
          </div>
          <div class="list-cell" data-label="Status">
            <div class="status-toggle">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  :checked="member.is_active !== false"
                  @change="toggleStaffStatus(member)"
                  :disabled="isSubmitting"
                />
                <span class="slider"></span>
              </label>
              <span :class="['status-badge', member.is_active !== false ? 'active' : 'inactive']">
                {{ member.is_active !== false ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <div class="list-cell" data-label="Actions">
            <div class="action-buttons">
              <button @click="viewStaffMember(member)" class="action-btn view-btn" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editStaffMember(member)" class="action-btn edit-btn" title="Edit Staff">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteStaffMember(member)" class="action-btn delete-btn" title="Delete Staff">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, allFilteredStaff.length) }} of {{ allFilteredStaff.length }} staff members
        </div>
        
        <div class="pagination">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1" 
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page" 
              @click="goToPage(page)" 
              :class="['pagination-btn', { active: page === currentPage }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages" 
            class="pagination-btn"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="per-page-selector">
          <span>Show</span>
          <select v-model.number="itemsPerPage" @change="handlePerPageChange">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>per page</span>
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
                <label class="form-label">First Name *</label>
                <input 
                  v-model="newStaff.first_name" 
                  type="text" 
                  required 
                  placeholder="Enter first name"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  v-model="newStaff.last_name" 
                  type="text" 
                  required 
                  placeholder="Enter last name"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input 
                  v-model="newStaff.email" 
                  type="email" 
                  required 
                  placeholder="email@example.com"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input 
                  v-model="newStaff.phone" 
                  type="tel" 
                  placeholder="+61 4XX XXX XXX"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Role *</label>
                <select v-model="newStaff.role" required class="form-input">
                  <option value="care_worker">Care Worker</option>
                  <option value="support_coordinator">Support Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Employee ID</label>
                <input 
                  v-model="newStaff.employee_id" 
                  type="text" 
                  placeholder="EMP001"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Department</label>
                <input 
                  v-model="newStaff.department" 
                  type="text" 
                  placeholder="e.g., Nursing, Support Services"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Hire Date</label>
                <input 
                  v-model="newStaff.hire_date" 
                  type="date" 
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <input 
                  v-model="newStaff.is_active" 
                  type="checkbox"
                />
                Active Staff Member
              </label>
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
                <label class="form-label">First Name *</label>
                <input 
                  v-model="newStaff.first_name" 
                  type="text" 
                  required 
                  placeholder="Enter first name"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  v-model="newStaff.last_name" 
                  type="text" 
                  required 
                  placeholder="Enter last name"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input 
                  v-model="newStaff.email" 
                  type="email" 
                  required 
                  placeholder="email@example.com"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input 
                  v-model="newStaff.phone" 
                  type="tel" 
                  placeholder="+61 4XX XXX XXX"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Role *</label>
                <select v-model="newStaff.role" required class="form-input">
                  <option value="care_worker">Care Worker</option>
                  <option value="support_coordinator">Support Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Employee ID</label>
                <input 
                  v-model="newStaff.employee_id" 
                  type="text" 
                  placeholder="EMP001"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Department</label>
                <input 
                  v-model="newStaff.department" 
                  type="text" 
                  placeholder="e.g., Nursing, Support Services"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Hire Date</label>
                <input 
                  v-model="newStaff.hire_date" 
                  type="date" 
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <input 
                  v-model="newStaff.is_active" 
                  type="checkbox"
                />
                Active Staff Member
              </label>
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
          <h3>Delete Staff Member</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="delete-confirmation">
            <div class="delete-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Are you sure you want to delete this staff member?</h4>
            <div class="participant-summary">
              <p><strong>Name:</strong> {{ staffToDelete.first_name }} {{ staffToDelete.last_name }}</p>
              <p><strong>Email:</strong> {{ staffToDelete.email || 'Not provided' }}</p>
              <p><strong>Phone:</strong> {{ staffToDelete.phone || 'Not provided' }}</p>
              <p><strong>Role:</strong> {{ formatRole(staffToDelete.role) }}</p>
            </div>
            <p class="warning-text">
              <i class="fas fa-exclamation-circle"></i>
              This action cannot be undone. All staff data including schedules, shifts, and records will be permanently deleted.
            </p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn btn-view">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmDeleteStaff" class="btn btn-delete" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              Deleting...
            </span>
            <span v-else>
              <i class="fas fa-trash"></i>
              Delete Staff Member
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Staff Modal -->
    <div v-if="showViewModal && selectedStaff" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h3>Staff Member Details</h3>
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
                <span class="value">{{ selectedStaff.first_name }} {{ selectedStaff.last_name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ selectedStaff.email || 'Not provided' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Phone:</span>
                <span class="value">{{ selectedStaff.phone || 'Not provided' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Employee ID:</span>
                <span class="value">{{ selectedStaff.employee_id || 'Not assigned' }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h4><i class="fas fa-briefcase"></i> Work Information</h4>
              <div class="detail-item">
                <span class="label">Role:</span>
                <span class="value">{{ formatRole(selectedStaff.role) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Department:</span>
                <span class="value">{{ selectedStaff.department || 'Not assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Organization:</span>
                <span class="value">{{ selectedStaff.organization || 'Not assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['value', 'status-badge', selectedStaff.is_active !== false ? 'active' : 'inactive']">
                  {{ selectedStaff.is_active !== false ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Hire Date:</span>
                <span class="value">{{ formatDate(selectedStaff.hire_date) || 'Not recorded' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Member Since:</span>
                <span class="value">{{ formatDate(selectedStaff.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeViewModal" class="btn btn-view">Close</button>
            <button @click="editStaffMember(selectedStaff); closeViewModal()" class="btn btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteStaffMember(selectedStaff); closeViewModal()" class="btn btn-delete">
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
import { useUsersStore } from '../stores/users'
import { useAuthStore } from '../stores/auth'
import { useOrganizationContextStore } from '../stores/organizationContext'
import { showSuccessNotification, showErrorNotification } from '../utils/notifications'

export default {
  name: 'Staff',
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      roleFilter: '',
      currentView: 'grid',
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showViewModal: false,
      editingStaff: null,
      staffToDelete: null,
      selectedStaff: null,
      isSubmitting: false,
      newStaff: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'care_worker',
        employee_id: '',
        department: '',
        hire_date: '',
        is_active: true
      },
      // Pagination
      itemsPerPage: 25,
      currentPage: 1,
      filteredStaffData: []
    }
  },
  computed: {
    ...mapState(useUsersStore, ['users', 'isLoading']),
    ...mapState(useAuthStore, ['user', 'isAdmin', 'isSuperAdmin']),
    ...mapState(useOrganizationContextStore, ['currentOrganization']),
    
    // Map users to staff for compatibility
    staff() {
      return this.users || []
    },
    
    // Stats computed properties
    activeStaffCount() {
      return this.staff.filter(s => s.is_active !== false).length
    },
    
    inactiveStaffCount() {
      return this.staff.filter(s => s.is_active === false).length
    },
    
    newThisMonth() {
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      return this.staff.filter(s => {
        if (!s.created_at) return false
        const createdDate = new Date(s.created_at)
        return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear
      }).length
    },
    
    // Filtered staff based on search and filters
    allFilteredStaff() {
      let filtered = [...this.staff]
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(s => {
          const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
          const email = (s.email || '').toLowerCase()
          const phone = (s.phone || '').toLowerCase()
          return fullName.includes(query) || email.includes(query) || phone.includes(query)
        })
      }
      
      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(s => {
          if (this.statusFilter === 'active') return s.is_active !== false
          if (this.statusFilter === 'inactive') return s.is_active === false
          return true
        })
      }
      
      // Apply role filter
      if (this.roleFilter) {
        filtered = filtered.filter(s => s.role === this.roleFilter)
      }
      
      return filtered
    },
    
    filteredStaff() {
      // For compatibility with existing code
      return this.paginatedStaff
    },
    
    // Pagination computed properties
    totalPages() {
      return Math.ceil(this.allFilteredStaff.length / this.itemsPerPage)
    },
    
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    
    endIndex() {
      return this.startIndex + this.itemsPerPage
    },
    
    paginatedStaff() {
      return this.allFilteredStaff.slice(this.startIndex, this.endIndex)
    },
    
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      
      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  methods: {
    ...mapActions(useUsersStore, ['fetchUsers', 'createUser', 'updateUser', 'deleteUser']),

    filterStaff() {
      // Filtering is handled by computed property
      // Reset to first page when filters change
      this.currentPage = 1
    },

    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
      this.roleFilter = ''
      this.currentPage = 1
    },

    formatRole(role) {
      const roleMap = {
        care_worker: 'Care Worker',
        support_coordinator: 'Support Coordinator', 
        manager: 'Manager',
        admin: 'Administrator'
      }
      return roleMap[role] || role
    },

    getInitials(firstName, lastName) {
      const first = (firstName || '').charAt(0).toUpperCase()
      const last = (lastName || '').charAt(0).toUpperCase()
      return first + last || 'NA'
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },

    async toggleStaffStatus(member) {
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      try {
        const newStatus = member.is_active === false ? true : false
        const updateData = {
          ...member,
          is_active: newStatus
        }
        
        await this.updateUser({ id: member.id, data: updateData })
        
        // Update local state
        member.is_active = newStatus
        
        const statusText = newStatus ? 'activated' : 'deactivated'
        showSuccessNotification(`Staff member ${statusText} successfully!`)
      } catch (error) {
        console.error('Error toggling staff status:', error)
        showErrorNotification(error, 'Error updating staff status')
        // Revert the local change on error
        member.is_active = !member.is_active
      } finally {
        this.isSubmitting = false
      }
    },

    // Modal methods
    closeModal() {
      this.showAddModal = false
      this.resetForm()
    },

    closeEditModal() {
      this.showEditModal = false
      this.editingStaff = null
      this.resetForm()
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.staffToDelete = null
    },

    closeViewModal() {
      this.showViewModal = false
      this.selectedStaff = null
    },

    resetForm() {
      this.newStaff = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'care_worker',
        employee_id: '',
        department: '',
        hire_date: '',
        is_active: true
      }
    },

    validateStaffForm() {
      if (!this.newStaff.first_name || !this.newStaff.first_name.trim()) {
        showErrorNotification(new Error('First name is required'))
        return false
      }
      
      if (!this.newStaff.last_name || !this.newStaff.last_name.trim()) {
        showErrorNotification(new Error('Last name is required'))
        return false
      }
      
      if (!this.newStaff.email || !this.newStaff.email.trim()) {
        showErrorNotification(new Error('Email is required'))
        return false
      }
      
      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(this.newStaff.email)) {
        showErrorNotification(new Error('Please enter a valid email address'))
        return false
      }
      
      return true
    },

    async addStaff() {
      if (!this.validateStaffForm()) {
        return
      }
      
      try {
        this.isSubmitting = true
        const staffData = {
          ...this.newStaff,
          password: 'TempPassword123!' // Temporary password - should be changed on first login
        }
        await this.createUser(staffData)
        this.closeModal()
        showSuccessNotification('Staff member added successfully!')
        await this.fetchUsers()
      } catch (error) {
        console.error('Error adding staff:', error)
        showErrorNotification(error, 'Error adding staff member')
      } finally {
        this.isSubmitting = false
      }
    },

    editStaffMember(member) {
      this.editingStaff = { ...member }
      // Pre-populate the form
      this.newStaff = {
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'care_worker',
        employee_id: member.employee_id || '',
        department: member.department || '',
        hire_date: member.hire_date || '',
        is_active: member.is_active !== false
      }
      this.showEditModal = true
    },

    async updateEditedStaff() {
      if (!this.validateStaffForm()) {
        return
      }
      
      try {
        this.isSubmitting = true
        const staffData = { ...this.newStaff }
        await this.updateUser({ id: this.editingStaff.id, data: staffData })
        this.closeEditModal()
        showSuccessNotification('Staff member updated successfully!')
        await this.fetchUsers()
      } catch (error) {
        console.error('Error updating staff:', error)
        showErrorNotification(error, 'Error updating staff member')
      } finally {
        this.isSubmitting = false
      }
    },

    deleteStaffMember(member) {
      this.staffToDelete = member
      this.showDeleteModal = true
    },

    async confirmDeleteStaff() {
      if (!this.staffToDelete) return
      
      try {
        this.isSubmitting = true
        await this.deleteUser(this.staffToDelete.id)
        this.closeDeleteModal()
        showSuccessNotification('Staff member deleted successfully!')
        await this.fetchUsers()
      } catch (error) {
        console.error('Error deleting staff:', error)
        showErrorNotification(error, 'Error deleting staff member')
      } finally {
        this.isSubmitting = false
      }
    },
    
    viewStaffMember(member) {
      this.selectedStaff = member
      this.showViewModal = true
    },
    
    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    handlePerPageChange() {
      // Reset to first page when items per page changes
      this.currentPage = 1
    }
  },
  async mounted() {
    await this.fetchUsers()
  }
}
</script>

<style scoped>
/* Import all the styles from Participants page */
@import url('../assets/styles/participants-common.css');

/* Override the background from common CSS */
.participants-container {
  background: none !important;
}

/* Override list header styling to match page theme */
.list-header {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #1f2937 !important;
}

[data-theme="dark"] .list-header {
  background: rgba(31, 41, 55, 0.95) !important;
  color: #f3f4f6 !important;
}

/* Enhanced Search Section - Responsive and Clean */
.filters-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .filters-section {
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.25rem 0;
}

/* Search Box - Enhanced */
.search-box {
  position: relative;
  flex: 1 1 auto;
  min-width: 200px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.9rem;
  z-index: 2;
}

[data-theme="dark"] .search-box i {
  color: #94a3b8;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

[data-theme="dark"] .form-input {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
  color: #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

[data-theme="dark"] .form-input:focus {
  background: rgba(55, 65, 81, 0.98);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2);
}

.form-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

[data-theme="dark"] .form-input::placeholder {
  color: #6b7280;
}

/* Filter Controls - Enhanced */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.form-select {
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  min-width: 120px;
  max-width: 180px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  flex-shrink: 1;
}

[data-theme="dark"] .form-select {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
  color: #f3f4f6;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

[data-theme="dark"] .form-select:focus {
  background-color: rgba(55, 65, 81, 0.98);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Clear Button - Enhanced */
.btn-outline-elegant {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid #e2e8f0;
  color: #64748b;
  padding: 0.875rem 1.125rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.875rem;
}

[data-theme="dark"] .btn-outline-elegant {
  background: linear-gradient(145deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.btn-outline-elegant:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
}

[data-theme="dark"] .btn-outline-elegant:hover {
  border-color: #3b82f6;
  color: #60a5fa;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
}

/* View Toggle - Enhanced */
.view-toggle {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

[data-theme="dark"] .view-toggle {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.view-btn-elegant {
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-width: 2.75rem;
}

[data-theme="dark"] .view-btn-elegant {
  color: #9ca3af;
}

.view-btn-elegant:hover:not(.active) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: translateY(-1px);
}

.view-btn-elegant.active {
  background: linear-gradient(145deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .filters-section {
    padding: 1rem;
  }
  
  .filters-row {
    gap: 0.5rem;
  }
  
  .search-box {
    min-width: 160px;
    flex: 1 1 auto;
  }
  
  .form-select {
    min-width: 100px;
    max-width: 140px;
  }
  
  .btn-outline-elegant {
    padding: 0.875rem 0.75rem;
    white-space: nowrap;
  }
}

@media (max-width: 640px) {
  .filters-row {
    gap: 0.5rem;
  }
  
  .search-box {
    flex: 1 1 100%;
    min-width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .filter-controls {
    flex: 1 1 100%;
    justify-content: space-between;
  }
  
  .form-select {
    flex: 1;
    min-width: 90px;
    max-width: none;
  }
}

/* Dark Theme Support for Page Elements */
.participants-container {
  min-height: 100vh;
}

[data-theme="dark"] .participants-container {
  color: #f3f4f6;
}

.page-header {
  background: #1e293b;
  border: 1px solid rgba(51, 65, 85, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  margin-bottom: 1.25rem;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .page-header {
  background: #1e293b;
  border: 1px solid rgba(51, 65, 85, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header-content h1 {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content h1 i {
  color: #667eea;
  -webkit-text-fill-color: #667eea;
  font-size: 1.5rem;
}


.header-content p {
  font-size: 1.1rem;
  color: rgba(107, 114, 128, 0.8);
  margin: 0;
  font-weight: 500;
}

.page-header-shimmer {
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

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

[data-theme="dark"] .stat-card {
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.stat-content h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

[data-theme="dark"] .stat-content h3 {
  color: #f3f4f6;
}

.stat-content p {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

[data-theme="dark"] .stat-content p {
  color: #9ca3af;
}

/* Content Card */
.content-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.25rem;
}

[data-theme="dark"] .content-card {
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Loading and Empty States */
.loading-state p,
.empty-state h3,
.empty-state p {
  color: #6b7280;
}

[data-theme="dark"] .loading-state p,
[data-theme="dark"] .empty-state h3 {
  color: #f3f4f6;
}

[data-theme="dark"] .empty-state p {
  color: #9ca3af;
}

.empty-state i {
  color: #9ca3af;
}

[data-theme="dark"] .empty-state i {
  color: #6b7280;
}

/* Staff-specific role badge colors */
.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.role-care_worker {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.role-badge.role-support_coordinator {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.role-badge.role-manager {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.role-badge.role-admin {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

/* Staff-specific overrides */
.participant-ndis {
  font-size: 0.875rem;
  color: var(--text-medium);
  font-weight: 600;
  text-transform: capitalize;
}

[data-theme="dark"] .participant-ndis {
  color: #9ca3af;
}

/* Delete modal styling */
.delete-confirmation {
  text-align: center;
  padding: 1rem;
}

[data-theme="dark"] .delete-confirmation {
  color: #f3f4f6;
}

.delete-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.delete-confirmation h4 {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  color: var(--text-dark);
}

[data-theme="dark"] .delete-confirmation h4 {
  color: #f3f4f6;
}

.participant-summary {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  text-align: left;
}

[data-theme="dark"] .participant-summary {
  background: rgba(255, 255, 255, 0.05);
}

.participant-summary p {
  margin: 0.5rem 0;
  color: var(--text-medium);
}

[data-theme="dark"] .participant-summary p {
  color: #d1d5db;
}

.participant-summary strong {
  color: var(--text-dark);
  font-weight: 600;
}

[data-theme="dark"] .participant-summary strong {
  color: #f3f4f6;
}

.warning-text {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.warning-text i {
  font-size: 1.25rem;
}

/* View modal detail grid */
.participant-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1rem 0;
}

.detail-section {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 1.25rem;
}

.detail-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-section h4 i {
  color: var(--primary-color);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 600;
  color: var(--text-medium);
}

.detail-item .value {
  color: var(--text-dark);
  text-align: right;
}

.detail-item .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
}

/* Mobile Responsive Design */
@media (max-width: 1024px) {
  .page-header {
    padding: 1.25rem 1.5rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-content h1 {
    font-size: 1.75rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.25rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .content-card {
    padding: 1.25rem;
  }
  
  /* List view mobile improvements */
  .list-header {
    display: none;
  }
  
  .list-row {
    flex-direction: column;
    padding: 1rem;
    border-bottom: 2px solid rgba(0, 0, 0, 0.05);
    gap: 0.75rem;
  }
  
  [data-theme="dark"] .list-row {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .list-cell {
    flex-direction: column;
    align-items: flex-start !important;
    width: 100%;
  }
  
  .list-cell:before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-medium);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    display: block;
  }
  
  [data-theme="dark"] .list-cell:before {
    color: #9ca3af;
  }
  
  /* Mobile card improvements */
  .participants-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .participant-card {
    padding: 1.25rem;
  }
  
  .participant-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .participant-info {
    flex: 1 1 100%;
    text-align: center;
  }
  
  .participant-status {
    flex: 1 1 100%;
    justify-content: center;
  }
  
  /* Modal mobile improvements */
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
  
  .modal-body {
    padding: 1.25rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .participant-detail-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  /* Pagination mobile */
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
  }
  
  .pagination {
    order: 1;
  }
  
  .pagination-info {
    order: 2;
    font-size: 0.875rem;
  }
  
  .per-page-selector {
    order: 3;
    font-size: 0.875rem;
  }
}

@media (max-width: 640px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .participant-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .action-btn {
    min-width: 2.5rem;
    min-height: 2.5rem;
  }
  
  /* Touch-friendly buttons */
  .btn {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  /* Modal improvements for small screens */
  .modal-content {
    margin: 0.5rem;
    border-radius: 12px;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.125rem;
  }
  
  .modal-actions {
    padding: 1rem;
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .modal-actions .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 0.75rem;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .header-content p {
    font-size: 0.875rem;
  }
  
  .content-card {
    padding: 1rem;
  }
  
  .filters-section {
    padding: 0.75rem;
  }
  
  .search-box {
    margin-bottom: 0.75rem;
  }
  
  .form-input, .form-select {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
  
  .participant-card {
    padding: 1rem;
  }
  
  .participant-avatar {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }
}

/* Dark Theme Card Support */
[data-theme="dark"] .participant-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}

[data-theme="dark"] .participant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(31, 41, 55, 0.88) 100%);
}

[data-theme="dark"] .participant-header {
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

[data-theme="dark"] .participant-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

[data-theme="dark"] .participant-info h3 {
  color: #f9fafb;
  font-weight: 600;
}

[data-theme="dark"] .participant-info p {
  color: #d1d5db;
}

[data-theme="dark"] .detail-row {
  background: rgba(55, 65, 81, 0.4);
  border-color: rgba(75, 85, 99, 0.3);
  color: #e5e7eb;
}

[data-theme="dark"] .detail-row:hover {
  background: rgba(55, 65, 81, 0.6);
  border-color: rgba(75, 85, 99, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .detail-row i {
  color: #60a5fa;
}

[data-theme="dark"] .detail-row span {
  color: #f3f4f6;
}

[data-theme="dark"] .participant-actions {
  border-top-color: rgba(75, 85, 99, 0.3);
}

[data-theme="dark"] .action-btn {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .action-btn:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(96, 165, 250, 0.4);
}

[data-theme="dark"] .action-btn.view-btn {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

[data-theme="dark"] .action-btn.view-btn:hover {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%);
  border-color: #60a5fa;
  color: #93c5fd;
}

[data-theme="dark"] .action-btn.edit-btn {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

[data-theme="dark"] .action-btn.edit-btn:hover {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.15) 100%);
  border-color: #fbbf24;
  color: #fcd34d;
}

[data-theme="dark"] .action-btn.delete-btn {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

[data-theme="dark"] .action-btn.delete-btn:hover {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%);
  border-color: #f87171;
  color: #fca5a5;
}

[data-theme="dark"] .status-badge.active {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

[data-theme="dark"] .status-badge.inactive {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

[data-theme="dark"] .toggle-switch .slider {
  background-color: rgba(55, 65, 81, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.4);
}

[data-theme="dark"] .toggle-switch input:checked + .slider {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

[data-theme="dark"] .toggle-switch .slider:before {
  background-color: #f9fafb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
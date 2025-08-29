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
            <button @click="viewStaff(member)" class="btn-small btn-view">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="scheduleStaff(member)" class="btn-small btn-schedule">
              <i class="fas fa-calendar-plus"></i>
              Schedule
            </button>
            <button @click="editStaff(member)" class="btn-small btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="deleteStaff(member)" class="btn-small btn-delete">
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
          <button @click="closeDeleteModal" class="btn btn-view">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmDeleteStaff" class="btn btn-delete" :disabled="isSubmitting">
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
            <button @click="closeViewModal" class="btn btn-view">Close</button>
            <button @click="editStaff(selectedStaffMember); closeViewModal()" class="btn btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Shift Modal -->
    <div v-if="showScheduleModal && staffToSchedule" class="modal-overlay" @click="closeScheduleModal">
      <div class="modal-content schedule-modal" @click.stop>
        <div class="modal-header">
          <h3>Schedule Shift for {{ staffToSchedule.first_name }} {{ staffToSchedule.last_name }}</h3>
          <button @click="closeScheduleModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createScheduledShift">
            <div class="form-row">
              <div class="form-group">
                <label>Participant *</label>
                <select v-model="newShift.participant_id" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select v-model="newShift.service_type" required>
                  <option value="">Select Service</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Community Access">Community Access</option>
                  <option value="Domestic Assistance">Domestic Assistance</option>
                  <option value="Social Support">Social Support</option>
                  <option value="Transport">Transport</option>
                  <option value="Nursing Care">Nursing Care</option>
                  <option value="Therapy Support">Therapy Support</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input v-model="newShift.date" type="date" required />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <select v-model="newShift.location" required>
                  <option value="">Select Location</option>
                  <option value="Participant's Home">Participant's Home</option>
                  <option value="Community">Community</option>
                  <option value="Office">Office</option>
                  <option value="Medical Facility">Medical Facility</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Time *</label>
                <input v-model="newShift.start_time" type="time" required @change="calculateEndTimeFromDuration" />
              </div>
              <div class="form-group">
                <label>Duration (hours)</label>
                <input 
                  v-model="newShift.duration_hours" 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24" 
                  placeholder="4.0" 
                  @input="calculateEndTimeFromDuration"
                />
                <small>Auto-calculates end time</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>End Time *</label>
                <input v-model="newShift.end_time" type="time" required @change="calculateDurationFromTimes" />
                <small>Or set manually to override duration</small>
              </div>
              <div class="form-group"></div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Hourly Rate ($) *</label>
                <input v-model="newShift.hourly_rate" type="number" step="0.01" min="0" required placeholder="45.00" />
              </div>
              <div class="form-group"></div>
            </div>

            <div class="form-group full-width">
              <label for="shift-notes">
                <i class="fas fa-sticky-note"></i>
                Notes (Optional)
              </label>
              <textarea 
                id="shift-notes"
                v-model="newShift.notes" 
                rows="4" 
                placeholder="Add any special instructions, requirements, or notes for this shift..."
                class="notes-textarea"
              ></textarea>
              <small class="help-text">These notes will be visible to both the staff member and participant</small>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeScheduleModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-schedule" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Scheduling...
                </span>
                <span v-else>
                  <i class="fas fa-calendar-plus"></i>
                  Schedule Shift
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
import { useShiftsStore } from '../stores/shifts'
import { useParticipantsStore } from '../stores/participants'
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
      showScheduleModal: false,
      editingStaff: null,
      staffToDelete: null,
      selectedStaffMember: null,
      staffToSchedule: null,
      newStaff: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        password: 'defaultpassword123' // Will need to be changed
      },
      newShift: {
        participant_id: '',
        staff_id: '',
        date: '',
        start_time: '',
        end_time: '',
        duration_hours: 4.0,
        service_type: '',
        hourly_rate: 45.00,
        location: '',
        notes: ''
      },
      isSubmitting: false
    }
  },
  computed: {
    ...mapState(useUsersStore, { staff: 'users', isLoading: 'isLoading', error: 'error' }),
    ...mapState(useShiftsStore, ['shifts']),
    ...mapState(useParticipantsStore, { allParticipants: 'participants' }),
    
    // Filter only active participants for scheduling
    participants() {
      return this.allParticipants.filter(p => p.is_active !== false)
    },
    activeStaff() {
      return this.staff.filter(s => s.is_active).length
    },
    availableToday() {
      return this.staff.filter(s => s.role !== 'admin' && s.is_active).length
    }
  },
  methods: {
    ...mapActions(useUsersStore, ['fetchUsers', 'createUser', 'updateUser', 'deleteUser']),
    ...mapActions(useShiftsStore, ['createShift']),
    ...mapActions(useParticipantsStore, ['fetchParticipants']),
    
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
      this.staffToSchedule = member
      this.newShift.staff_id = member.id
      this.showScheduleModal = true
    },

    closeScheduleModal() {
      this.showScheduleModal = false
      this.staffToSchedule = null
      this.resetShiftForm()
    },

    calculateEndTimeFromDuration() {
      if (this.newShift.start_time && this.newShift.duration_hours) {
        const [hours, minutes] = this.newShift.start_time.split(':').map(Number)
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0, 0)
        
        const durationMs = this.newShift.duration_hours * 60 * 60 * 1000
        const endDate = new Date(startDate.getTime() + durationMs)
        
        const endHours = String(endDate.getHours()).padStart(2, '0')
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
        this.newShift.end_time = `${endHours}:${endMinutes}`
      }
    },

    calculateDurationFromTimes() {
      if (this.newShift.start_time && this.newShift.end_time) {
        const [startHours, startMinutes] = this.newShift.start_time.split(':').map(Number)
        const [endHours, endMinutes] = this.newShift.end_time.split(':').map(Number)
        
        const startDate = new Date()
        startDate.setHours(startHours, startMinutes, 0, 0)
        
        const endDate = new Date()
        endDate.setHours(endHours, endMinutes, 0, 0)
        
        // Handle next day scenarios
        if (endDate <= startDate) {
          endDate.setDate(endDate.getDate() + 1)
        }
        
        const durationMs = endDate - startDate
        this.newShift.duration_hours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(1))
      }
    },

    resetShiftForm() {
      this.newShift = {
        participant_id: '',
        staff_id: '',
        date: '',
        start_time: '',
        end_time: '',
        duration_hours: 4.0,
        service_type: '',
        hourly_rate: 45.00,
        location: '',
        notes: ''
      }
    },

    async createScheduledShift() {
      if (!this.validateShiftForm()) {
        return
      }

      this.isSubmitting = true
      try {
        const startDateTime = `${this.newShift.date}T${this.newShift.start_time}:00+00:00`
        const endDateTime = `${this.newShift.date}T${this.newShift.end_time}:00+00:00`

        const shiftData = {
          participant_id: this.newShift.participant_id,
          staff_id: this.newShift.staff_id,
          start_time: startDateTime,
          end_time: endDateTime,
          service_type: this.newShift.service_type,
          hourly_rate: parseFloat(this.newShift.hourly_rate),
          location: this.newShift.location,
          notes: this.newShift.notes.trim() || null,
          status: 'scheduled'
        }

        console.log('Creating scheduled shift:', shiftData)
        await this.createShift(shiftData)
        this.closeScheduleModal()
        showSuccessNotification('Shift scheduled successfully!')
      } catch (error) {
        console.error('Error scheduling shift:', error)
        showErrorNotification(error, 'Failed to schedule shift. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    validateShiftForm() {
      if (!this.newShift.participant_id) {
        showErrorNotification(new Error('Please select a participant'))
        return false
      }
      if (!this.newShift.date) {
        showErrorNotification(new Error('Please select a date'))
        return false
      }
      if (!this.newShift.start_time) {
        showErrorNotification(new Error('Please select a start time'))
        return false
      }
      if (!this.newShift.end_time) {
        showErrorNotification(new Error('Please select an end time'))
        return false
      }
      if (!this.newShift.service_type) {
        showErrorNotification(new Error('Please select a service type'))
        return false
      }
      if (!this.newShift.hourly_rate || this.newShift.hourly_rate <= 0) {
        showErrorNotification(new Error('Please enter a valid hourly rate'))
        return false
      }
      if (!this.newShift.location) {
        showErrorNotification(new Error('Please select a location'))
        return false
      }
      
      const startTime = new Date(`${this.newShift.date}T${this.newShift.start_time}:00`)
      const endTime = new Date(`${this.newShift.date}T${this.newShift.end_time}:00`)
      
      if (endTime <= startTime) {
        showErrorNotification(new Error('End time must be after start time'))
        return false
      }
      
      return true
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


    async toggleStaffStatus(staff) {
      this.isSubmitting = true
      try {
        const updateData = {
          is_active: !staff.is_active
        }
        
        console.log('Toggling staff status:', staff.id, 'to:', updateData.is_active)
        await this.updateUser(staff.id, updateData)
        await this.fetchUsers()
        this.filterStaff()
        
        const statusText = updateData.is_active ? 'activated' : 'deactivated'
        showSuccessNotification(`Staff member ${statusText} successfully!`)
      } catch (error) {
        console.error('Error toggling staff status:', error)
        showErrorNotification(error, 'Error updating staff status. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    get isSubmitting() {
      return this.isLoading
    }
  },
  async mounted() {
    await this.loadStaff()
    await this.fetchParticipants()
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
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  margin: 0;
  margin-top: 1.5rem;
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

/* Schedule Modal Styles */
.schedule-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.schedule-modal .modal-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px 12px 0 0;
}

.schedule-modal .modal-header h3 {
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.schedule-modal .modal-header h3::before {
  content: '\f073';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  opacity: 0.8;
}

.schedule-modal .close-btn {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  transition: all 0.3s ease;
}

.schedule-modal .close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.schedule-modal .modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: white;
}

.schedule-modal .form-group.full-width {
  grid-column: 1 / -1;
  margin-top: 1rem;
}

.schedule-modal .form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.schedule-modal .form-group label i {
  color: #10b981;
  font-size: 0.9rem;
}

.schedule-modal .notes-textarea {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.schedule-modal .notes-textarea:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.schedule-modal .notes-textarea::placeholder {
  color: #9ca3af;
  font-style: italic;
}

.schedule-modal .help-text {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.schedule-modal .help-text::before {
  content: '\f05a';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #10b981;
  font-size: 0.8rem;
}

.schedule-modal .form-group input,
.schedule-modal .form-group select {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.875rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.schedule-modal .form-group input:focus,
.schedule-modal .form-group select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.schedule-modal .form-group small {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.schedule-modal .btn-primary {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
  border: none;
  color: white;
  font-weight: 600;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25) !important;
}

.schedule-modal .btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #059669 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.35) !important;
}

.schedule-modal .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.15);
}

.schedule-modal .btn-secondary {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  font-weight: 600;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.schedule-modal .btn-secondary:hover {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
}
</style>

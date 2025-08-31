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

    <!-- Filters and Search -->
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
            <option value="active">Active Staff</option>
            <option value="inactive">Inactive Staff</option>
            <option value="">All Staff</option>
          </select>
          
          <select v-model="roleFilter" @change="filterStaff" class="form-select">
            <option value="">All Roles</option>
            <option value="care_worker">Care Worker</option>
            <option value="support_coordinator">Support Coordinator</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant">
            <i class="fas fa-times"></i>
            Clear Filters
          </button>
          
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

      <!-- List View -->
      <div v-else-if="currentView === 'list'" class="staff-list">
        <div class="list-header">
          <div class="col-name">Staff Member</div>
          <div class="col-role">Role</div>
          <div class="col-contact">Contact</div>
          <div v-if="isAdmin" class="col-company">Company</div>
          <div class="col-status">Status</div>
          <div class="col-actions">Actions</div>
        </div>
        <div v-for="member in filteredStaff" :key="member.id" class="list-row">
          <div class="col-name">
            <div class="staff-avatar-small">{{ getInitials(member.first_name, member.last_name) }}</div>
            <div class="staff-info-compact">
              <h4>{{ member.first_name }} {{ member.last_name }}</h4>
              <span class="staff-id">ID: {{ member.id }}</span>
            </div>
          </div>
          <div class="col-role">
            <span class="role-badge">{{ formatRole(member.role) }}</span>
          </div>
          <div class="col-contact">
            <div class="contact-info">
              <div v-if="isAdmin || isSuperAdmin">
                <div><i class="fas fa-envelope"></i> {{ member.email }}</div>
                <div><i class="fas fa-phone"></i> {{ member.phone || 'N/A' }}</div>
              </div>
              <div v-else>
                <div><i class="fas fa-envelope"></i> {{ member.email ? member.email.substring(0, 3) + '***@' + member.email.split('@')[1] : 'N/A' }}</div>
                <div><i class="fas fa-phone"></i> {{ member.phone ? '***-***-' + member.phone.slice(-4) : 'N/A' }}</div>
              </div>
            </div>
          </div>
          <div v-if="isAdmin" class="col-company">
            <div class="company-info">
              <div class="company-badge">
                <span class="status-dot" :class="getCompanyStatusClass(member)"></span>
                <span class="company-name">{{ getCompanyName(member) }}</span>
              </div>
              <div class="staff-status">
                <span class="status-dot" :class="getStaffStatusClass(member)"></span>
                <span class="status-text">{{ getStaffStatusText(member) }}</span>
              </div>
            </div>
          </div>
          <div class="col-status">
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
          <div class="col-actions">
            <div class="action-buttons">
              <button @click="viewStaff(member)" class="btn-small btn-view" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="scheduleStaff(member)" class="btn-small btn-schedule" title="Schedule Shift">
                <i class="fas fa-calendar-plus"></i>
              </button>
              <button @click="editStaff(member)" class="btn-small btn-edit" title="Edit Staff">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid View -->
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
                <input v-model="newStaff.first_name" type="text" class="form-input" required placeholder="Enter first name" />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input v-model="newStaff.last_name" type="text" class="form-input" required placeholder="Enter last name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input v-model="newStaff.email" type="email" class="form-input" required placeholder="Enter email address" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="newStaff.phone" type="tel" class="form-input" placeholder="Enter phone number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Role *</label>
                <select v-model="newStaff.role" class="form-select" required>
                  <option value="">Select Role</option>
                  <option value="care_worker">Care Worker</option>
                  <option value="support_coordinator">Support Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="form-group">
                <label>Password *</label>
                <input v-model="newStaff.password" type="password" class="form-input" required placeholder="Default password" />
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
                <input v-model="newStaff.first_name" type="text" class="form-input" required placeholder="Enter first name" />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input v-model="newStaff.last_name" type="text" class="form-input" required placeholder="Enter last name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input v-model="newStaff.email" type="email" class="form-input" placeholder="Enter email address" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="newStaff.phone" type="tel" class="form-input" placeholder="Enter phone number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Role *</label>
                <select v-model="newStaff.role" class="form-select" required>
                  <option value="">Select Role</option>
                  <option value="care_worker">Care Worker</option>
                  <option value="support_coordinator">Support Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="form-group">
                <label>New Password (optional)</label>
                <input v-model="newStaff.password" type="password" class="form-input" placeholder="Leave blank to keep current password" />
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
            <button @click="deleteStaff(selectedStaffMember); closeViewModal()" class="btn btn-delete">
              <i class="fas fa-trash"></i>
              Delete
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
                <select v-model="newShift.participant_id" class="form-select" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select v-model="newShift.service_type" class="form-select" required>
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
                <input v-model="newShift.date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <select v-model="newShift.location" class="form-select" required>
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
                <input v-model="newShift.start_time" type="time" class="form-input" required @change="calculateEndTimeFromDuration" />
              </div>
              <div class="form-group">
                <label>Duration (hours)</label>
                <input 
                  v-model="newShift.duration_hours" 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24" 
                  class="form-input"
                  placeholder="4.0" 
                  @input="calculateEndTimeFromDuration"
                />
                <small>Auto-calculates end time</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>End Time *</label>
                <input v-model="newShift.end_time" type="time" class="form-input" required @change="calculateDurationFromTimes" />
                <small>Or set manually to override duration</small>
              </div>
              <div class="form-group"></div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Hourly Rate ($) *</label>
                <input v-model="newShift.hourly_rate" type="number" step="0.01" min="0" class="form-input" required placeholder="45.00" />
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
                class="form-textarea"
                placeholder="Add any special instructions, requirements, or notes for this shift..."
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
import { useAuthStore } from '../stores/auth'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'Staff',
  data() {
    return {
      filteredStaff: [],
      searchQuery: '',
      roleFilter: '',
      statusFilter: 'active',
      currentView: 'list',
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
    ...mapState(useAuthStore, ['user']),
    
    // Filter only active participants for scheduling
    participants() {
      return this.allParticipants.filter(p => p.is_active !== false)
    },
    activeStaff() {
      return this.staff.filter(s => s.is_active).length
    },
    availableToday() {
      return this.staff.filter(s => s.role !== 'admin' && s.is_active).length
    },
    
    isAdmin() {
      return this.user && (this.user.role === 'admin' || this.user.role === 'super_admin')
    },
    
    isSuperAdmin() {
      return this.user && this.user.role === 'super_admin'
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

      // Role-based access control for search results
      if (!this.isSuperAdmin) {
        if (this.isAdmin) {
          // Admins can see all staff within their organization
          const userOrgId = this.user?.organization_id
          if (userOrgId) {
            filtered = filtered.filter(s => 
              s.organization_id === userOrgId || !s.organization_id
            )
          }
        } else {
          // Non-admin users can only see staff in their direct working groups or team
          // For now, restrict to same organization and active staff only
          const userOrgId = this.user?.organization_id
          if (userOrgId) {
            filtered = filtered.filter(s => 
              s.organization_id === userOrgId && s.is_active !== false
            )
          } else {
            // If user has no organization, they can only see themselves
            filtered = filtered.filter(s => s.id === this.user?.id)
          }
        }
      }
      // Super admins can see all staff members across all organizations
      
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

    getCompanyName(member) {
      if (member.organization_id) {
        return member.organization_name || `Organization ${member.organization_id}`
      }
      return 'No Company'
    },

    getCompanyStatusClass(member) {
      if (!member.organization_id) return 'status-gray'
      return member.organization_is_active ? 'status-green' : 'status-red'
    },

    getStaffStatusClass(member) {
      if (member.is_active === false) return 'status-red'
      if (member.last_login) {
        const lastLogin = new Date(member.last_login)
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceLogin > 30) return 'status-orange'
        if (daysSinceLogin > 7) return 'status-yellow'
      }
      return 'status-green'
    },

    getStaffStatusText(member) {
      if (member.is_active === false) return 'Inactive'
      if (member.last_login) {
        const lastLogin = new Date(member.last_login)
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceLogin > 30) return 'Idle'
        if (daysSinceLogin > 7) return 'Away'
      }
      return 'Active'
    },

    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = 'active'
      this.roleFilter = ''
      this.filterStaff()
    }
  },
  async mounted() {
    await this.loadStaff()
    await this.fetchParticipants()
  }
}
</script>

<style scoped>
/* Component-specific styles that extend the global theme */

/* Filters Section - Enhanced for Care Plans style */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 300px;
  flex: 1;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 14px;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-outline-elegant {
  padding: 12px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-outline-elegant:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

.view-toggle {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.view-btn-elegant {
  padding: 12px 16px;
  border: none;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.view-btn-elegant:hover {
  background: #f1f5f9;
  color: #667eea;
}

.view-btn-elegant.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.view-btn-elegant:not(:last-child) {
  border-right: 1px solid #e2e8f0;
}

/* List View Styles */
.staff-list {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.8fr 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--gray-50);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.8fr 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-bottom: 1px solid var(--gray-100);
  align-items: center;
  transition: var(--transition-normal);
}

.list-row:hover {
  background: var(--gray-25);
}

.list-row:last-child {
  border-bottom: none;
}

.col-name {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.staff-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.staff-info-compact h4 {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--gray-800);
  font-weight: 600;
}

.staff-id {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-50);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-info {
  font-size: var(--font-size-xs);
  color: var(--gray-600);
}

.contact-info div {
  margin-bottom: 0.25rem;
}

.contact-info div:last-child {
  margin-bottom: 0;
}

.contact-info i {
  width: 12px;
  margin-right: 0.5rem;
  color: var(--gray-400);
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

/* Grid View Styles */
.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-lg);
}

/* View Toggle Styles */
.view-toggle {
  display: flex;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

.view-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  background: white;
  color: var(--gray-500);
  cursor: pointer;
  transition: var(--transition-normal);
  font-size: var(--font-size-sm);
}

.view-btn:hover {
  background: var(--gray-50);
  color: var(--gray-700);
}

.view-btn.active {
  background: var(--primary-500);
  color: white;
}

.view-btn:first-child {
  border-right: 1px solid var(--gray-200);
}

.view-btn.active:first-child {
  border-right-color: var(--primary-500);
}

.staff-card {
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: var(--transition-normal);
  background: white;
}

.staff-card:hover {
  border-color: var(--primary-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.staff-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.staff-avatar {
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

.staff-info {
  flex: 1;
}

.staff-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--gray-800);
  font-size: var(--font-size-lg);
}

.staff-role {
  margin: 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.staff-status {
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

.staff-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);
}

.staff-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.staff-detail-item .label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gray-500);
  font-weight: 600;
}

.staff-detail-item .value {
  color: var(--gray-700);
  font-size: var(--font-size-sm);
}

.staff-actions {
  display: flex;
  gap: var(--space-xs);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--gray-200);
}

.staff-details-grid {
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

.btn-schedule {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-schedule:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(67, 233, 123, 0.3);
}

.btn-small {
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 6px;
  min-width: auto;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
    width: 100%;
  }
  
  .filter-controls {
    justify-content: space-between;
  }
  
  .form-select {
    min-width: auto;
    flex: 1;
  }

  .staff-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .staff-details-grid {
    grid-template-columns: 1fr;
  }

  .list-header,
  .list-row {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }

  .list-header {
    display: none;
  }

  .list-row {
    padding: var(--space-md);
    display: block;
  }

  .col-name,
  .col-role,
  .col-contact,
  .col-status,
  .col-actions {
    margin-bottom: var(--space-sm);
  }

  .col-actions:last-child {
    margin-bottom: 0;
  }

  .action-buttons {
    justify-content: flex-start;
  }

  .view-toggle {
    align-self: flex-start;
  }
}

/* Company Information Styles */
.col-company {
  flex: 0 0 200px;
  padding: 12px;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.company-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.staff-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.status-green {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.status-red {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

.status-yellow {
  background-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
}

.status-orange {
  background-color: #f97316;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.3);
}

.status-gray {
  background-color: #6b7280;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.3);
}

.company-name {
  color: #374151;
}

.status-text {
  color: #6b7280;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Adjust list header for admin company column */
.list-header .col-company {
  font-weight: 600;
  color: #374151;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .col-company {
    flex: 0 0 160px;
  }
  
  .company-badge {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .status-text {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .col-company {
    display: none;
  }
}
</style>

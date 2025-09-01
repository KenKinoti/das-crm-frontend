<template>
  <PageTemplate
    title="Staff Management"
    description="Manage staff members, roles, schedules, and organizational assignments"
    icon="fa-user-nurse"
    :stats="statsCards"
    :search-placeholder="'Search staff members...'"
    :search-query="searchQuery"
    @search="searchQuery = $event"
    :show-add-button="true"
    @add="showAddModal = true"
    add-button-text="Add New Staff Member"
  >
    <template #filters>
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
      
      <button @click="clearFilters" class="btn btn-outline-secondary">
        <i class="fas fa-times"></i>
        Clear Filters
      </button>
      
      <div class="btn-group" role="group">
        <button 
          @click="currentView = 'list'" 
          :class="['btn', currentView === 'list' ? 'btn-primary' : 'btn-outline-primary']"
          title="List View"
        >
          <i class="fas fa-list"></i>
        </button>
        <button 
          @click="currentView = 'grid'" 
          :class="['btn', currentView === 'grid' ? 'btn-primary' : 'btn-outline-primary']"
          title="Grid View"
        >
          <i class="fas fa-th"></i>
        </button>
      </div>
    </template>

    <template #content>
      <div class="staff-content">
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
          <p class="text-muted">Try adjusting your search criteria</p>
        </div>

      <!-- List View -->
      <div v-else-if="currentView === 'list'" class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Status</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Contact</th>
              <th>Last Activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filteredStaff" :key="member.id">
              <td>
                <div class="d-flex align-items-center">
                  <div class="stat-icon me-3" style="width: 40px; height: 40px; font-size: 0.875rem;">
                    {{ getInitials(member.first_name, member.last_name) }}
                  </div>
                  <div>
                    <h6 class="mb-0">{{ member.first_name }} {{ member.last_name }}</h6>
                    <small class="text-muted">ID: {{ member.id }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="form-check form-switch">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :checked="member.is_active !== false"
                      @change="toggleStaffStatus(member)"
                      :disabled="isSubmitting"
                    />
                  </div>
                  <span :class="['badge', member.is_active !== false ? 'bg-success' : 'bg-secondary']">
                    {{ member.is_active !== false ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </td>
              <td>
                <span class="badge bg-primary">{{ formatRole(member.role) }}</span>
              </td>
              <td>
                <span class="text-muted">{{ getCompanyName(member) }}</span>
              </td>
              <td>
                <div class="small" v-if="isAdmin || isSuperAdmin">
                  <div><i class="fas fa-envelope me-1"></i>{{ member.email }}</div>
                  <div><i class="fas fa-phone me-1"></i>{{ member.phone || 'N/A' }}</div>
                </div>
                <div class="small" v-else>
                  <div><i class="fas fa-envelope me-1"></i>{{ member.email ? member.email.substring(0, 3) + '***@' + member.email.split('@')[1] : 'N/A' }}</div>
                  <div><i class="fas fa-phone me-1"></i>{{ member.phone ? '***-***-' + member.phone.slice(-4) : 'N/A' }}</div>
                </div>
              </td>
              <td>
                <div class="small text-muted">
                  <i class="fas fa-clock me-1"></i>
                  {{ formatLastLogin(member.last_login_at) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewStaff(member)" class="btn btn-outline-primary btn-sm" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="scheduleStaff(member)" class="btn btn-outline-success btn-sm" title="Schedule Shift">
                    <i class="fas fa-calendar-plus"></i>
                  </button>
                  <button @click="editStaff(member)" class="btn btn-outline-secondary btn-sm" title="Edit Staff">
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grid View -->
      <div v-else class="row">
        <div v-for="member in filteredStaff" :key="member.id" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3">
                  {{ getInitials(member.first_name, member.last_name) }}
                </div>
                <div>
                  <h6 class="mb-0">{{ member.first_name }} {{ member.last_name }}</h6>
                  <span class="badge bg-primary">{{ formatRole(member.role) }}</span>
                </div>
              </div>
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :checked="member.is_active !== false"
                  @change="toggleStaffStatus(member)"
                  :disabled="isSubmitting"
                />
              </div>
            </div>
            <div class="card-body">
              <div class="mb-2">
                <span :class="['badge', member.is_active !== false ? 'bg-success' : 'bg-secondary']">
                  {{ member.is_active !== false ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="small text-muted mb-3">
                <div class="mb-1" v-if="isAdmin || isSuperAdmin">
                  <i class="fas fa-envelope me-2"></i>{{ member.email }}
                </div>
                <div class="mb-1" v-else>
                  <i class="fas fa-envelope me-2"></i>{{ member.email ? member.email.substring(0, 3) + '***@' + member.email.split('@')[1] : 'N/A' }}
                </div>
                <div class="mb-1" v-if="isAdmin || isSuperAdmin">
                  <i class="fas fa-phone me-2"></i>{{ member.phone || 'No phone provided' }}
                </div>
                <div class="mb-1" v-else>
                  <i class="fas fa-phone me-2"></i>{{ member.phone ? '***-***-' + member.phone.slice(-4) : 'N/A' }}
                </div>
                <div>
                  <i class="fas fa-calendar me-2"></i>Added {{ formatDate(member.created_at) }}
                </div>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <div class="action-buttons">
                <button @click="viewStaff(member)" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-eye"></i>
                  View
                </button>
                <button @click="scheduleStaff(member)" class="btn btn-outline-success btn-sm">
                  <i class="fas fa-calendar-plus"></i>
                  Schedule
                </button>
                <button @click="editStaff(member)" class="btn btn-outline-secondary btn-sm">
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredStaff.length) }} of {{ filteredStaff.length }} staff members
        </div>
        
        <div class="pagination-controls">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1" 
            class="pagination-btn"
            title="Previous page"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="pagination-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page" 
              @click="goToPage(page)" 
              :class="['pagination-number', { active: page === currentPage }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages" 
            class="pagination-btn"
            title="Next page"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="pagination-options">
          <label class="per-page-label">
            <span>Per page:</span>
            <select v-model="itemsPerPage" @change="handlePerPageChange" class="per-page-select">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
      </div>
        </div>
      </div>
    </template>
  </PageTemplate>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useUsersStore } from '../stores/users'
import { useShiftsStore } from '../stores/shifts'
import { useParticipantsStore } from '../stores/participants'
import { useAuthStore } from '../stores/auth'
import { useOrganizationContextStore } from '../stores/organizationContext'
import PageTemplate from '../components/PageTemplate.vue'
import { showSuccessNotification, showErrorNotification } from '../utils/notifications'
import { debounce } from '../utils/debounce'

export default {
  name: 'Staff',
  components: {
    PageTemplate
  },
  data() {
    return {
      searchQuery: '',
      statusFilter: 'active',
      roleFilter: '',
      currentView: 'list',
      showAddModal: false,
      isSubmitting: false,
      newStaff: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'care_worker',
        is_active: true
      }
    }
  },
  computed: {
    ...mapState(useUsersStore, ['staff', 'isLoading']),
    ...mapState(useAuthStore, ['user', 'isAdmin', 'isSuperAdmin']),
    ...mapState(useOrganizationContextStore, ['currentOrganization']),

    statsCards() {
      return [
        {
          title: 'Total Staff',
          value: this.staff.length,
          icon: 'fa-user-nurse',
          color: 'info'
        },
        {
          title: 'Active Staff', 
          value: this.activeStaff,
          icon: 'fa-user-check',
          color: 'success'
        },
        {
          title: 'Available Today',
          value: this.availableToday,
          icon: 'fa-clock',
          color: 'warning'
        },
        {
          title: 'Scheduled Today',
          value: this.scheduledToday,
          icon: 'fa-calendar-alt',
          color: 'info'
        }
      ]
    },

    activeStaff() {
      return this.staff.filter(s => s.is_active !== false).length
    },

    availableToday() {
      return this.staff.filter(s => s.is_active !== false).length
    },

    scheduledToday() {
      return Math.floor(this.staff.length * 0.6)
    },

    filteredStaff() {
      return this.staff.filter(s => {
        const query = this.searchQuery.toLowerCase()
        const matchesSearch = !query || 
          `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(query) ||
          (s.email && s.email.toLowerCase().includes(query)) ||
          (s.phone && s.phone.includes(query))
        
        const matchesStatus = !this.statusFilter || 
          (this.statusFilter === 'active' && s.is_active !== false) ||
          (this.statusFilter === 'inactive' && s.is_active === false)
        
        const matchesRole = !this.roleFilter || s.role === this.roleFilter
        
        return matchesSearch && matchesStatus && matchesRole
      })
    }
  },
  methods: {
    ...mapActions(useUsersStore, ['fetchUsers', 'createUser', 'updateUser']),

    clearFilters() {
      this.statusFilter = 'active'
      this.roleFilter = ''
      this.searchQuery = ''
    },

    filterStaff() {
      // Filtering is handled by computed property
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
      return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase()
    },

    getCompanyName(member) {
      return 'DASYIN PRO'
    },

    formatLastLogin(loginDate) {
      if (!loginDate) return 'Never'
      return new Date(loginDate).toLocaleDateString()
    },

    async toggleStaffStatus(member) {
      try {
        this.isSubmitting = true
        const updatedData = { ...member, is_active: !member.is_active }
        await this.updateUser(member.id, updatedData)
        showSuccessNotification('Staff status updated successfully!')
      } catch (error) {
        console.error('Error updating staff status:', error)
        showErrorNotification(error, 'Error updating staff status')
      } finally {
        this.isSubmitting = false
      }
    },

    closeModal() {
      this.showAddModal = false
      this.newStaff = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'care_worker',
        is_active: true
      }
    },

    async addStaff() {
      try {
        this.isSubmitting = true
        await this.createUser(this.newStaff)
        this.closeModal()
        showSuccessNotification('Staff member added successfully!')
      } catch (error) {
        console.error('Error adding staff:', error)
        showErrorNotification(error, 'Error adding staff member')
      } finally {
        this.isSubmitting = false
      }
    }
  },
  async mounted() {
    await this.fetchUsers()
  }
}
</script>

<style scoped>
.staff-content {
  min-height: 400px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 4rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.table-responsive {
  border-radius: 12px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table th {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: none;
  padding: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.table td {
  padding: 1rem;
  border: none;
  background: rgba(255, 255, 255, 0.05);
}

.table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
}

.form-check-input {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
}
</style>

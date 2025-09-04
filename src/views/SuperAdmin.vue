<template>
  <div class="participants-container">
    <!-- Header -->
    <div id="superadmin-header" class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-building"></i>
          Organization Management
        </h1>
        <p>Manage organizations, subscriptions, and billing across the platform</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Create Organization
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card info">
        <div class="stat-icon info-icon">
          <i class="fas fa-building"></i>
        </div>
        <div class="stat-content">
          <h3>{{ organizations.length }}</h3>
          <p>Total Organizations</p>
        </div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-icon success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ organizations.filter(o => getSubscriptionStatus(o) === 'active').length }}</h3>
          <p>Active</p>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon warning-icon">
          <i class="fas fa-pause-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ organizations.filter(o => getSubscriptionStatus(o) === 'suspended').length }}</h3>
          <p>Suspended</p>
        </div>
      </div>
      
      <div class="stat-card danger">
        <div class="stat-icon danger-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ organizations.filter(o => getSubscriptionStatus(o) === 'cancelled').length }}</h3>
          <p>Cancelled</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search organizations..." 
              class="form-input"
              @input="handleSearch"
            />
          </div>
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="handleSearch" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button @click="handleClearFilters" class="btn btn-outline-elegant">
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

    <!-- Organizations List -->
    <div class="content-card">

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading organizations...</p>
        </div>

        <div v-else-if="organizations.length === 0" class="empty-state">
          <i class="fas fa-building"></i>
          <p>No organizations found</p>
        </div>

        <!-- List View -->
        <div v-if="currentView === 'list'" class="participants-list">
          <div class="list-header">
            <div class="header-cell">Organization</div>
            <div class="header-cell">Contact</div>
            <div class="header-cell">Subscription</div>
            <div class="header-cell">Status</div>
            <div class="header-cell">Users/Participants</div>
            <div class="header-cell">Created</div>
            <div class="header-cell">Actions</div>
          </div>
          <div v-for="org in organizations" :key="org.id" class="list-row">
            <div class="list-cell">
              <div class="participant-avatar org-avatar">
                {{ org.name.substring(0, 2).toUpperCase() }}
              </div>
              <div class="participant-name">
                <span class="name">{{ org.name }}</span>
                <span class="email" v-if="org.abn">ABN: {{ org.abn }}</span>
              </div>
            </div>
            <div class="list-cell">
              <div class="contact-info">
                <div v-if="org.email"><i class="fas fa-envelope"></i> {{ org.email }}</div>
                <div v-if="org.phone"><i class="fas fa-phone"></i> {{ org.phone }}</div>
              </div>
            </div>
            <div class="list-cell">
              <div class="subscription-info">
                <span class="plan-badge">{{ getSubscriptionPlan(org) }}</span>
              </div>
            </div>
            <div class="list-cell">
              <span :class="['status-badge', getSubscriptionStatus(org)]">{{ formatStatus(getSubscriptionStatus(org)) }}</span>
            </div>
            <div class="list-cell">
              <div class="counts-info">
                <span><i class="fas fa-users"></i> {{ org.users?.length || 0 }}</span>
                <span><i class="fas fa-user"></i> {{ org.participants?.length || 0 }}</span>
              </div>
            </div>
            <div class="list-cell">{{ formatDate(org.created_at) }}</div>
            <div class="list-cell">
              <div class="action-buttons">
                <button @click="viewOrganization(org)" class="action-btn view-btn" title="View Details">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="editStatus(org)" class="action-btn edit-btn" title="Edit Status">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDeleteOrganization(org)" class="action-btn delete-btn" title="Delete Organization">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else-if="currentView === 'grid'" class="organizations-grid">
          <div v-for="org in organizations" :key="org.id" class="organization-card">
            <div class="org-header">
              <div class="participant-avatar org-avatar">
                {{ org.name.substring(0, 2).toUpperCase() }}
              </div>
              <div class="org-info">
                <h3>{{ org.name }}</h3>
                <p v-if="org.abn" class="org-abn">ABN: {{ org.abn }}</p>
              </div>
              <span :class="['status-badge', getSubscriptionStatus(org)]">
                {{ formatStatus(getSubscriptionStatus(org)) }}
              </span>
            </div>
            
            <div class="org-details">
              <div class="detail-row" v-if="org.email">
                <i class="fas fa-envelope"></i>
                <span>{{ org.email }}</span>
              </div>
              <div class="detail-row" v-if="org.phone">
                <i class="fas fa-phone"></i>
                <span>{{ org.phone }}</span>
              </div>
              <div class="detail-row">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(org.created_at) }}</span>
              </div>
            </div>

            <div class="org-stats">
              <div class="stat-item">
                <i class="fas fa-users"></i>
                <span>{{ org.users?.length || 0 }} Users</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-user"></i>
                <span>{{ org.participants?.length || 0 }} Participants</span>
              </div>
            </div>

            <div class="org-subscription">
              <span class="plan-badge">{{ getSubscriptionPlan(org) }}</span>
            </div>
            
            <div class="org-actions">
              <button @click="viewOrganization(org)" class="action-btn view-btn" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editStatus(org)" class="action-btn edit-btn" title="Edit Status">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmDeleteOrganization(org)" class="action-btn delete-btn" title="Delete Organization">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total_pages > 1" class="pagination-controls">
          <button 
            @click="changePage(pagination.page - 1)" 
            :disabled="pagination.page === 1"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div class="pagination-info">
            <span>Page</span>
            <select @change="changePage($event.target.value)" v-model="pagination.page" class="page-select">
              <option v-for="n in pagination.total_pages" :key="n" :value="n">{{ n }}</option>
            </select>
            <span>of {{ pagination.total_pages }}</span>
          </div>

          <button 
            @click="changePage(pagination.page + 1)" 
            :disabled="pagination.page === pagination.total_pages"
            class="pagination-btn"
          >
            Next
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
    </div>

    <!-- Create Organization Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Organization</h3>
          <button @click="showCreateModal = false" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createOrganization">
            <div class="form-row">
              <div class="form-group">
                <label>Organization Name *</label>
                <input v-model="newOrganization.name" type="text" required>
              </div>
              <div class="form-group">
                <label>ABN</label>
                <input v-model="newOrganization.abn" type="text">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input v-model="newOrganization.email" type="email" required>
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="newOrganization.phone" type="tel">
              </div>
            </div>

            <div class="form-group">
              <label>Website</label>
              <input v-model="newOrganization.website" type="url">
            </div>

            <h4>Admin User</h4>
            <div class="form-row">
              <div class="form-group">
                <label>First Name *</label>
                <input v-model="newOrganization.admin_user.first_name" type="text" required>
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input v-model="newOrganization.admin_user.last_name" type="text" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Admin Email *</label>
                <input v-model="newOrganization.admin_user.email" type="email" required>
              </div>
              <div class="form-group">
                <label>Admin Phone</label>
                <input v-model="newOrganization.admin_user.phone" type="tel">
              </div>
            </div>

            <div class="form-group">
              <label>Admin Password *</label>
              <input v-model="newOrganization.admin_user.password" type="password" required>
            </div>

            <h4>Subscription Plan</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Plan Name *</label>
                <select v-model="newOrganization.subscription.plan_name" required>
                  <option value="">Select Plan</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div class="form-group">
                <label>Billing Email *</label>
                <input v-model="newOrganization.subscription.billing_email" type="email" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Max Users *</label>
                <input v-model.number="newOrganization.subscription.max_users" type="number" min="1" required>
              </div>
              <div class="form-group">
                <label>Max Participants *</label>
                <input v-model.number="newOrganization.subscription.max_participants" type="number" min="1" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Max Storage (GB) *</label>
                <input v-model.number="newOrganization.subscription.max_storage_gb" type="number" min="1" required>
              </div>
              <div class="form-group">
                <label>Billing Cycle *</label>
                <select v-model="newOrganization.subscription.billing_cycle" required>
                  <option value="">Select Cycle</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="showCreateModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="createLoading" class="btn btn-primary">
                <i v-if="createLoading" class="fas fa-spinner fa-spin"></i>
                Create Organization
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Status Edit Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="showStatusModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Update Organization Status</h3>
          <button @click="showStatusModal = false" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="updateOrganizationStatus">
            <div class="form-group">
              <label>Organization</label>
              <input :value="selectedOrg?.name" type="text" readonly>
            </div>

            <div class="form-group">
              <label>Status *</label>
              <select v-model="statusUpdate.status" required>
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="form-group">
              <label>Reason</label>
              <textarea v-model="statusUpdate.reason" rows="3" placeholder="Optional reason for status change"></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="showStatusModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="statusLoading" class="btn btn-primary">
                <i v-if="statusLoading" class="fas fa-spinner fa-spin"></i>
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Organization Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="showDetailsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Organization Details</h3>
          <button @click="showDetailsModal = false" class="btn-close">×</button>
        </div>

        <div class="modal-body" v-if="orgDetails">
          <div class="details-grid">
            <div class="detail-section">
              <h4>Organization Info</h4>
              <div class="detail-item">
                <label>Name:</label>
                <span>{{ orgDetails.organization.name }}</span>
              </div>
              <div class="detail-item" v-if="orgDetails.organization.abn">
                <label>ABN:</label>
                <span>{{ orgDetails.organization.abn }}</span>
              </div>
              <div class="detail-item" v-if="orgDetails.organization.email">
                <label>Email:</label>
                <span>{{ orgDetails.organization.email }}</span>
              </div>
              <div class="detail-item" v-if="orgDetails.organization.phone">
                <label>Phone:</label>
                <span>{{ orgDetails.organization.phone }}</span>
              </div>
              <div class="detail-item" v-if="orgDetails.organization.website">
                <label>Website:</label>
                <span>{{ orgDetails.organization.website }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Subscription</h4>
              <div class="detail-item">
                <label>Plan:</label>
                <span>{{ orgDetails.subscription.plan_name }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span class="status-badge" :class="`status-${orgDetails.subscription.status}`">
                  {{ orgDetails.subscription.status }}
                </span>
              </div>
              <div class="detail-item">
                <label>Monthly Rate:</label>
                <span>${{ orgDetails.subscription.monthly_rate }}</span>
              </div>
              <div class="detail-item">
                <label>Max Users:</label>
                <span>{{ orgDetails.subscription.max_users }}</span>
              </div>
              <div class="detail-item">
                <label>Max Participants:</label>
                <span>{{ orgDetails.subscription.max_participants }}</span>
              </div>
              <div class="detail-item">
                <label>Max Storage:</label>
                <span>{{ orgDetails.subscription.max_storage_gb }} GB</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Users ({{ orgDetails.organization.users?.length || 0 }})</h4>
              <div class="user-list" v-if="orgDetails.organization.users?.length">
                <div v-for="user in orgDetails.organization.users" :key="user.id" class="user-item">
                  <span class="user-name">{{ user.first_name }} {{ user.last_name }}</span>
                  <span class="user-email">{{ user.email }}</span>
                  <span class="user-role">{{ user.role }}</span>
                </div>
              </div>
              <div v-else class="empty-state">No users found</div>
            </div>

            <div class="detail-section">
              <h4>Participants ({{ orgDetails.organization.participants?.length || 0 }})</h4>
              <div class="participant-list" v-if="orgDetails.organization.participants?.length">
                <div v-for="participant in orgDetails.organization.participants" :key="participant.id" class="participant-item">
                  <span class="participant-name">{{ participant.first_name }} {{ participant.last_name }}</span>
                  <span class="participant-ndis">{{ participant.ndis_number }}</span>
                </div>
              </div>
              <div v-else class="empty-state">No participants found</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="modal-actions">
            <button @click="showDetailsModal = false" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Close
            </button>
            <button @click="confirmDeleteOrganization(orgDetails.organization)" class="btn btn-danger">
              <i class="fas fa-trash"></i>
              Delete Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal && selectedOrg" class="modal-overlay" @click="showDeleteModal = false">
    <div class="modal-content delete-modal" @click.stop>
      <div class="modal-header">
        <h3>Confirm Delete Organization</h3>
        <button @click="showDeleteModal = false" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="delete-confirmation">
          <div class="delete-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h4>Are you sure you want to delete this organization?</h4>
          <div class="org-summary">
            <p><strong>Organization:</strong> {{ selectedOrg.name }}</p>
            <p v-if="selectedOrg.email"><strong>Email:</strong> {{ selectedOrg.email }}</p>
            <p v-if="selectedOrg.abn"><strong>ABN:</strong> {{ selectedOrg.abn }}</p>
            <p><strong>Users:</strong> {{ selectedOrg.users?.length || 0 }}</p>
            <p><strong>Participants:</strong> {{ selectedOrg.participants?.length || 0 }}</p>
          </div>
          <p class="warning-text">
            <i class="fas fa-exclamation-circle"></i>
            This action cannot be undone. All data associated with this organization will be permanently deleted.
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-view">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmDelete" class="btn btn-delete">
            <i class="fas fa-trash"></i>
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { superAdminOrganizationService } from '../services/superAdminOrganization'
import { showModal } from '../utils/errorHandler'

export default {
  name: 'SuperAdmin',
  setup() {
    const showNotification = (message, type = 'info') => {
      showModal(message, type, type.charAt(0).toUpperCase() + type.slice(1))
    }

    // Reactive state
    const organizations = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const currentView = ref('list')
    const pagination = ref({
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0
    })

    // Modals
    const showCreateModal = ref(false)
    const showStatusModal = ref(false)
    const showDetailsModal = ref(false)
    const showDeleteModal = ref(false)
    const createLoading = ref(false)
    const statusLoading = ref(false)
    
    // Selected items
    const selectedOrg = ref(null)
    const orgDetails = ref(null)

    // Form data
    const newOrganization = reactive({
      name: '',
      abn: '',
      email: '',
      phone: '',
      website: '',
      address: {
        street: '',
        suburb: '',
        state: '',
        postcode: '',
        country: 'Australia'
      },
      ndis_registration: {
        registration_number: '',
        registration_status: '',
        expiry_date: null
      },
      admin_user: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: ''
      },
      subscription: {
        plan_name: '',
        billing_email: '',
        max_users: 5,
        max_participants: 10,
        max_storage_gb: 5,
        billing_cycle: 'monthly'
      }
    })

    const statusUpdate = reactive({
      status: '',
      reason: ''
    })

    // API calls
    const fetchOrganizations = async () => {
      loading.value = true
      try {
        const response = await superAdminOrganizationService.getAllOrganizations(
          pagination.value.page,
          pagination.value.limit,
          searchQuery.value
        )
        
        if (response.success) {
          organizations.value = response.data.organizations || []
          pagination.value = response.data.pagination || pagination.value
        }
      } catch (error) {
        showNotification('Error fetching organizations: ' + error.message, 'error')
      } finally {
        loading.value = false
      }
    }

    const fetchOrganizationDetails = async (orgId) => {
      try {
        const response = await superAdminOrganizationService.getOrganizationById(orgId)
        
        if (response.success) {
          orgDetails.value = response.data
        }
      } catch (error) {
        showNotification('Error fetching organization details: ' + error.message, 'error')
      }
    }

    const createOrganization = async () => {
      createLoading.value = true
      try {
        const response = await superAdminOrganizationService.createOrganization(newOrganization)
        
        if (response.success) {
          showNotification('Organization created successfully', 'success')
          showCreateModal.value = false
          resetCreateForm()
          fetchOrganizations()
        }
      } catch (error) {
        showNotification('Error creating organization: ' + error.message, 'error')
      } finally {
        createLoading.value = false
      }
    }

    const updateOrganizationStatus = async () => {
      statusLoading.value = true
      try {
        const response = await superAdminOrganizationService.updateOrganizationStatus(
          selectedOrg.value.id, 
          statusUpdate.status
        )
        
        if (response.success) {
          showNotification('Organization status updated successfully', 'success')
          showStatusModal.value = false
          fetchOrganizations()
        }
      } catch (error) {
        showNotification('Error updating organization status: ' + error.message, 'error')
      } finally {
        statusLoading.value = false
      }
    }

    const confirmDeleteOrganization = (org) => {
      selectedOrg.value = org
      showDeleteModal.value = true
    }

    const confirmDelete = async () => {
      if (!selectedOrg.value) return
      
      try {
        const response = await superAdminOrganizationService.deleteOrganization(selectedOrg.value.id)
        
        if (response.success) {
          showNotification('Organization deleted successfully', 'success')
          showDetailsModal.value = false
          showDeleteModal.value = false
          await fetchOrganizations()
        }
      } catch (error) {
        showNotification('Error deleting organization: ' + error.message, 'error')
      }
    }

    const deleteOrganization = async (org) => {
      if (!confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
        return
      }

      try {
        const response = await superAdminOrganizationService.deleteOrganization(org.id)
        
        if (response.success) {
          showNotification('Organization deleted successfully', 'success')
          showDetailsModal.value = false
          fetchOrganizations()
        }
      } catch (error) {
        showNotification('Error deleting organization: ' + error.message, 'error')
      }
    }

    // Helper functions
    const handleSearch = () => {
      pagination.value.page = 1
      fetchOrganizations()
    }

    const handleClearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      pagination.value.page = 1
      fetchOrganizations()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.total_pages) {
        pagination.value.page = page
        fetchOrganizations()
      }
    }

    const resetCreateForm = () => {
      Object.assign(newOrganization, {
        name: '',
        abn: '',
        email: '',
        phone: '',
        website: '',
        address: {
          street: '',
          suburb: '',
          state: '',
          postcode: '',
          country: 'Australia'
        },
        ndis_registration: {
          registration_number: '',
          registration_status: '',
          expiry_date: null
        },
        admin_user: {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          password: ''
        },
        subscription: {
          plan_name: '',
          billing_email: '',
          max_users: 5,
          max_participants: 10,
          max_storage_gb: 5,
          billing_cycle: 'monthly'
        }
      })
    }

    const viewOrganization = async (org) => {
      selectedOrg.value = org
      await fetchOrganizationDetails(org.id)
      showDetailsModal.value = true
    }

    const editStatus = (org) => {
      selectedOrg.value = org
      statusUpdate.status = getSubscriptionStatus(org)
      statusUpdate.reason = ''
      showStatusModal.value = true
    }

    const getSubscriptionPlan = (org) => {
      return org.subscription?.plan_name || 'Unknown'
    }

    const getSubscriptionStatus = (org) => {
      return org.subscription?.status || 'active'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }

    const formatStatus = (status) => {
      if (!status) return 'Active'
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    // Lifecycle
    onMounted(() => {
      fetchOrganizations()
      
      // Auto-refresh data when window gains focus to prevent stale data
      const handleFocus = () => {
        fetchOrganizations()
      }
      
      window.addEventListener('focus', handleFocus)
      
      // Cleanup on unmount  
      return () => {
        window.removeEventListener('focus', handleFocus)
      }
    })

    return {
      // State
      organizations,
      loading,
      searchQuery,
      statusFilter,
      currentView,
      pagination,
      showCreateModal,
      showStatusModal,
      showDetailsModal,
      showDeleteModal,
      createLoading,
      statusLoading,
      selectedOrg,
      orgDetails,
      newOrganization,
      statusUpdate,

      // Methods
      fetchOrganizations,
      createOrganization,
      updateOrganizationStatus,
      confirmDeleteOrganization,
      confirmDelete,
      deleteOrganization,
      handleSearch,
      handleClearFilters,
      changePage,
      viewOrganization,
      editStatus,
      getSubscriptionPlan,
      getSubscriptionStatus,
      formatDate,
      formatStatus
    }
  }
}
</script>

<style>
/* Use consistent styling with Participants page */
.participants-container {
  padding: 0;
  background: transparent;
}

/* Override global page-header styles completely */
.participants-container .page-header {
  all: unset !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 1.5rem !important;
  padding: 1.5rem 2rem !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  border-radius: 16px !important;
  position: relative !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* Alternative selector with higher specificity */
.participants-container div.page-header {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px) !important;
}

/* Highest specificity with ID */
#superadmin-header {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  border-radius: 16px !important;
}

#superadmin-header::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 3px !important;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%) !important;
  background-size: 200% 100% !important;
  animation: shimmer 3s ease-in-out infinite !important;
  border-radius: 16px 16px 0 0 !important;
}

.participants-container .page-header::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 3px !important;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%) !important;
  background-size: 200% 100% !important;
  animation: shimmer 3s ease-in-out infinite !important;
  border-radius: 16px 16px 0 0 !important;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.header-content h1 {
  font-size: 1.75rem;
  margin: 0;
  color: var(--primary-gradient-start);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content p {
  margin: 0.5rem 0 0;
  color: var(--text-medium);
  font-size: 0.875rem;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, transparent, rgba(102,126,234,0.1), transparent);
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.stat-card:hover::after {
  opacity: 1;
  animation: shimmer 0.6s;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stat-card:hover .stat-icon {
  transform: rotate(5deg) scale(1.1);
}

.stat-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(45deg, currentColor, transparent);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover .stat-icon::before {
  opacity: 0.5;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-icon {
  background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.1));
  color: #3b82f6;
  box-shadow: 0 4px 15px rgba(59,130,246,0.2);
}

.success-icon {
  background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1));
  color: #22c55e;
  box-shadow: 0 4px 15px rgba(34,197,94,0.2);
}

.warning-icon {
  background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1));
  color: #f59e0b;
  box-shadow: 0 4px 15px rgba(245,158,11,0.2);
}

.danger-icon {
  background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1));
  color: #ef4444;
  box-shadow: 0 4px 15px rgba(239,68,68,0.2);
}

.stat-content h3 {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-content p {
  margin: 0.25rem 0 0;
  color: var(--text-medium);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Component-specific styles that extend the global theme */

/* Filters section - matching Participants style */
.filters-section {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.search-section {
  flex: 1;
  max-width: 400px;
  min-width: 250px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
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
  flex-wrap: nowrap;
  flex-shrink: 0;
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
  width: 140px;
  flex-shrink: 0;
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

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  color: white;
  box-shadow: 0 4px 15px rgba(102,126,234,0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102,126,234,0.4);
}

.btn-outline-elegant {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border: 2px solid rgba(102, 126, 234, 0.1);
  color: var(--text-medium);
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-outline-elegant:hover {
  border-color: var(--primary-gradient-start);
  color: var(--primary-gradient-start);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(102, 126, 234, 0.04) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* View Toggle - matching Participants style */
.view-toggle {
  display: flex;
  background: rgba(255,255,255,0.7);
  border-radius: 10px;
  padding: 2px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
}

.view-btn-elegant {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 0.875rem;
}

.view-btn-elegant.active {
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  color: white;
  box-shadow: 0 2px 8px rgba(102,126,234,0.3);
  transform: translateY(-1px);
}

.view-btn-elegant:hover:not(.active) {
  background: rgba(102,126,234,0.1);
  color: var(--primary-gradient-start);
}

/* Content card - matching Participants */
.content-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.99) 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
}

.content-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(164,88,234,0.2));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  opacity: 0.5;
  pointer-events: none;
}

.loading-state,
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-medium);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(102,126,234,0.1);
  border-top-color: var(--primary-gradient-start);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 3rem;
  color: var(--primary-gradient-start);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
  color: var(--text-dark);
}

.empty-state p {
  margin: 0 0 1.5rem;
  color: var(--text-medium);
}

/* List and Grid view styles - matching Participants */
.participants-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Grid View Styles */
.organizations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.organization-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.6);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.organization-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, transparent, rgba(102,126,234,0.1), transparent);
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}

.organization-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.organization-card:hover::before {
  opacity: 1;
  animation: shimmer 0.6s;
}

.org-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  position: relative;
}

.org-info {
  flex: 1;
  min-width: 0;
}

.org-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-abn {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-medium);
  font-weight: 500;
}

.org-details {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-medium);
}

.detail-row i {
  font-size: 0.75rem;
  color: var(--primary-gradient-start);
  width: 14px;
  text-align: center;
  flex-shrink: 0;
}

.detail-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 0.875rem;
  background: linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(102,126,234,0.04) 100%);
  border-radius: 10px;
  border: 1px solid rgba(102,126,234,0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-medium);
  font-weight: 500;
}

.stat-item i {
  color: var(--primary-gradient-start);
  font-size: 0.75rem;
}

.org-subscription {
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: flex-start;
}

.org-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 0.8fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #f3f4f6 100%);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-dark);
  border-bottom: 2px solid #e5e7eb;
}

.header-cell {
  padding: 0.5rem;
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 0.8fr 1fr 1fr 1fr;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  position: relative;
}

.list-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: scaleY(0);
  transition: transform 0.3s;
  border-radius: 0 4px 4px 0;
}

.list-row:hover {
  background: linear-gradient(135deg, rgba(102,126,234,0.05), rgba(164,88,234,0.02));
  transform: translateX(8px);
  box-shadow: 0 2px 10px rgba(102,126,234,0.1);
}

.list-row:hover::before {
  transform: scaleY(1);
}

.list-cell {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.participant-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.org-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.participant-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participant-name .name {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.participant-name .email {
  font-size: 0.75rem;
  color: var(--text-medium);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-medium);
}

.contact-info div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-info i {
  font-size: 0.75rem;
  color: var(--primary-gradient-start);
}

.subscription-info {
  display: flex;
  align-items: center;
}

.plan-badge {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(102,126,234,0.05));
  border: 1px solid rgba(102,126,234,0.2);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-gradient-start);
  text-transform: capitalize;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.status-badge.active {
  background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05));
  color: #16a34a;
  border: 1px solid rgba(34,197,94,0.2);
}

.status-badge.suspended {
  background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05));
  color: #d97706;
  border: 1px solid rgba(245,158,11,0.2);
}

.status-badge.cancelled {
  background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05));
  color: #dc2626;
  border: 1px solid rgba(239,68,68,0.2);
}

.counts-info {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-medium);
}

.counts-info span {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.counts-info i {
  color: var(--primary-gradient-start);
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.view-btn {
  background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05));
  color: #3b82f6;
  border: 1px solid rgba(59,130,246,0.2);
}

.view-btn:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}

.edit-btn {
  background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05));
  color: #f59e0b;
  border: 1px solid rgba(245,158,11,0.2);
}

.edit-btn:hover {
  background: #f59e0b;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245,158,11,0.3);
}

.delete-btn {
  background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05));
  color: #ef4444;
  border: 1px solid rgba(239,68,68,0.2);
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
}

.detail-section h4 {
  margin: 0 0 var(--space-md) 0;
  color: var(--gray-800);
  font-size: var(--font-size-lg);
  border-bottom: 2px solid var(--primary-500);
  padding-bottom: var(--space-xs);
}

.detail-item {
  display: flex;
  margin-bottom: var(--space-sm);
  align-items: flex-start;
}

.detail-item label {
  font-weight: 600;
  min-width: 120px;
  color: var(--gray-600);
  margin-right: var(--space-md);
  font-size: var(--font-size-sm);
}

.detail-item span {
  flex: 1;
  color: var(--gray-800);
}

.user-list,
.participant-list {
  max-height: 200px;
  overflow-y: auto;
}

.user-item,
.participant-item {
  padding: var(--space-sm);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xs);
  transition: var(--transition-fast);
}

.user-item:hover,
.participant-item:hover {
  border-color: var(--primary-300);
  background: var(--gray-50);
}

.user-name,
.participant-name {
  font-weight: 600;
  display: block;
  color: var(--gray-800);
  font-size: var(--font-size-sm);
}

.user-email,
.participant-ndis {
  font-size: var(--font-size-xs);
  color: var(--gray-600);
}

.user-role {
  font-size: var(--font-size-xs);
  color: var(--primary-600);
  text-transform: capitalize;
}

/* Pagination styles - matching Participants */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem 0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
  border: 2px solid rgba(102,126,234,0.1);
  border-radius: 10px;
  font-weight: 500;
  color: var(--primary-gradient-start);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102,126,234,0.3);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-medium);
}

.page-select {
  padding: 0.375rem 0.75rem;
  border: 2px solid rgba(102,126,234,0.1);
  border-radius: 8px;
  background: white;
  color: var(--text-dark);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-select:focus {
  outline: none;
  border-color: var(--primary-gradient-start);
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

/* Dark Theme Support */
[data-theme="dark"] .participants-container {
  background: var(--gray-900);
}

[data-theme="dark"] .participants-container .page-header,
[data-theme="dark"] #superadmin-header {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%) !important;
  border: 1px solid rgba(75, 85, 99, 0.3) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

[data-theme="dark"] .header-content h1 {
  color: white;
}

[data-theme="dark"] .header-content p {
  color: rgba(255,255,255,0.85);
}

[data-theme="dark"] .btn-primary {
  background: linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(40,40,50,0.95) 100%);
  color: white;
  border: 2px solid rgba(255,255,255,0.1);
}

[data-theme="dark"] .btn-primary:hover {
  background: rgba(40,40,50,1);
}

[data-theme="dark"] .stat-card {
  background: linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(40,40,50,0.95) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

[data-theme="dark"] .stat-content h3 {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

[data-theme="dark"] .stat-content p {
  color: var(--gray-400);
}

[data-theme="dark"] .filters-section {
  background: linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(40,40,50,0.95) 100%);
  border: 1px solid rgba(255,255,255,0.1);
}

[data-theme="dark"] .form-input,
[data-theme="dark"] .form-select {
  background: rgba(20,20,30,0.8);
  border: 2px solid rgba(255,255,255,0.1);
  color: var(--gray-200);
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-select:focus {
  border-color: #667eea;
  background: rgba(20,20,30,0.95);
}

[data-theme="dark"] .btn-outline-elegant {
  background: linear-gradient(135deg, rgba(30,30,40,0.9) 0%, rgba(40,40,50,0.9) 100%);
  border: 2px solid rgba(102,126,234,0.3);
  color: var(--gray-300);
}

[data-theme="dark"] .btn-outline-elegant:hover {
  background: linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(102,126,234,0.1) 100%);
  border-color: #667eea;
  color: white;
}

[data-theme="dark"] .content-card {
  background: linear-gradient(135deg, rgba(30,30,40,0.98) 0%, rgba(40,40,50,0.98) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}

[data-theme="dark"] .participants-list {
  background: rgba(20,20,30,0.95);
}

[data-theme="dark"] .list-header {
  background: linear-gradient(135deg, rgba(40,40,50,0.95) 0%, rgba(50,50,60,0.95) 100%);
  color: var(--gray-200);
  border-bottom: 2px solid rgba(255,255,255,0.1);
}

[data-theme="dark"] .list-row {
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

[data-theme="dark"] .list-row:hover {
  background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(102,126,234,0.05));
}

[data-theme="dark"] .participant-name .name {
  color: var(--gray-100);
}

[data-theme="dark"] .participant-name .email {
  color: var(--gray-500);
}

[data-theme="dark"] .contact-info {
  color: var(--gray-400);
}

[data-theme="dark"] .counts-info {
  color: var(--gray-400);
}

[data-theme="dark"] .pagination-btn {
  background: linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(40,40,50,0.95) 100%);
  border: 2px solid rgba(102,126,234,0.3);
  color: var(--gray-200);
}

[data-theme="dark"] .pagination-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
}

[data-theme="dark"] .pagination-info {
  color: var(--gray-400);
}

[data-theme="dark"] .page-select {
  background: rgba(20,20,30,0.9);
  border: 2px solid rgba(102,126,234,0.3);
  color: var(--gray-200);
}

/* Dark theme for grid view */
[data-theme="dark"] .organizations-grid .organization-card {
  background: linear-gradient(135deg, rgba(30,30,40,0.98) 0%, rgba(40,40,50,0.98) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

[data-theme="dark"] .organizations-grid .organization-card:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}

[data-theme="dark"] .org-info h3 {
  color: var(--gray-100);
}

[data-theme="dark"] .org-abn {
  color: var(--gray-500);
}

[data-theme="dark"] .detail-row {
  color: var(--gray-400);
}

[data-theme="dark"] .detail-row i {
  color: #667eea;
}

[data-theme="dark"] .org-stats {
  background: linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(102,126,234,0.08) 100%);
  border: 1px solid rgba(102,126,234,0.2);
}

[data-theme="dark"] .stat-item {
  color: var(--gray-300);
}

[data-theme="dark"] .stat-item i {
  color: #667eea;
}

[data-theme="dark"] .org-actions {
  border-top: 1px solid rgba(255,255,255,0.1);
}

[data-theme="dark"] .modal-content {
  background: var(--gray-800);
  border: 1px solid rgba(255,255,255,0.1);
}

[data-theme="dark"] .modal-header {
  background: linear-gradient(135deg, rgba(40,40,50,0.95) 0%, rgba(50,50,60,0.95) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  color: white;
}

[data-theme="dark"] .modal-body {
  color: var(--gray-200);
}

[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background: rgba(20,20,30,0.8);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--gray-200);
}

[data-theme="dark"] input:focus,
[data-theme="dark"] select:focus,
[data-theme="dark"] textarea:focus {
  border-color: #667eea;
  background: rgba(20,20,30,0.95);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .list-header,
  .list-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .list-cell {
    padding: 0.75rem;
  }

  /* Mobile grid view styles */
  .organizations-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .organization-card {
    padding: 1.25rem;
  }

  .org-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .org-info h3 {
    font-size: 1rem;
    white-space: normal;
    word-break: break-word;
  }

  .org-stats {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .filters-row {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filter-controls {
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .search-section {
    max-width: 100%;
    min-width: 200px;
    flex: 1 1 60%;
  }

  .form-select,
  .btn-outline-elegant {
    min-width: auto;
    flex: 0 0 auto;
  }
}
</style>
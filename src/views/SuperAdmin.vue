<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Super Admin - Organization Management</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i> Create Organization
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            @input="handleSearch" 
            placeholder="Search organizations..." 
            class="form-input"
            type="text"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="handleSearch" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant">
            <i class="fas fa-times"></i>
            Clear Filters
          </button>
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

        <div v-else class="organizations-table">
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Contact</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>Users</th>
                <th>Participants</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="org in organizations" :key="org.id">
                <td>
                  <div class="org-info">
                    <strong>{{ org.name }}</strong>
                    <div class="org-details">
                      <span v-if="org.abn">ABN: {{ org.abn }}</span>
                      <span v-if="org.website">{{ org.website }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-info">
                    <div v-if="org.email">{{ org.email }}</div>
                    <div v-if="org.phone">{{ org.phone }}</div>
                  </div>
                </td>
                <td>
                  <div class="subscription-info">
                    <span class="plan-name">{{ getSubscriptionPlan(org) }}</span>
                    <span class="subscription-status" :class="getSubscriptionStatus(org)">
                      {{ getSubscriptionStatus(org) }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="`status-${getSubscriptionStatus(org)}`">
                    {{ formatStatus(getSubscriptionStatus(org)) }}
                  </span>
                  <button @click="editStatus(org)" class="btn btn-xs btn-edit-status" title="Edit Status">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
                <td>{{ org.users?.length || 0 }}</td>
                <td>{{ org.participants?.length || 0 }}</td>
                <td>{{ formatDate(org.created_at) }}</td>
                <td>
                  <div class="action-buttons">
                    <button @click="viewOrganization(org)" class="btn btn-sm btn-info">
                      <i class="fas fa-eye"></i>
                      View
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total_pages > 1" class="pagination">
          <button 
            @click="changePage(pagination.page - 1)" 
            :disabled="pagination.page === 1"
            class="btn btn-sm"
          >
            Previous
          </button>
          
          <span class="page-info">
            Page {{ pagination.page }} of {{ pagination.total_pages }}
            ({{ pagination.total }} total)
          </span>

          <button 
            @click="changePage(pagination.page + 1)" 
            :disabled="pagination.page === pagination.total_pages"
            class="btn btn-sm"
          >
            Next
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

<style scoped>
/* Component-specific styles that extend the global theme */

/* Participants-style filters */
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

.org-info strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--gray-800);
}

.org-details {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}

.org-details span {
  display: block;
}

.contact-info div {
  margin-bottom: 0.25rem;
  font-size: var(--font-size-sm);
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.plan-name {
  font-weight: 600;
  text-transform: capitalize;
  color: var(--gray-800);
}

.subscription-status {
  font-size: var(--font-size-xs);
  text-transform: capitalize;
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

.btn-edit-status {
  margin-left: var(--space-xs);
  background: transparent;
  border: 1px solid var(--gray-300);
  color: var(--gray-600);
  transition: var(--transition-fast);
}

.btn-edit-status:hover {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.status-filter {
  min-width: 150px;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--gray-200);
}

.page-info {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
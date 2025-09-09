<template>
  <div class="incident-reports-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-exclamation-triangle"></i>
          Incident Reports Management
        </h1>
        <p>Track, manage and review incident reports for NDIS compliance</p>
      </div>
      <button 
        v-if="canCreateReports"
        @click="showCreateModal = true" 
        class="btn btn-primary"
      >
        <i class="fas fa-plus"></i>
        New Incident Report
      </button>
    </div>

    <!-- Stats Overview -->
    <div v-if="canViewStats && stats" class="stats-overview">
      <div class="stat-card primary">
        <div class="stat-icon primary-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total_reports || 0 }}</h3>
          <p>Total Reports</p>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon warning-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.recent_reports || 0 }}</h3>
          <p>Recent (30d)</p>
        </div>
      </div>
      
      <div class="stat-card danger">
        <div class="stat-icon danger-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.ndis_notifications_required || 0 }}</h3>
          <p>NDIS Required</p>
        </div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-icon info-icon">
          <i class="fas fa-search"></i>
        </div>
        <div class="stat-content">
          <h3>{{ getStatusCount('under_review') }}</h3>
          <p>Under Review</p>
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
            placeholder="Search incident reports..." 
            class="form-input"
            @input="applyFilters"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="filters.status" @change="applyFilters" class="form-select">
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="requires_action">Requires Action</option>
          </select>
          
          <select v-model="filters.severity" @change="applyFilters" class="form-select">
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <select v-model="filters.incident_type" @change="applyFilters" class="form-select">
            <option value="">All Types</option>
            <option value="injury">Injury</option>
            <option value="medication_error">Medication Error</option>
            <option value="behavioral">Behavioral</option>
            <option value="property_damage">Property Damage</option>
            <option value="missing_person">Missing Person</option>
            <option value="environmental">Environmental</option>
            <option value="other">Other</option>
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

    <!-- Incident Reports Content -->
    <div class="content-card">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading incident reports...</p>
      </div>

      <div v-else-if="filteredIncidentReports.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>No Incident Reports Yet</h3>
        <p>Get started by creating your first incident report</p>
        <button 
          v-if="canCreateReports"
          @click="showCreateModal = true" 
          class="btn btn-primary"
        >
          <i class="fas fa-plus"></i>
          Create First Report
        </button>
      </div>

      <div v-else-if="filteredIncidentReports.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <!-- Grid View -->
      <div v-else-if="currentView === 'grid'" class="incident-reports-grid">
        <div v-for="report in paginatedIncidentReports" :key="report.id" class="incident-card">
          <div class="incident-header">
            <div class="incident-info">
              <h3>{{ report.participant?.first_name }} {{ report.participant?.last_name }}</h3>
              <p class="incident-type">{{ formatIncidentType(report.incident_type) }}</p>
            </div>
            <div class="incident-severity">
              <span :class="getSeverityBadgeClass(report.severity)">
                {{ report.severity?.toUpperCase() }}
              </span>
            </div>
          </div>
          
          <div class="incident-details">
            <div class="detail-row">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatDate(report.incident_date) }} {{ report.incident_time }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ report.location }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-user"></i>
              <span>{{ report.reporter?.first_name }} {{ report.reporter?.last_name }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-flag"></i>
              <span :class="getStatusBadgeClass(report.status)">{{ formatStatus(report.status) }}</span>
            </div>
            <div class="detail-row" v-if="report.ndis_notified || needsNDISNotification(report)">
              <i class="fas fa-bell"></i>
              <span v-if="report.ndis_notified" class="text-success">NDIS Notified</span>
              <span v-else class="text-danger">NDIS Notification Required</span>
            </div>
          </div>
          
          <div class="incident-actions">
            <button @click="viewReport(report)" class="action-btn view-btn" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button 
              v-if="canUpdateReports"
              @click="editReport(report)" 
              class="action-btn edit-btn" 
              title="Edit Report"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else class="incident-reports-list">
        <div class="list-header">
          <div class="header-cell">Date/Time</div>
          <div class="header-cell">Participant</div>
          <div class="header-cell">Type</div>
          <div class="header-cell">Severity</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Reporter</div>
          <div class="header-cell">NDIS</div>
          <div class="header-cell">Actions</div>
        </div>
        
        <div class="list-body">
          <div v-for="report in paginatedIncidentReports" :key="report.id" class="list-row" @click="viewReport(report)">
            <div class="list-cell" data-label="Date/Time">
              <div class="cell-main">{{ formatDate(report.incident_date) }}</div>
              <div class="cell-sub">{{ report.incident_time }}</div>
            </div>
            <div class="list-cell" data-label="Participant">
              <div class="cell-main">{{ report.participant?.first_name }} {{ report.participant?.last_name }}</div>
              <div class="cell-sub">{{ report.location }}</div>
            </div>
            <div class="list-cell" data-label="Type">
              <span class="badge bg-secondary">{{ formatIncidentType(report.incident_type) }}</span>
            </div>
            <div class="list-cell" data-label="Severity">
              <span :class="getSeverityBadgeClass(report.severity)">{{ report.severity?.toUpperCase() }}</span>
            </div>
            <div class="list-cell" data-label="Status">
              <span :class="getStatusBadgeClass(report.status)">{{ formatStatus(report.status) }}</span>
            </div>
            <div class="list-cell" data-label="Reporter">
              {{ report.reporter?.first_name }} {{ report.reporter?.last_name }}
            </div>
            <div class="list-cell" data-label="NDIS">
              <span v-if="report.ndis_notified" class="text-success"><i class="fas fa-check"></i></span>
              <span v-else-if="needsNDISNotification(report)" class="text-danger"><i class="fas fa-exclamation-triangle"></i></span>
              <span v-else class="text-muted"><i class="fas fa-minus"></i></span>
            </div>
            <div class="list-cell actions-cell" data-label="Actions" @click.stop>
              <button @click="viewReport(report)" class="action-btn view-btn" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button 
                v-if="canUpdateReports"
                @click="editReport(report)" 
                class="action-btn edit-btn" 
                title="Edit Report"
              >
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination && pagination.total_pages > 1" class="pagination-container">
        <div class="pagination-info">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
          {{ pagination.total }} incident reports
        </div>
        <div class="pagination-controls">
          <button 
            @click="changePage(pagination.page - 1)" 
            :disabled="pagination.page <= 1"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div class="pagination-numbers">
            <button 
              v-for="page in getVisiblePages()" 
              :key="page"
              @click="changePage(page)"
              :class="['pagination-number', { active: page === pagination.page }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="changePage(pagination.page + 1)" 
            :disabled="pagination.page >= pagination.total_pages"
            class="pagination-btn"
          >
            Next
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Create Incident Report Modal -->
    <CreateIncidentReportModal
      v-if="showCreateModal"
      :participants="participants"
      @close="showCreateModal = false"
      @created="handleReportCreated"
    />

    <!-- View/Edit Incident Report Modal -->
    <ViewIncidentReportModal
      v-if="showViewModal"
      :report="selectedReport"
      :can-edit="canUpdateReports"
      @close="showViewModal = false"
      @updated="handleReportUpdated"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useParticipantsStore } from '@/stores/participants'
import { incidentReportService } from '@/services/incidentReports'
import CreateIncidentReportModal from '@/components/modals/CreateIncidentReportModal.vue'
import ViewIncidentReportModal from '@/components/modals/ViewIncidentReportModal.vue'
import { showSuccess, showErrorNotification } from '@/utils/notifications'

export default {
  name: 'IncidentReports',
  components: {
    CreateIncidentReportModal,
    ViewIncidentReportModal
  },
  setup() {
    const authStore = useAuthStore()
    const participantsStore = useParticipantsStore()

    // Reactive data
    const loading = ref(false)
    const incidentReports = ref([])
    const stats = ref(null)
    const pagination = ref(null)
    const showCreateModal = ref(false)
    const showViewModal = ref(false)
    const selectedReport = ref(null)
    
    // View and search
    const currentView = ref('list')
    const searchQuery = ref('')

    // Filters
    const filters = ref({
      status: '',
      severity: '',
      incident_type: '',
      participant_id: '',
      page: 1,
      limit: 20
    })

    // Computed properties
    const user = computed(() => authStore.user)
    const participants = computed(() => participantsStore.participants)
    
    const canCreateReports = computed(() => {
      return user.value?.role === 'care_worker' || user.value?.role === 'admin'
    })
    
    const canUpdateReports = computed(() => {
      return user.value?.role === 'support_coordinator' || 
             user.value?.role === 'admin' || 
             user.value?.role === 'manager'
    })
    
    const canViewStats = computed(() => {
      return user.value?.role === 'support_coordinator' || 
             user.value?.role === 'admin' || 
             user.value?.role === 'manager'
    })
    
    // Filtered incident reports based on search query
    const filteredIncidentReports = computed(() => {
      if (!searchQuery.value) {
        return incidentReports.value
      }
      
      const query = searchQuery.value.toLowerCase()
      return incidentReports.value.filter(report => 
        report.participant?.first_name?.toLowerCase().includes(query) ||
        report.participant?.last_name?.toLowerCase().includes(query) ||
        report.incident_type?.toLowerCase().includes(query) ||
        report.location?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.reporter?.first_name?.toLowerCase().includes(query) ||
        report.reporter?.last_name?.toLowerCase().includes(query)
      )
    })
    
    // Paginated incident reports
    const paginatedIncidentReports = computed(() => {
      return filteredIncidentReports.value
    })

    // Methods
    const loadIncidentReports = async () => {
      try {
        loading.value = true
        const cleanFilters = Object.fromEntries(
          Object.entries(filters.value).filter(([key, value]) => value !== '')
        )
        
        const response = await incidentReportService.getIncidentReports(cleanFilters)
        incidentReports.value = response.incident_reports || []
        pagination.value = response.pagination
      } catch (error) {
        console.error('Error loading incident reports:', error)
        showErrorNotification(error, 'Failed to load incident reports')
        // Set empty state to prevent UI issues
        incidentReports.value = []
        pagination.value = null
      } finally {
        loading.value = false
      }
    }

    const loadStats = async () => {
      if (!canViewStats.value) return
      
      try {
        const response = await incidentReportService.getIncidentReportStats()
        stats.value = response
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    const loadParticipants = async () => {
      if (participants.value.length === 0) {
        await participantsStore.fetchParticipants()
      }
    }

    const refreshData = async () => {
      try {
        // Load essential data first (incident reports)
        await loadIncidentReports()
        
        // Load secondary data in parallel but don't block main content
        Promise.all([
          loadStats().catch(err => console.warn('Stats loading failed:', err)),
          loadParticipants().catch(err => console.warn('Participants loading failed:', err))
        ])
      } catch (error) {
        console.error('Error refreshing data:', error)
      }
    }

    // Debounced filter application to prevent excessive API calls
    let filterTimeout = null
    const applyFilters = () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout)
      }
      filterTimeout = setTimeout(() => {
        filters.value.page = 1
        loadIncidentReports()
      }, 300)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value?.total_pages) {
        filters.value.page = page
        loadIncidentReports()
      }
    }

    const getVisiblePages = () => {
      if (!pagination.value) return []
      
      const current = pagination.value.page
      const total = pagination.value.total_pages
      const pages = []
      
      const start = Math.max(1, current - 2)
      const end = Math.min(total, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }

    const viewReport = (report) => {
      selectedReport.value = report
      showViewModal.value = true
    }

    const editReport = (report) => {
      selectedReport.value = report
      showViewModal.value = true
    }

    const handleReportCreated = () => {
      showCreateModal.value = false
      showSuccess('Success', 'Incident report created successfully')
      refreshData()
    }

    const handleReportUpdated = () => {
      showViewModal.value = false
      showSuccess('Success', 'Incident report updated successfully')
      refreshData()
    }

    // Utility methods
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-AU')
    }

    const formatIncidentType = (type) => {
      return type?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || ''
    }

    const formatStatus = (status) => {
      return status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || ''
    }

    const getSeverityBadgeClass = (severity) => {
      const classes = {
        low: 'badge bg-success',
        medium: 'badge bg-warning',
        high: 'badge bg-danger',
        critical: 'badge bg-dark'
      }
      return classes[severity] || 'badge bg-secondary'
    }

    const getStatusBadgeClass = (status) => {
      const classes = {
        submitted: 'badge bg-primary',
        under_review: 'badge bg-warning',
        completed: 'badge bg-success',
        requires_action: 'badge bg-danger'
      }
      return classes[status] || 'badge bg-secondary'
    }

    const needsNDISNotification = (report) => {
      return (report.severity === 'high' || report.severity === 'critical') && !report.ndis_notified
    }

    const getStatusCount = (status) => {
      if (!stats.value?.status_breakdown) return 0
      const statusItem = stats.value.status_breakdown.find(s => s.status === status)
      return statusItem?.count || 0
    }
    
    // Cleanup function for debouncing
    const cleanup = () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout)
      }
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = {
        status: '',
        severity: '',
        incident_type: '',
        participant_id: '',
        page: 1,
        limit: 20
      }
      applyFilters()
    }

    // Lifecycle
    onMounted(() => {
      refreshData()
    })

    return {
      // Reactive data
      loading,
      incidentReports,
      stats,
      pagination,
      showCreateModal,
      showViewModal,
      selectedReport,
      filters,
      currentView,
      searchQuery,
      
      // Computed
      user,
      participants,
      canCreateReports,
      canUpdateReports,
      canViewStats,
      filteredIncidentReports,
      paginatedIncidentReports,
      
      // Methods
      refreshData,
      applyFilters,
      changePage,
      getVisiblePages,
      viewReport,
      editReport,
      handleReportCreated,
      handleReportUpdated,
      clearFilters,
      cleanup,
      
      // Utilities
      formatDate,
      formatIncidentType,
      formatStatus,
      getSeverityBadgeClass,
      getStatusBadgeClass,
      needsNDISNotification,
      getStatusCount
    }
  }
}
</script>

<style scoped>
/* Container */
.incident-reports-container {
  padding: 1.5rem;
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  position: relative;
}


/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (prefers-color-scheme: dark) {
  .page-header {
    background: rgba(45, 55, 72, 0.3);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(160, 174, 192, 0.2);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 
                0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content h1 i {
  color: var(--accent-color);
}

.header-content p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Stats Overview */
.stats-overview {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 768px) {
  .stats-overview {
    flex-wrap: nowrap;
  }
}

.stat-card {
  background: white !important;
  border-radius: 16px;
  padding: 1.25rem 1.25rem 1.25rem 1.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  flex: 1;
  min-width: 200px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  border-radius: 16px 0 0 16px;
}

.stat-card.primary::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card.success::before {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.warning::before {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.info::before {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card.danger::before {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card.primary:hover {
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
}

.stat-card.success:hover {
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);
}

.stat-card.warning:hover {
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.2);
}

.stat-card.info:hover {
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
}

.stat-card.danger:hover {
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.2);
}

[data-theme="dark"] .stat-card {
  background: var(--card-background) !important;
  border: 1px solid rgba(160, 174, 192, 0.2) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 
              0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
}

[data-theme="dark"] .stat-card:hover {
  border-color: rgba(160, 174, 192, 0.3) !important;
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
}

[data-theme="dark"] .stat-content h3 {
  color: var(--text-dark) !important;
}

[data-theme="dark"] .stat-content p {
  color: var(--text-secondary) !important;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-icon.primary-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.stat-icon.success-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.stat-icon.warning-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.stat-icon.info-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.stat-icon.danger-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  flex: 1;
  text-align: right;
}

.stat-content h3 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1a202c !important;
  line-height: 1;
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  font-size: 1rem;
  color: #718096 !important;
  margin: 0;
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

@media (prefers-color-scheme: dark) {
  .filters-section {
    border: 1px solid rgba(160, 174, 192, 0.2);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 
                0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }
}

.filters-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 350px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.75rem 0.65rem 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-color-alpha);
}

[data-theme="dark"] .filters-section {
  background: var(--card-background) !important;
  border: 1px solid rgba(160, 174, 192, 0.2) !important;
}

[data-theme="dark"] .form-input,
[data-theme="dark"] .form-select {
  border: 1px solid rgba(160, 174, 192, 0.3) !important;
  background: rgba(45, 55, 72, 0.8) !important;
  color: var(--text-dark) !important;
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-select:focus {
  border-color: var(--accent-color) !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3) !important;
  background: rgba(45, 55, 72, 0.9) !important;
}

[data-theme="dark"] .search-box i {
  color: var(--text-secondary) !important;
}

[data-theme="dark"] .view-toggle {
  border: 2px solid rgba(160, 174, 192, 0.3) !important;
}

[data-theme="dark"] .view-btn-elegant {
  background: var(--card-background) !important;
  color: var(--text-secondary) !important;
}

[data-theme="dark"] .view-btn-elegant.active {
  background: var(--accent-color) !important;
  color: white !important;
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.form-select {
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.85rem;
  transition: all 0.3s ease;
  min-width: 110px;
  max-width: 130px;
}

.form-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-color-alpha);
}

.view-toggle {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.view-btn-elegant {
  background: var(--card-bg);
  color: var(--text-secondary);
  border: none;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn-elegant:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.view-btn-elegant.active {
  background: var(--accent-color);
  color: white;
}

/* Content Card */
.content-card {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

[data-theme="dark"] .content-card {
  background: var(--card-background) !important;
  border: 1px solid rgba(160, 174, 192, 0.2) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 
              0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-left-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state i {
  font-size: 4rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

/* Grid View */
.incident-reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  padding: 1.25rem;
}

@media (max-width: 768px) {
  .incident-reports-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
}

.incident-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .incident-card {
    padding: 1rem;
  }
}

.incident-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color) 0%, var(--secondary-color) 100%);
}

.incident-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color-light);
}

[data-theme="dark"] .incident-card {
  background: var(--card-background) !important;
  border: 1px solid rgba(160, 174, 192, 0.2) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 
              0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
}

[data-theme="dark"] .incident-card:hover {
  border-color: rgba(160, 174, 192, 0.3) !important;
  box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
}

[data-theme="dark"] .incident-info h3 {
  color: var(--text-dark) !important;
}

[data-theme="dark"] .incident-type {
  color: var(--text-secondary) !important;
}

[data-theme="dark"] .detail-row span {
  color: var(--text-dark) !important;
}

.incident-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.incident-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.incident-type {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

.incident-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.detail-row i {
  color: var(--accent-color);
  width: 16px;
  text-align: center;
}

.detail-row span {
  color: var(--text-primary);
}

.incident-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* List View */
.incident-reports-list {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .incident-reports-list {
    overflow-x: visible;
  }
}

.list-header {
  display: grid;
  grid-template-columns: 1.8fr 1.5fr 1.2fr 1fr 1.2fr 1fr 0.8fr 1fr;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--secondary-bg);
  border-bottom: 2px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.85rem;
  min-width: 800px;
}

@media (max-width: 1024px) {
  .list-header {
    grid-template-columns: 2fr 1.5fr 1fr 1fr 1.2fr 1fr;
    min-width: 600px;
  }
  .list-header .header-cell:nth-child(7),
  .list-header .header-cell:nth-child(8) {
    display: none;
  }
}

@media (max-width: 768px) {
  .list-header {
    display: none;
  }
}

.list-body {
  max-height: 600px;
  overflow-y: auto;
}

.list-row {
  display: grid;
  grid-template-columns: 1.8fr 1.5fr 1.2fr 1fr 1.2fr 1fr 0.8fr 1fr;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 800px;
}

@media (max-width: 1024px) {
  .list-row {
    grid-template-columns: 2fr 1.5fr 1fr 1fr 1.2fr 1fr;
    min-width: 600px;
  }
  .list-row .list-cell:nth-child(7),
  .list-row .list-cell:nth-child(8) {
    display: none;
  }
}

@media (max-width: 768px) {
  .list-row {
    display: block;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    border: 1px solid var(--border-color);
    min-width: auto;
    background: var(--card-bg);
  }
  
  .list-row .list-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color-light);
  }
  
  .list-row .list-cell:last-child {
    border-bottom: none;
  }
  
  .list-row .list-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
}

.list-row:hover {
  background: var(--hover-bg);
}

[data-theme="dark"] .list-header {
  background: var(--card-background) !important;
  border-bottom: 2px solid rgba(160, 174, 192, 0.2) !important;
  color: var(--text-dark) !important;
}

[data-theme="dark"] .list-row {
  background: var(--card-background) !important;
  border-bottom: 1px solid rgba(160, 174, 192, 0.1) !important;
  color: var(--text-dark) !important;
}

[data-theme="dark"] .list-row:hover {
  background: var(--hover-bg) !important;
  border-color: rgba(160, 174, 192, 0.3) !important;
}

[data-theme="dark"] .cell-main {
  color: var(--text-dark) !important;
}

[data-theme="dark"] .cell-sub {
  color: var(--text-secondary) !important;
}

[data-theme="dark"] .loading-state,
[data-theme="dark"] .empty-state {
  color: var(--text-secondary) !important;
}

[data-theme="dark"] .empty-state h3 {
  color: var(--text-dark) !important;
}

[data-theme="dark"] .empty-state i {
  color: var(--text-secondary) !important;
}

.list-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 0.9rem;
}

.cell-main {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.cell-sub {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.actions-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

/* Action Buttons */
.action-btn {
  background: none;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.view-btn {
  color: var(--info-color);
  border-color: var(--info-color-light);
}

.view-btn:hover {
  background: var(--info-color);
  color: white;
  transform: scale(1.05);
}

.edit-btn {
  color: var(--warning-color);
  border-color: var(--warning-color-light);
}

.edit-btn:hover {
  background: var(--warning-color);
  color: white;
  transform: scale(1.05);
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bg-success {
  background: var(--success-color);
  color: white;
}

.bg-warning {
  background: var(--warning-color);
  color: white;
}

.bg-danger {
  background: var(--danger-color);
  color: white;
}

.bg-dark {
  background: var(--dark-color);
  color: white;
}

.bg-primary {
  background: var(--primary-color);
  color: white;
}

.bg-info {
  background: var(--info-color);
  color: white;
}

.bg-secondary {
  background: var(--secondary-color);
  color: white;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--secondary-bg);
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-number {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-number:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color-light);
}

.pagination-number.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* Buttons */
.btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn:hover {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-color) 100%);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--accent-color-dark) 0%, var(--secondary-color-dark) 100%);
}

.btn-outline-elegant {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.btn-outline-elegant:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
  border-color: var(--accent-color-light);
  transform: translateY(-1px);
}

@media (prefers-color-scheme: dark) {
  .btn-outline-elegant {
    border-color: rgba(160, 174, 192, 0.3);
    color: var(--text-secondary);
    background: var(--card-bg);
  }
  
  .btn-outline-elegant:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--accent-color-light);
  }
  
  .view-btn-elegant {
    background: var(--card-bg);
    color: var(--text-secondary);
    border: 1px solid rgba(160, 174, 192, 0.2);
  }
  
  .view-btn-elegant:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: rgba(160, 174, 192, 0.3);
  }
  
  .view-btn-elegant.active {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .incident-reports-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
  
  .list-header,
  .list-row {
    grid-template-columns: 1.5fr 1.2fr 1fr 1fr 1fr 0.8fr;
  }
  
  .list-header .header-cell:nth-child(7),
  .list-header .header-cell:nth-child(8),
  .list-row .list-cell:nth-child(7),
  .list-row .list-cell:nth-child(8) {
    display: none;
  }
}

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .filters-row {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .filter-controls {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .form-select {
    min-width: 100px;
    max-width: 120px;
    font-size: 0.8rem;
  }
}

@media (max-width: 900px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-box {
    min-width: unset;
    max-width: none;
  }
  
  .filter-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .incident-reports-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 1rem 1.5rem;
    min-height: 80px;
  }
  
  .stat-content h3 {
    font-size: 1.875rem;
  }
  
  /* Switch to card view on mobile */
  .view-toggle {
    display: none;
  }
  
  .incident-reports-list {
    display: none !important;
  }
  
  .incident-reports-grid {
    display: grid !important;
  }
  
  /* Enhanced mobile card design */
  .incident-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .incident-card:hover {
    transform: none; /* Remove hover transform on mobile */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .incident-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .incident-severity {
    align-self: flex-start;
  }
  
  .incident-info h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .detail-row {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color-light);
  }
  
  .detail-row:last-child {
    border-bottom: none;
  }
  
  .incident-actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    gap: 0.75rem;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .incident-reports-container {
    padding: 0.75rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .header-content h1 {
    font-size: 1.375rem;
    margin-bottom: 0.25rem;
  }
  
  .header-content p {
    font-size: 0.95rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem;
    font-size: 0.95rem;
  }
  
  .filters-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .search-box input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 1rem;
  }
  
  .filter-controls {
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  
  .form-select {
    flex: 1;
    min-width: auto;
    padding: 0.625rem 0.5rem;
  }
  
  .btn-outline-elegant {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
  
  /* Enhanced pagination for mobile */
  .pagination-container {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1rem;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .pagination-btn {
    flex: 1;
    min-width: 80px;
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .pagination-numbers {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
  
  .pagination-number {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
  
  /* Hide some pagination numbers on very small screens */
  .pagination-numbers .pagination-number:nth-child(n+6) {
    display: none;
  }
}

@media (max-width: 480px) {
  .incident-reports-container {
    padding: 0.5rem;
  }
  
  .page-header {
    margin-bottom: 1rem;
  }
  
  .header-content h1 {
    font-size: 1.25rem;
  }
  
  .stats-overview {
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 0.875rem 1rem;
    min-height: 70px;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
  
  .filters-section {
    padding: 0.75rem;
  }
  
  .content-card {
    border-radius: 12px;
  }
  
  .incident-reports-grid {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .incident-card {
    padding: 0.875rem;
  }
  
  .incident-info h3 {
    font-size: 1rem;
  }
  
  .detail-row {
    font-size: 0.875rem;
  }
  
  .detail-row i {
    width: 14px;
  }
  
  .incident-actions {
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
  }
  
  /* Stack pagination buttons vertically on very small screens */
  .pagination-controls {
    flex-direction: column;
  }
  
  .pagination-btn {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .pagination-numbers {
    gap: 0.25rem;
  }
  
  .pagination-numbers .pagination-number:nth-child(n+4) {
    display: none;
  }
  
  /* Simplified badges on mobile */
  .badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --card-bg: #2d3748;
    --text-primary: #f7fafc;
    --text-secondary: #a0aec0;
    --border-color: #4a5568;
    --hover-bg: #4a5568;
    --input-bg: #2d3748;
    --secondary-bg: #4a5568;
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
    --shadow-md: 0 4px 12px -2px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
  }
}

/* Light Mode */
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --hover-bg: #f1f5f9;
  --input-bg: #ffffff;
  --secondary-bg: #f8fafc;
  
  --accent-color: #667eea;
  --accent-color-dark: #5a67d8;
  --accent-color-light: #a5b4fc;
  --accent-color-alpha: rgba(102, 126, 234, 0.1);
  
  --secondary-color: #764ba2;
  --secondary-color-dark: #6b46c1;
  
  --primary-color: #3b82f6;
  --primary-color-dark: #2563eb;
  
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #06b6d4;
  --dark-color: #374151;
  
  --success-color-light: rgba(16, 185, 129, 0.1);
  --warning-color-light: rgba(245, 158, 11, 0.1);
  --danger-color-light: rgba(239, 68, 68, 0.1);
  --info-color-light: rgba(6, 182, 212, 0.1);
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar */
.list-body::-webkit-scrollbar {
  width: 8px;
}

.list-body::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.list-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.list-body::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}
</style>
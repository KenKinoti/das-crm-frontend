<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <h1>
        <i class="fas fa-database"></i>
        Database Management
      </h1>
    </div>

    <!-- Stats Overview -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-building"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalOrganizations || 0 }}</div>
          <div class="stat-label">Organizations</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-user-friends"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalParticipants || 0 }}</div>
          <div class="stat-label">Participants</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalShifts || 0 }}</div>
          <div class="stat-label">Total Shifts</div>
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
            placeholder="Search database operations..." 
            class="form-input"
            @input="filterActions"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="viewMode" @change="updateView" class="form-select">
            <option value="operations">Database Operations</option>
            <option value="tables">Table Management</option>
            <option value="maintenance">System Maintenance</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant">
            <i class="fas fa-times"></i>
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Database Operations</h2>
      <div class="actions-grid">
        <div 
          @click="showSeedModal = true; fetchAvailableOrgs()" 
          :class="['action-card', 'seed-action', { 'disabled': isLoading.seed }]"
        >
          <div class="action-icon success">
            <i class="fas fa-seedling"></i>
          </div>
          <div class="action-content">
            <h3>Seed Database</h3>
            <p>Add test data for development</p>
            <span v-if="isLoading.seed" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i> Seeding...
            </span>
          </div>
        </div>

        <div 
          @click="performBackup" 
          :class="['action-card', 'backup-action', { 'disabled': isLoading.backup }]"
        >
          <div class="action-icon primary">
            <i class="fas fa-download"></i>
          </div>
          <div class="action-content">
            <h3>Backup Database</h3>
            <p>Create a full database backup</p>
            <span v-if="isLoading.backup" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i> Backing up...
            </span>
          </div>
        </div>

        <div 
          @click="showMaintenanceModal = true" 
          :class="['action-card', 'maintenance-action', { 'disabled': isLoading.maintenance }]"
        >
          <div class="action-icon warning">
            <i class="fas fa-tools"></i>
          </div>
          <div class="action-content">
            <h3>System Maintenance</h3>
            <p>Run database optimization tasks</p>
            <span v-if="isLoading.maintenance" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i> Optimizing...
            </span>
          </div>
        </div>

        <div 
          @click="showClearTestDataModal = true" 
          :class="['action-card', 'clear-action', { 'disabled': isLoading.clear }]"
        >
          <div class="action-icon danger">
            <i class="fas fa-trash-alt"></i>
          </div>
          <div class="action-content">
            <h3>Clear Test Data</h3>
            <p>Remove seeded test data</p>
            <span v-if="isLoading.clear" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i> Clearing...
            </span>
          </div>
        </div>

        <div 
          @click="showCleanupModal = true" 
          :class="['action-card', 'cleanup-action', { 'disabled': isLoading.cleanup }]"
        >
          <div class="action-icon info">
            <i class="fas fa-broom"></i>
          </div>
          <div class="action-content">
            <h3>Data Cleanup</h3>
            <p>Clean up soft-deleted records</p>
            <span v-if="isLoading.cleanup" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i> Cleaning...
            </span>
          </div>
        </div>

        <div 
          @click="refreshStats" 
          :class="['action-card', 'stats-action', { 'disabled': isLoading.stats }]"
        >
          <div class="action-icon secondary">
            <i class="fas fa-sync-alt"></i>
          </div>
          <div class="action-content">
            <h3>Refresh Statistics</h3>
            <p>Update system statistics</p>
            <span v-if="isLoading.stats" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i> Refreshing...
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- System Tables Overview -->
    <div class="tables-overview">
      <h2>System Tables</h2>
      <div class="table-cards">
        <div 
          v-for="table in systemTables" 
          :key="table.name" 
          @click="handleTableClick(table.name)"
          class="table-card table-card-clickable"
        >
          <div class="table-info">
            <div class="table-icon">
              <i :class="getTableIcon(table.name)"></i>
            </div>
            <div class="table-details">
              <div class="table-name">{{ formatTableName(table.name) }}</div>
              <div class="table-count">
                <span class="count-number">{{ table.count || 0 }}</span>
                <span class="count-label">records</span>
              </div>
            </div>
          </div>
          <div class="table-actions">
            <div class="table-action-buttons" @click.stop>
              <button @click="editTable(table.name)" class="btn btn-primary-elegant btn-xs">
                <i class="fas fa-edit"></i>
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Maintenance Modal -->
    <div v-if="showMaintenanceModal" class="modal-overlay" @click="showMaintenanceModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header warning">
          <h3>
            <i class="fas fa-tools"></i>
            System Maintenance
          </h3>
          <button @click="showMaintenanceModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>This will run database optimization tasks including:</p>
          <ul>
            <li><i class="fas fa-check text-success"></i> Rebuild indexes</li>
            <li><i class="fas fa-check text-success"></i> Update statistics</li>
            <li><i class="fas fa-check text-success"></i> Analyze query performance</li>
            <li><i class="fas fa-check text-success"></i> Optimize database tables</li>
          </ul>
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            This may take several minutes and could impact system performance.
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showMaintenanceModal = false" class="btn btn-cancel">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="runMaintenance" class="btn btn-warning" :disabled="isLoading.maintenance">
            <i class="fas fa-tools"></i>
            Run Maintenance
          </button>
        </div>
      </div>
    </div>

    <!-- Clear Test Data Modal -->
    <div v-if="showClearTestDataModal" class="modal-overlay" @click="showClearTestDataModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header danger">
          <h3>
            <i class="fas fa-trash-alt"></i>
            Clear Test Data
          </h3>
          <button @click="showClearTestDataModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>This will remove all test data created by the seeder including:</p>
          <ul>
            <li><i class="fas fa-times text-danger"></i> Test users (@test.com emails)</li>
            <li><i class="fas fa-times text-danger"></i> Test participants</li>
            <li><i class="fas fa-times text-danger"></i> Test organizations</li>
            <li><i class="fas fa-times text-danger"></i> Test shifts and care plans</li>
          </ul>
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i>
            This action will permanently delete test data. Production data will remain untouched.
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showClearTestDataModal = false" class="btn btn-cancel">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="clearTestData" class="btn btn-danger" :disabled="isLoading.clear">
            <i class="fas fa-trash-alt"></i>
            Clear Test Data
          </button>
        </div>
      </div>
    </div>

    <!-- Cleanup Modal -->
    <div v-if="showCleanupModal" class="modal-overlay" @click="showCleanupModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header info">
          <h3>
            <i class="fas fa-broom"></i>
            Data Cleanup
          </h3>
          <button @click="showCleanupModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>This will permanently delete soft-deleted records from the database:</p>
          <ul>
            <li><i class="fas fa-trash text-danger"></i> Deleted participants</li>
            <li><i class="fas fa-trash text-danger"></i> Deleted users</li>
            <li><i class="fas fa-trash text-danger"></i> Deleted organizations</li>
            <li><i class="fas fa-trash text-danger"></i> Old audit logs</li>
          </ul>
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i>
            This action cannot be undone! This will permanently delete records.
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showCleanupModal = false" class="btn btn-cancel">
            Cancel
          </button>
          <button @click="runCleanup" class="btn btn-danger" :disabled="isLoading.cleanup">
            <i class="fas fa-broom"></i>
            Run Cleanup
          </button>
        </div>
      </div>
    </div>

    <!-- Seed Database Modal -->
    <div v-if="showSeedModal" class="modal-overlay" @click="showSeedModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header success">
          <h3>
            <i class="fas fa-seedling"></i>
            Seed Database Options
          </h3>
          <button @click="showSeedModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Configure seeding options for test data generation:</p>
          
          <!-- Default/Custom Toggle -->
          <div class="seed-section default-toggle-section">
            <div class="toggle-container">
              <label class="toggle-switch">
                <input type="checkbox" v-model="seedOptions.useDefaults" @change="toggleDefaults" />
                <span class="toggle-slider"></span>
              </label>
              <div class="toggle-labels">
                <h4><i class="fas fa-magic"></i> Use Default Settings</h4>
                <p>{{ seedOptions.useDefaults ? 'Using recommended defaults' : 'Custom configuration' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Custom Configuration Options -->
          <div v-if="!seedOptions.useDefaults" class="custom-config">
            <!-- Organization Selection -->
            <div class="seed-section">
            <h4><i class="fas fa-building"></i> Organization Strategy</h4>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="seedOptions.orgStrategy" value="create_new" />
                <span>Create new test organization</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="seedOptions.orgStrategy" value="use_existing" />
                <span>Use existing organization</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="seedOptions.orgStrategy" value="random" />
                <span>Random distribution across organizations</span>
              </label>
            </div>
            
            <!-- Organization Selector (when use_existing is selected) -->
            <div v-if="seedOptions.orgStrategy === 'use_existing'" class="org-selector">
              <select v-model="seedOptions.targetOrgId" class="form-select">
                <option value="">Select Organization...</option>
                <option v-for="org in availableOrgs" :key="org.id" :value="org.id">
                  {{ org.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Table Selection -->
          <div class="seed-section">
            <h4><i class="fas fa-table"></i> Tables to Seed</h4>
            <div class="checkbox-grid">
              <label v-for="table in seedTables" :key="table.name" class="checkbox-option">
                <input type="checkbox" v-model="table.selected" />
                <span>{{ table.label }}</span>
                <small>{{ table.description }}</small>
              </label>
            </div>
          </div>
          
          <!-- Organization Seeder Section -->
          <div class="seed-section">
            <h4><i class="fas fa-building-flag"></i> Organization Generation</h4>
            <div class="org-seeder-controls">
              <label class="checkbox-option org-seeder-checkbox">
                <input type="checkbox" v-model="seedOptions.createOrganizations" />
                <span>Generate dummy organizations</span>
                <small>Create test organizations with realistic data</small>
              </label>
              
              <div v-if="seedOptions.createOrganizations" class="org-config">
                <div class="org-count-input">
                  <label class="form-label">
                    <span>Number of organizations to create:</span>
                    <input 
                      type="number" 
                      v-model="seedOptions.orgCount" 
                      class="form-input org-count-field" 
                      min="1" 
                      max="50"
                      placeholder="5"
                    />
                  </label>
                  <div class="quick-org-numbers">
                    <button type="button" @click="seedOptions.orgCount = 2" class="btn-mini btn-outline">2</button>
                    <button type="button" @click="seedOptions.orgCount = 5" class="btn-mini btn-outline">5</button>
                    <button type="button" @click="seedOptions.orgCount = 10" class="btn-mini btn-outline">10</button>
                    <button type="button" @click="seedOptions.orgCount = 20" class="btn-mini btn-outline">20</button>
                  </div>
                </div>
                
                <div class="org-prefix-input">
                  <label class="form-label">
                    <span>Organization name prefix:</span>
                    <input 
                      type="text" 
                      v-model="seedOptions.orgPrefix" 
                      class="form-input" 
                      placeholder="Test Care"
                    />
                    <small>Organizations will be named like "Test Care Services", "Test Care Solutions", etc.</small>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Prefix Option -->
          <div class="seed-section">
            <h4><i class="fas fa-tag"></i> Data Prefix</h4>
            <div class="prefix-options">
              <label class="form-label">
                <input 
                  type="text" 
                  v-model="seedOptions.prefix" 
                  class="form-input" 
                  placeholder="test_"
                />
                <span>Prefix for generated data (e.g., "test_", "demo_")</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="seedOptions.autoIncrement" />
                <span>Auto-increment suffix (test_001, test_002, etc.)</span>
              </label>
            </div>
            
            <!-- Record Count -->
            <div class="seed-section">
              <h4><i class="fas fa-calculator"></i> Number of Records</h4>
              <div class="record-count-options">
                <label class="form-label">
                  <input 
                    type="number" 
                    v-model="seedOptions.recordCount" 
                    class="form-input" 
                    min="1" 
                    max="1000"
                    placeholder="10"
                  />
                  <span>Records to generate per table</span>
                </label>
                <div class="quick-numbers">
                  <button type="button" @click="seedOptions.recordCount = 5" class="btn-mini btn-outline">5</button>
                  <button type="button" @click="seedOptions.recordCount = 10" class="btn-mini btn-outline">10</button>
                  <button type="button" @click="seedOptions.recordCount = 25" class="btn-mini btn-outline">25</button>
                  <button type="button" @click="seedOptions.recordCount = 50" class="btn-mini btn-outline">50</button>
                  <button type="button" @click="seedOptions.recordCount = 100" class="btn-mini btn-outline">100</button>
                </div>
              </div>
            </div>
          </div>
        </div>
          
          <!-- Default Settings Summary (when using defaults) -->
          <div v-if="seedOptions.useDefaults" class="default-summary">
            <div class="summary-card">
              <h4><i class="fas fa-info-circle"></i> Default Configuration</h4>
              <ul>
                <li><strong>Strategy:</strong> Create new test organization</li>
                <li><strong>Tables:</strong> Participants, Shifts</li>
                <li><strong>Records:</strong> 10 per table</li>
                <li><strong>Prefix:</strong> TEST with auto-increment</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showSeedModal = false" class="btn btn-cancel">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="performAdvancedSeed" class="btn btn-success" :disabled="isLoading.seed">
            <i class="fas fa-seedling"></i>
            <span v-if="isLoading.seed">Seeding...</span>
            <span v-else>Seed Database</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Generic Alert Modal -->
    <div v-if="showAlertModal" class="modal-overlay" @click="showAlertModal = false">
      <div class="modal alert-modal" @click.stop>
        <div class="modal-header" :class="alertModal.type">
          <h3>
            <i :class="alertModal.icon"></i>
            {{ alertModal.title }}
          </h3>
          <button @click="showAlertModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ alertModal.message }}</p>
        </div>
        <div class="modal-footer">
          <button @click="showAlertModal = false" class="btn btn-primary">
            <i class="fas fa-check"></i>
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'

export default {
  name: 'DatabaseManagement',
  setup() {
    const stats = reactive({
      totalUsers: 0,
      totalOrganizations: 0,
      totalParticipants: 0,
      totalShifts: 0
    })

    const isLoading = reactive({
      seed: false,
      backup: false,
      maintenance: false,
      cleanup: false,
      clear: false,
      stats: false
    })

    const systemTables = ref([
      { name: 'users', count: 0 },
      { name: 'organizations', count: 0 },
      { name: 'participants', count: 0 },
      { name: 'shifts', count: 0 },
      { name: 'care_plans', count: 0 },
      { name: 'documents', count: 0 }
    ])

    const showMaintenanceModal = ref(false)
    const showClearTestDataModal = ref(false)
    const showCleanupModal = ref(false)
    const showSeedModal = ref(false)
    const showAlertModal = ref(false)
    const alertModal = ref({
      type: 'success',
      title: '',
      message: '',
      icon: 'fas fa-check-circle'
    })
    const seedOptions = ref({
      useDefaults: true,
      orgStrategy: 'create_new',
      targetOrgId: null,
      selectedTables: [],
      prefix: 'TEST',
      autoIncrement: true,
      recordCount: 10,
      createOrganizations: false,
      orgCount: 5,
      orgPrefix: 'Test Care'
    })
    const availableOrgs = ref([])
    const seedTables = ref([
      { name: 'participants', label: 'Participants', selected: true },
      { name: 'shifts', label: 'Shifts', selected: true },
      { name: 'care_plans', label: 'Care Plans', selected: false },
      { name: 'documents', label: 'Documents', selected: false },
      { name: 'staff', label: 'Staff', selected: false }
    ])
    const searchQuery = ref('')
    const viewMode = ref('operations')

    const fetchStats = async () => {
      try {
        isLoading.stats = true
        console.log('Fetching admin stats...')
        const response = await fetch('/api/v1/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        console.log('Admin stats response:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Admin stats data:', data)
          stats.totalUsers = data.totalUsers || 0
          stats.totalOrganizations = data.totalOrganizations || 0
          stats.totalParticipants = data.totalParticipants || 0
          stats.totalShifts = data.totalShifts || 0
        } else {
          console.log('Admin stats failed, status:', response.status)
          if (response.status === 403) {
            console.log('Access denied to admin stats, falling back to dashboard')
          }
          throw new Error('Failed to fetch admin stats')
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        // Fallback to dashboard stats
        try {
          console.log('Trying fallback dashboard stats...')
          const response = await fetch('/api/v1/reports/dashboard', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            console.log('Dashboard stats data:', data)
            stats.totalUsers = data.total_staff || 0
            stats.totalOrganizations = data.total_organizations || 1
            stats.totalParticipants = data.total_participants || 0
            stats.totalShifts = data.total_shifts || 0
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback stats:', fallbackError)
        }
      } finally {
        isLoading.stats = false
      }
    }

    const fetchTableStats = async () => {
      try {
        console.log('Fetching table stats...')
        const response = await fetch('/api/v1/admin/tables', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        console.log('Table stats response:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Table stats data:', data)
          systemTables.value = data.map(table => ({
            name: table.name,
            count: table.count
          }))
        } else {
          console.log('Table stats failed, status:', response.status)
          throw new Error('Failed to fetch table stats')
        }
      } catch (error) {
        console.error('Error fetching table stats:', error)
        // Fallback to dashboard data
        try {
          console.log('Trying fallback dashboard for table stats...')
          const response = await fetch('/api/v1/reports/dashboard', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            console.log('Dashboard data for tables:', data)
            systemTables.value = [
              { name: 'users', count: data.total_staff || 0 },
              { name: 'organizations', count: data.total_organizations || 1 },
              { name: 'participants', count: data.total_participants || 0 },
              { name: 'shifts', count: data.total_shifts || 0 },
              { name: 'care_plans', count: data.total_participants || 0 },
              { name: 'documents', count: (data.total_participants || 0) * 2 }
            ]
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback table stats:', fallbackError)
        }
      }
    }

    const refreshStats = () => {
      fetchStats()
      fetchTableStats()
    }

    const performBackup = async () => {
      try {
        isLoading.backup = true
        const response = await fetch('/api/v1/admin/backup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          showAlert('Database backup completed successfully!')
        } else {
          showAlert('Error creating backup: ' + (data.error || 'Unknown error'), 'error')
        }
      } catch (error) {
        console.error('Backup error:', error)
        showAlert('Error creating backup', 'error')
      } finally {
        isLoading.backup = false
      }
    }

    const runMaintenance = async () => {
      try {
        isLoading.maintenance = true
        showMaintenanceModal.value = false
        const response = await fetch('/api/v1/admin/maintenance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          showAlert('System maintenance completed successfully!')
        } else {
          showAlert('Error running maintenance: ' + (data.error || 'Unknown error'), 'error')
        }
      } catch (error) {
        console.error('Maintenance error:', error)
        showAlert('Error running maintenance', 'error')
      } finally {
        isLoading.maintenance = false
      }
    }

    const runCleanup = async () => {
      try {
        isLoading.cleanup = true
        showCleanupModal.value = false
        const response = await fetch('/api/v1/admin/cleanup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          showAlert(`Data cleanup completed successfully! ${data.recordsCleaned || 0} records cleaned.`)
        } else {
          showAlert('Error running cleanup: ' + (data.error || 'Unknown error'), 'error')
        }
      } catch (error) {
        console.error('Cleanup error:', error)
        showAlert('Error running cleanup', 'error')
      } finally {
        isLoading.cleanup = false
      }
    }

    const performSeed = async () => {
      try {
        isLoading.seed = true
        const response = await fetch('/api/v1/admin/seed', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          showAlert('Database seeded successfully!')
          refreshStats()
        } else {
          showAlert('Error seeding database: ' + (data.error || 'Unknown error'), 'error')
        }
      } catch (error) {
        console.error('Seed error:', error)
        showAlert('Error seeding database', 'error')
      } finally {
        isLoading.seed = false
      }
    }

    const toggleDefaults = () => {
      if (seedOptions.value.useDefaults) {
        // Set default values
        seedOptions.value.orgStrategy = 'create_new'
        seedOptions.value.targetOrgId = null
        seedOptions.value.prefix = 'TEST'
        seedOptions.value.autoIncrement = true
        seedOptions.value.recordCount = 10
        seedOptions.value.createOrganizations = false
        seedOptions.value.orgCount = 5
        seedOptions.value.orgPrefix = 'Test Care'
        
        // Set default table selections
        seedTables.value.forEach(table => {
          table.selected = ['participants', 'shifts'].includes(table.name)
        })
      }
    }

    const showAlert = (message, type = 'success', title = null) => {
      const types = {
        success: { icon: 'fas fa-check-circle', title: title || 'Success' },
        error: { icon: 'fas fa-exclamation-circle', title: title || 'Error' },
        warning: { icon: 'fas fa-exclamation-triangle', title: title || 'Warning' },
        info: { icon: 'fas fa-info-circle', title: title || 'Information' }
      }
      
      alertModal.value = {
        type: type,
        title: types[type].title,
        message: message,
        icon: types[type].icon
      }
      showAlertModal.value = true
    }

    const fetchAvailableOrgs = async () => {
      try {
        const response = await fetch('/api/v1/organizations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          availableOrgs.value = data
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
      }
    }

    const performAdvancedSeed = async () => {
      try {
        isLoading.seed = true
        
        const selectedTables = seedTables.value
          .filter(table => table.selected)
          .map(table => table.name)
        
        if (selectedTables.length === 0) {
          showAlert('Please select at least one table to seed', 'warning')
          return
        }

        const seedData = {
          orgStrategy: seedOptions.value.orgStrategy,
          targetOrgId: seedOptions.value.targetOrgId,
          tables: selectedTables,
          prefix: seedOptions.value.prefix,
          autoIncrement: seedOptions.value.autoIncrement,
          recordCount: seedOptions.value.recordCount,
          createOrganizations: seedOptions.value.createOrganizations,
          orgCount: seedOptions.value.orgCount,
          orgPrefix: seedOptions.value.orgPrefix
        }

        const response = await fetch('/api/v1/admin/seed-advanced', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(seedData)
        })

        const data = await response.json()
        if (response.ok) {
          showSeedModal.value = false
          showAlert(`Database seeded successfully!\nSeeded ${data.recordsCreated || 0} records across ${selectedTables.length} tables.`)
          refreshStats()
        } else {
          showAlert('Error seeding database: ' + (data.error || 'Unknown error'), 'error')
        }
      } catch (error) {
        console.error('Advanced seed error:', error)
        showAlert('Error seeding database', 'error')
      } finally {
        isLoading.seed = false
      }
    }

    const clearTestData = async () => {
      try {
        isLoading.clear = true
        showClearTestDataModal.value = false
        const response = await fetch('/api/v1/admin/clear-test-data', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          showAlert(`Test data cleared successfully! ${data.recordsDeleted || 0} records removed.`)
          refreshStats()
        } else {
          showAlert('Error clearing test data: ' + (data.error || 'Unknown error'), 'error')
        }
      } catch (error) {
        console.error('Clear test data error:', error)
        showAlert('Error clearing test data', 'error')
      } finally {
        isLoading.clear = false
      }
    }

    const filterActions = () => {
      // Implement search filtering logic
      console.log('Filtering with query:', searchQuery.value)
    }

    const updateView = () => {
      console.log('Updating view mode:', viewMode.value)
    }

    const clearFilters = () => {
      searchQuery.value = ''
      viewMode.value = 'operations'
      // Trigger any filtering logic
      filterActions()
    }

    const getTableIcon = (tableName) => {
      const icons = {
        users: 'fas fa-users',
        organizations: 'fas fa-building',
        participants: 'fas fa-user-friends',
        shifts: 'fas fa-calendar-alt',
        care_plans: 'fas fa-heartbeat',
        documents: 'fas fa-file-alt'
      }
      return icons[tableName] || 'fas fa-table'
    }

    const formatTableName = (tableName) => {
      return tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const handleTableClick = (tableName) => {
      // Direct click opens table view
      viewTableData(tableName)
    }

    const viewTableData = async (tableName) => {
      try {
        const response = await fetch(`/api/v1/admin/tables/${tableName}?page=1&limit=10`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log(`${tableName} data:`, data)
          showAlert(`${tableName} table has ${data.total} records. Check console for sample data.`, 'info')
        } else {
          showAlert(`Error fetching ${tableName} data`, 'error')
        }
      } catch (error) {
        console.error(`Error fetching ${tableName} data:`, error)
        showAlert(`Error fetching ${tableName} data`, 'error')
      }
    }

    const editTable = (tableName) => {
      showAlert(`Table management for ${tableName} - this would open detailed table editor`, 'info')
    }

    onMounted(() => {
      fetchStats()
      fetchTableStats()
    })

    return {
      stats,
      isLoading,
      systemTables,
      showMaintenanceModal,
      showClearTestDataModal,
      showCleanupModal,
      showSeedModal,
      showAlertModal,
      alertModal,
      seedOptions,
      availableOrgs,
      seedTables,
      searchQuery,
      viewMode,
      refreshStats,
      showAlert,
      toggleDefaults,
      performSeed,
      fetchAvailableOrgs,
      performAdvancedSeed,
      performBackup,
      runMaintenance,
      runCleanup,
      clearTestData,
      filterActions,
      updateView,
      clearFilters,
      getTableIcon,
      formatTableName,
      handleTableClick,
      viewTableData,
      editTable
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 1rem;
  max-width: 100%;
  min-height: calc(100vh - 120px);
}

/* Stats Overview */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Stat card colors matching icon colors */
.stat-card:nth-child(1) {
  border-left: 4px solid #3b82f6;
}

.stat-card:nth-child(2) {
  border-left: 4px solid #10b981;
}

.stat-card:nth-child(3) {
  border-left: 4px solid #f59e0b;
}

.stat-card:nth-child(4) {
  border-left: 4px solid #3b82f6;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.02);
  border: 1px solid rgba(255,255,255,0.2);
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




/* Search and Filters Section */
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
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(107, 114, 128, 0.5);
  z-index: 1;
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
  min-width: 160px;
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
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}


/* Quick Actions */
.quick-actions {
  margin-bottom: 1.5rem;
}

.quick-actions h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: left;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--medium-gray);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: var(--transition);
  cursor: pointer;
  text-align: left;
}

.action-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.action-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.seed-action .action-icon {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.backup-action .action-icon {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.clear-action .action-icon {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
}

.maintenance-action .action-icon {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.cleanup-action .action-icon {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.stats-action .action-icon {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.action-content h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.action-content p {
  font-size: 0.95rem;
  color: rgba(107, 114, 128, 0.8);
  margin: 0;
}

.loading-text {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.loading-text i {
  font-size: 0.875rem;
}

/* Tables Overview */
.tables-overview h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
}

.table-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.table-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--medium-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.table-card-clickable {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}


.table-card-clickable:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.table-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.table-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.25);
}

.table-details {
  flex: 1;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.table-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.table-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.table-count {
  font-size: 0.9rem;
  color: rgba(107, 114, 128, 0.8);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.count-number {
  font-weight: 700;
  color: #667eea;
  font-size: 1rem;
}

.count-label {
  font-size: 0.875rem;
  color: rgba(107, 114, 128, 0.6);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-warning {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.btn-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(72, 187, 120, 0.4);
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

.btn-primary-elegant {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.25);
  font-size: 0.75rem;
}

.btn-primary-elegant:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.35);
}

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #475569;
  transform: translateY(-1px);
}

.btn-warning {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border: 2px solid transparent;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(67, 233, 123, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border: 2px solid transparent;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(250, 112, 154, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modals */
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

.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 32px 64px rgba(0,0,0,0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
}

.modal-header.warning {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  color: #9a3412;
}

.modal-header.danger {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  color: #991b1b;
}

.modal-header.info {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  color: #1e40af;
}

.modal-header.success {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  color: #166534;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: rgba(107, 114, 128, 0.6);
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.modal-body .warning {
  color: #ed8936;
  font-weight: 600;
  margin-top: 1rem;
}

.modal-body .danger {
  color: #e53e3e;
  font-weight: 600;
  margin-top: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 12px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.alert.alert-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #f59e0b;
}

.alert.alert-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #ef4444;
}

.text-success {
  color: #059669;
}

.text-danger {
  color: #dc2626;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: #f8fafc;
  border-radius: 0 0 16px 16px;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .table-cards {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    padding: 1.5rem;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-select {
    min-width: auto;
    width: 100%;
  }
}

/* Seed Modal Styling - Enhanced */
.seed-section {
  background: linear-gradient(135deg, #fafbfc 0%, #f4f6f8 100%);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.seed-section:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.seed-section h4 {
  color: #374151;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.seed-section h4 i {
  color: #667eea;
  font-size: 1rem;
}

/* Toggle Styles */
.default-toggle-section {
  border: 2px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 32px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.3);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(32px);
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.toggle-labels h4 {
  margin: 0;
  color: #374151;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-labels p {
  margin: 0.5rem 0 0 0;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Radio Button Styles */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #374151;
}

.radio-option:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(102, 126, 234, 0.02) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.radio-option input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  background: white;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.radio-option input[type="radio"]:checked {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.3);
}

.radio-option input[type="radio"]:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-option:has(input[type="radio"]:checked) {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

/* Checkbox Styles */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.checkbox-option {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.checkbox-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.6s;
}

.checkbox-option:hover::before {
  left: 100%;
}

.checkbox-option:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(102, 126, 234, 0.02) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.checkbox-option input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-option input[type="checkbox"]:checked {
  border-color: #10b981;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.checkbox-option input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-option:has(input[type="checkbox"]:checked) {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
  transform: translateY(-2px);
}

.checkbox-option span {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.checkbox-option small {
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.3;
}

/* Organization Selector */
.org-selector {
  margin-top: 1rem;
}

.org-selector .form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.org-selector .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

/* Prefix Options */
.prefix-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.prefix-options .form-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prefix-options .form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.prefix-options .form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.prefix-options span {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Record Count Styles */
.record-count-options {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
}

.record-count-options .form-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.record-count-options .form-input {
  width: 200px;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
}

.record-count-options .form-input:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px) scale(1.02);
  background: white;
}

.record-count-options span {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.quick-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.btn-mini {
  padding: 0.5rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline {
  border: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  color: #6b7280;
}

.btn-outline:hover {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

/* Custom Config Transition */
.custom-config {
  opacity: 1;
  transition: all 0.4s ease;
}

/* Summary Card */
.default-summary {
  margin-top: 1.5rem;
}

.summary-card {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.summary-card h4 {
  margin: 0 0 1.25rem 0;
  color: #1e40af;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-card li {
  padding: 0.5rem 0;
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.summary-card li:last-child {
  border-bottom: none;
}

/* Organization Seeder Styles */
.org-seeder-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.org-seeder-checkbox {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 2px solid #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.org-seeder-checkbox:hover {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
}

.org-seeder-checkbox:has(input[type="checkbox"]:checked) {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
  transform: translateY(-3px);
}

.org-config {
  background: linear-gradient(135deg, #fefbf3 0%, #fef3c7 100%);
  border: 2px solid #fbbf24;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.15);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.org-count-input, .org-prefix-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.org-count-input:last-child, .org-prefix-input:last-child {
  margin-bottom: 0;
}

.org-count-field {
  width: 120px !important;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #92400e;
  border-color: #fbbf24;
}

.org-count-field:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #fefbf3 100%);
}

.quick-org-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.org-prefix-input .form-input {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #ffffff 0%, #fefbf3 100%);
}

.org-prefix-input .form-input:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
  background: white;
}

.org-prefix-input small {
  color: #92400e;
  font-style: italic;
  font-size: 0.8rem;
}
</style>
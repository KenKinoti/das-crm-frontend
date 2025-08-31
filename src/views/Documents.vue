<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Documents</h1>
      <div class="header-actions">
        <button @click="showCloudSettingsModal = true" class="btn btn-outline" title="Cloud Storage Settings">
          <i class="fas fa-cloud"></i>
          Cloud Storage
        </button>
        <button @click="showUploadModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Upload Document
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ activeDocuments.length }}</div>
          <div class="stat-label">Active Documents</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ expiringDocuments.length }}</div>
          <div class="stat-label">Expiring Soon</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-folder"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ Object.keys(documentsByCategory).length }}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">
          <i class="fas fa-file"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ documents.length }}</div>
          <div class="stat-label">Total Files</div>
        </div>
      </div>
    </div>

    <!-- Cloud Storage Status -->
    <div v-if="cloudStorageEnabled" class="cloud-storage-status">
      <div class="cloud-provider-info">
        <div class="provider-icon" :class="currentProvider">
          <i :class="getProviderIcon(currentProvider)"></i>
        </div>
        <div class="provider-details">
          <h4>{{ getProviderName(currentProvider) }} Connected</h4>
          <p class="storage-quota">{{ formatStorage(storageUsed) }} of {{ formatStorage(storageLimit) }} used</p>
          <div class="storage-bar">
            <div class="storage-fill" :style="{ width: storagePercentage + '%' }"></div>
          </div>
        </div>
        <div class="provider-actions">
          <button @click="syncCloudStorage" class="btn-small btn-outline" :disabled="isSyncing">
            <i :class="isSyncing ? 'fas fa-spinner fa-spin' : 'fas fa-sync'"></i>
            {{ isSyncing ? 'Syncing...' : 'Sync' }}
          </button>
          <button @click="showCloudSettingsModal = true" class="btn-small btn-outline">
            <i class="fas fa-cog"></i>
            Settings
          </button>
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
            placeholder="Search documents..." 
            class="form-input"
            @input="filterDocuments"
          />
        </div>
        
        <!-- Filter Controls -->
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterDocuments" class="form-select">
            <option value="">All Documents</option>
            <option value="active">Active Documents</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant">
            <i class="fas fa-times"></i>
            Clear Filters
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

    <!-- Documents List -->
    <div class="content-card">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading documents...</p>
      </div>

      <div v-else-if="filteredDocuments.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-file-alt"></i>
        <h3>No Documents Found</h3>
        <p>Start by uploading your first document</p>
        <button @click="showUploadModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Upload First Document
        </button>
      </div>

      <div v-else-if="filteredDocuments.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <div v-else class="documents-grid">
        <div v-for="document in filteredDocuments" :key="document.id" class="document-card">
          <div class="document-header">
            <div class="document-icon">
              <i :class="getFileIcon(document.file_type)"></i>
            </div>
            <div class="document-info">
              <h4 class="document-name">{{ document.name }}</h4>
              <p class="document-meta">{{ document.file_type }} • {{ formatFileSize(document.file_size) }}</p>
            </div>
            <div class="document-status">
              <span :class="['status-badge', getStatusClass(document)]">
                {{ getStatusLabel(document) }}
              </span>
            </div>
          </div>
          
          <div class="document-details">
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-user"></i>
                <span><strong>Participant:</strong> {{ getParticipantName(document.participant_id) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-folder"></i>
                <span><strong>Category:</strong> {{ document.category }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span><strong>Uploaded:</strong> {{ formatDate(document.created_at) }}</span>
              </div>
              <div v-if="document.expiry_date" class="detail-item">
                <i class="fas fa-calendar-times"></i>
                <span><strong>Expires:</strong> {{ formatDate(document.expiry_date) }}</span>
              </div>
            </div>
            <div v-if="document.description" class="detail-item description">
              <i class="fas fa-info-circle"></i>
              <span><strong>Description:</strong> {{ document.description }}</span>
            </div>
          </div>

          <div class="document-actions">
            <button @click="viewDocument(document)" class="btn-small btn-outline">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="downloadDocument(document)" class="btn-small btn-outline">
              <i class="fas fa-download"></i>
              Download
            </button>
            <button @click="editDocument(document)" class="btn-small btn-outline">
              <i class="fas fa-edit"></i>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Upload Document</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="uploadDocument">
            <div class="form-group">
              <label>Document File *</label>
              <input 
                ref="fileInput" 
                type="file" 
                class="form-input"
                @change="handleFileSelect" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                required 
              />
              <div v-if="selectedFile" class="file-preview">
                <i :class="getFileIcon(selectedFile.type)"></i>
                <span>{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</span>
              </div>
            </div>

            <!-- Cloud Storage Destination -->
            <div v-if="cloudStorageEnabled" class="form-group">
              <label>Storage Destination</label>
              <div class="storage-options">
                <div class="storage-option" :class="{ active: newDocument.storageDestination === 'local' }">
                  <input 
                    id="storage-local" 
                    v-model="newDocument.storageDestination" 
                    type="radio" 
                    value="local" 
                  />
                  <label for="storage-local" class="storage-label">
                    <i class="fas fa-server"></i>
                    <span>Local Storage</span>
                    <small>Store on your server</small>
                  </label>
                </div>
                
                <div class="storage-option" :class="{ active: newDocument.storageDestination === 'google' }">
                  <input 
                    id="storage-google" 
                    v-model="newDocument.storageDestination" 
                    type="radio" 
                    value="google"
                    :disabled="!isGoogleConnected"
                  />
                  <label for="storage-google" class="storage-label">
                    <i class="fab fa-google-drive"></i>
                    <span>Google Drive</span>
                    <small>{{ isGoogleConnected ? 'Connected' : 'Not connected' }}</small>
                  </label>
                </div>
                
                <div class="storage-option" :class="{ active: newDocument.storageDestination === 'onedrive' }">
                  <input 
                    id="storage-onedrive" 
                    v-model="newDocument.storageDestination" 
                    type="radio" 
                    value="onedrive"
                    :disabled="!isOneDriveConnected"
                  />
                  <label for="storage-onedrive" class="storage-label">
                    <i class="fab fa-microsoft"></i>
                    <span>OneDrive</span>
                    <small>{{ isOneDriveConnected ? 'Connected' : 'Not connected' }}</small>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Document Name *</label>
                <input v-model="newDocument.name" type="text" class="form-input" required placeholder="Enter document name" />
              </div>
              <div class="form-group">
                <label>Category *</label>
                <select v-model="newDocument.category" class="form-select" required>
                  <option value="">Select Category</option>
                  <option value="Medical">Medical</option>
                  <option value="Legal">Legal</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Care Plan">Care Plan</option>
                  <option value="Personal">Personal</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Participant *</label>
                <select v-model="newDocument.participant_id" class="form-select" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Expiry Date</label>
                <input v-model="newDocument.expiry_date" type="date" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="newDocument.description" 
                rows="3" 
                class="form-textarea"
                placeholder="Brief description of the document..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>
                <input v-model="newDocument.is_confidential" type="checkbox" />
                Mark as confidential
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isUploading">
                <span v-if="isUploading">
                  <i class="fas fa-spinner fa-spin"></i>
                  Uploading...
                </span>
                <span v-else>
                  <i class="fas fa-upload"></i>
                  Upload Document
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Cloud Settings Modal -->
    <div v-if="showCloudSettingsModal" class="modal-overlay" @click="closeCloudModal">
      <div class="modal-content cloud-modal" @click.stop>
        <div class="modal-header">
          <h3>Cloud Storage Settings</h3>
          <button @click="closeCloudModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="cloud-providers">
            <!-- Google Drive Section -->
            <div class="provider-section">
              <div class="provider-header">
                <div class="provider-icon google">
                  <i class="fab fa-google-drive"></i>
                </div>
                <div class="provider-info">
                  <h4>Google Drive</h4>
                  <p>Store documents in your Google Drive account</p>
                </div>
                <div class="provider-status">
                  <span :class="['status-indicator', isGoogleConnected ? 'connected' : 'disconnected']">
                    {{ isGoogleConnected ? 'Connected' : 'Disconnected' }}
                  </span>
                </div>
              </div>
              <div class="provider-actions">
                <button 
                  v-if="!isGoogleConnected" 
                  @click="connectGoogleDrive" 
                  class="btn btn-primary"
                  :disabled="isConnecting"
                >
                  <i :class="isConnecting ? 'fas fa-spinner fa-spin' : 'fab fa-google'"></i>
                  {{ isConnecting ? 'Connecting...' : 'Connect Google Drive' }}
                </button>
                <div v-else class="connected-info">
                  <p><strong>Account:</strong> {{ googleAccount || 'Connected' }}</p>
                  <p><strong>Storage:</strong> {{ formatStorage(googleStorageUsed) }} / {{ formatStorage(googleStorageLimit) }}</p>
                  <button @click="disconnectGoogleDrive" class="btn btn-outline">
                    <i class="fas fa-unlink"></i>
                    Disconnect
                  </button>
                </div>
              </div>
            </div>

            <!-- OneDrive Section -->
            <div class="provider-section">
              <div class="provider-header">
                <div class="provider-icon onedrive">
                  <i class="fab fa-microsoft"></i>
                </div>
                <div class="provider-info">
                  <h4>Microsoft OneDrive</h4>
                  <p>Store documents in your OneDrive account</p>
                </div>
                <div class="provider-status">
                  <span :class="['status-indicator', isOneDriveConnected ? 'connected' : 'disconnected']">
                    {{ isOneDriveConnected ? 'Connected' : 'Disconnected' }}
                  </span>
                </div>
              </div>
              <div class="provider-actions">
                <button 
                  v-if="!isOneDriveConnected" 
                  @click="connectOneDrive" 
                  class="btn btn-primary"
                  :disabled="isConnecting"
                >
                  <i :class="isConnecting ? 'fas fa-spinner fa-spin' : 'fab fa-microsoft'"></i>
                  {{ isConnecting ? 'Connecting...' : 'Connect OneDrive' }}
                </button>
                <div v-else class="connected-info">
                  <p><strong>Account:</strong> {{ oneDriveAccount || 'Connected' }}</p>
                  <p><strong>Storage:</strong> {{ formatStorage(oneDriveStorageUsed) }} / {{ formatStorage(oneDriveStorageLimit) }}</p>
                  <button @click="disconnectOneDrive" class="btn btn-outline">
                    <i class="fas fa-unlink"></i>
                    Disconnect
                  </button>
                </div>
              </div>
            </div>

            <!-- Settings -->
            <div class="cloud-settings">
              <h4>Settings</h4>
              <div class="setting-item">
                <label>
                  <input v-model="cloudStorageEnabled" type="checkbox" @change="toggleCloudStorage" />
                  Enable cloud storage integration
                </label>
              </div>
              <div class="setting-item">
                <label>
                  <input v-model="autoSyncEnabled" type="checkbox" />
                  Automatically sync documents
                </label>
              </div>
              <div class="setting-item">
                <label>Default storage location:</label>
                <select v-model="defaultStorageLocation" class="form-select">
                  <option value="local">Local Storage</option>
                  <option value="google" :disabled="!isGoogleConnected">Google Drive</option>
                  <option value="onedrive" :disabled="!isOneDriveConnected">OneDrive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeCloudModal" class="btn btn-view">
            <i class="fas fa-check"></i>
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useDocumentsStore } from '../stores/documents'
import { useParticipantsStore } from '../stores/participants'
import { showViewModal, showEditModal } from '../utils/errorHandler'

export default {
  name: 'Documents',
  data() {
    return {
      filteredDocuments: [],
      searchQuery: '',
      statusFilter: '',
      currentView: 'list',
      showUploadModal: false,
      isUploading: false,
      selectedFile: null,
      newDocument: {
        name: '',
        category: '',
        participant_id: '',
        expiry_date: '',
        description: '',
        is_confidential: false,
        storageDestination: 'local'
      },
      // Cloud storage properties
      showCloudSettingsModal: false,
      cloudStorageEnabled: true,
      isConnecting: false,
      isSyncing: false,
      // Google Drive
      isGoogleConnected: false,
      googleAccount: null,
      googleStorageUsed: 0,
      googleStorageLimit: 15000000000, // 15GB
      // OneDrive  
      isOneDriveConnected: false,
      oneDriveAccount: null,
      oneDriveStorageUsed: 0,
      oneDriveStorageLimit: 5000000000, // 5GB
      // Settings
      autoSyncEnabled: true,
      defaultStorageLocation: 'local',
      currentProvider: 'local',
      storageUsed: 0,
      storageLimit: 0
    }
  },
  computed: {
    ...mapState(useDocumentsStore, ['documents', 'isLoading', 'error']),
    ...mapGetters(useDocumentsStore, ['documentsByCategory', 'activeDocuments', 'expiringDocuments']),
    ...mapState(useParticipantsStore, { participants: 'participants' }),
    
    storagePercentage() {
      if (this.storageLimit === 0) return 0
      return Math.min((this.storageUsed / this.storageLimit) * 100, 100)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    ...mapActions(useDocumentsStore, ['fetchDocuments', 'uploadDocument', 'updateDocument', 'deleteDocument', 'downloadDocument']),
    ...mapActions(useParticipantsStore, ['fetchParticipants']),
    
    async loadData() {
      try {
        await Promise.all([
          this.fetchDocuments(),
          this.fetchParticipants()
        ])
        this.filterDocuments()
      } catch (error) {
        console.error('Error loading data:', error)
        this.showErrorMessage('Failed to load data. Please refresh the page.')
      }
    },

    filterDocuments() {
      let filtered = [...this.documents]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(doc => 
          doc.name.toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
        )
      }

      if (this.statusFilter) {
        const now = new Date()
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        filtered = filtered.filter(doc => {
          switch (this.statusFilter) {
            case 'active':
              return doc.is_active && (!doc.expiry_date || new Date(doc.expiry_date) > now)
            case 'expired':
              return doc.expiry_date && new Date(doc.expiry_date) <= now
            case 'expiring':
              return doc.expiry_date && new Date(doc.expiry_date) <= thirtyDaysFromNow && new Date(doc.expiry_date) > now
            default:
              return true
          }
        })
      }
      
      // Sort by creation date (newest first)
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      this.filteredDocuments = filtered
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
        if (!this.newDocument.name) {
          this.newDocument.name = file.name.split('.').slice(0, -1).join('.')
        }
      }
    },

    async uploadDocument() {
      if (!this.selectedFile) return
      
      this.isUploading = true
      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        formData.append('name', this.newDocument.name)
        formData.append('category', this.newDocument.category)
        formData.append('participant_id', this.newDocument.participant_id)
        formData.append('description', this.newDocument.description || '')
        formData.append('is_confidential', this.newDocument.is_confidential)
        
        if (this.newDocument.expiry_date) {
          formData.append('expiry_date', this.newDocument.expiry_date + 'T23:59:59Z')
        }
        
        await this.uploadDocument(formData)
        this.filterDocuments()
        this.closeModal()
        this.showSuccessMessage('Document uploaded successfully!')
        
      } catch (error) {
        console.error('Error uploading document:', error)
        this.showErrorMessage('Error uploading document. Please try again.')
      } finally {
        this.isUploading = false
      }
    },

    async downloadDocument(document) {
      try {
        const response = await this.downloadDocument(document.id)
        const blob = response.data
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = document.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.showSuccessMessage('Document downloaded successfully!')
      } catch (error) {
        console.error('Error downloading document:', error)
        this.showErrorMessage('Error downloading document. Please try again.')
      }
    },

    viewDocument(document) {
      const participant = this.getParticipantName(document.participant_id)
      const status = this.getStatusLabel(document)
      const expiry = document.expiry_date ? `\n📅 Expires: ${this.formatDate(document.expiry_date)}` : ''
      
      const details = `📁 Category: ${document.category}\n👤 Participant: ${participant}\n📊 Status: ${status}\n📅 Uploaded: ${this.formatDate(document.created_at)}${expiry}${document.description ? '\n📝 Description: ' + document.description : ''}`
      showViewModal(details, `📄 ${document.name}`)
    },

    editDocument(document) {
      showEditModal(`Edit functionality for "${document.name}" will be available soon! This feature will allow you to modify document details and upload new versions.`, 'Edit Document')
    },

    async deleteDocument(document) {
      if (confirm(`Are you sure you want to delete "${document.name}"? This action cannot be undone.`)) {
        try {
          await this.deleteDocument(document.id)
          this.filterDocuments()
          this.showSuccessMessage('Document deleted successfully!')
        } catch (error) {
          console.error('Error deleting document:', error)
          this.showErrorMessage('Error deleting document. Please try again.')
        }
      }
    },

    closeModal() {
      this.showUploadModal = false
      this.selectedFile = null
      this.resetForm()
    },

    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
      this.filterDocuments()
    },

    resetForm() {
      this.newDocument = {
        name: '',
        category: '',
        participant_id: '',
        expiry_date: '',
        description: '',
        is_confidential: false
      }
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    getParticipantName(participantId) {
      const participant = this.participants.find(p => p.id === participantId)
      return participant ? `${participant.first_name} ${participant.last_name}` : 'Unknown Participant'
    },

    getFileIcon(fileType) {
      if (fileType.includes('pdf')) return 'fas fa-file-pdf text-red-500'
      if (fileType.includes('word') || fileType.includes('doc')) return 'fas fa-file-word text-blue-500'
      if (fileType.includes('image') || fileType.includes('jpeg') || fileType.includes('png')) return 'fas fa-file-image text-green-500'
      if (fileType.includes('text')) return 'fas fa-file-alt text-gray-500'
      return 'fas fa-file text-gray-400'
    },

    getStatusClass(document) {
      if (document.expiry_date) {
        const now = new Date()
        const expiryDate = new Date(document.expiry_date)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        
        if (expiryDate <= now) return 'expired'
        if (expiryDate <= thirtyDaysFromNow) return 'expiring'
      }
      return document.is_active ? 'active' : 'inactive'
    },

    getStatusLabel(document) {
      const statusClass = this.getStatusClass(document)
      const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'expired': 'Expired',
        'expiring': 'Expiring Soon'
      }
      return statusMap[statusClass] || 'Unknown'
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      }, 3000)
    },

    // Cloud Storage Methods
    closeCloudModal() {
      this.showCloudSettingsModal = false
    },

    async connectGoogleDrive() {
      this.isConnecting = true
      try {
        // Placeholder for OAuth implementation
        // In production, this would open OAuth popup and handle authentication
        setTimeout(() => {
          this.isGoogleConnected = true
          this.googleAccount = 'user@gmail.com'
          this.googleStorageUsed = 2500000000 // 2.5GB
          this.updateCurrentProvider()
          this.showSuccessMessage('Google Drive connected successfully!')
          this.isConnecting = false
        }, 2000)
      } catch (error) {
        this.showErrorMessage('Failed to connect Google Drive. Please try again.')
        this.isConnecting = false
      }
    },

    async connectOneDrive() {
      this.isConnecting = true
      try {
        // Placeholder for OAuth implementation
        // In production, this would open OAuth popup and handle authentication  
        setTimeout(() => {
          this.isOneDriveConnected = true
          this.oneDriveAccount = 'user@outlook.com'
          this.oneDriveStorageUsed = 1200000000 // 1.2GB
          this.updateCurrentProvider()
          this.showSuccessMessage('OneDrive connected successfully!')
          this.isConnecting = false
        }, 2000)
      } catch (error) {
        this.showErrorMessage('Failed to connect OneDrive. Please try again.')
        this.isConnecting = false
      }
    },

    disconnectGoogleDrive() {
      this.isGoogleConnected = false
      this.googleAccount = null
      this.googleStorageUsed = 0
      if (this.defaultStorageLocation === 'google') {
        this.defaultStorageLocation = 'local'
      }
      this.updateCurrentProvider()
      this.showSuccessMessage('Google Drive disconnected')
    },

    disconnectOneDrive() {
      this.isOneDriveConnected = false
      this.oneDriveAccount = null
      this.oneDriveStorageUsed = 0
      if (this.defaultStorageLocation === 'onedrive') {
        this.defaultStorageLocation = 'local'
      }
      this.updateCurrentProvider()
      this.showSuccessMessage('OneDrive disconnected')
    },

    async syncCloudStorage() {
      if (!this.cloudStorageEnabled) return
      
      this.isSyncing = true
      try {
        // Placeholder for sync implementation
        // In production, this would sync files between local and cloud storage
        setTimeout(() => {
          this.showSuccessMessage('Documents synced successfully!')
          this.isSyncing = false
        }, 3000)
      } catch (error) {
        this.showErrorMessage('Sync failed. Please try again.')
        this.isSyncing = false
      }
    },

    toggleCloudStorage() {
      if (!this.cloudStorageEnabled) {
        // Reset to local storage when disabled
        this.defaultStorageLocation = 'local'
        this.newDocument.storageDestination = 'local'
      }
    },

    updateCurrentProvider() {
      if (this.isGoogleConnected) {
        this.currentProvider = 'google'
        this.storageUsed = this.googleStorageUsed
        this.storageLimit = this.googleStorageLimit
      } else if (this.isOneDriveConnected) {
        this.currentProvider = 'onedrive'
        this.storageUsed = this.oneDriveStorageUsed
        this.storageLimit = this.oneDriveStorageLimit
      } else {
        this.currentProvider = 'local'
        this.storageUsed = 0
        this.storageLimit = 0
      }
    },

    getProviderIcon(provider) {
      const icons = {
        'google': 'fab fa-google-drive',
        'onedrive': 'fab fa-microsoft',
        'local': 'fas fa-server'
      }
      return icons[provider] || 'fas fa-cloud'
    },

    getProviderName(provider) {
      const names = {
        'google': 'Google Drive',
        'onedrive': 'OneDrive',
        'local': 'Local Storage'
      }
      return names[provider] || 'Unknown'
    },

    formatStorage(bytes) {
      return this.formatFileSize(bytes)
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

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

.view-toggle {
  display: flex;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.view-btn-elegant {
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-width: 44px;
}

.view-btn-elegant:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-1px);
}

.view-btn-elegant.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.25);
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

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Filters Section - Enhanced for Care Plans style */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

/* Cloud Storage Status Bar */
.cloud-storage-status {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary-500);
}

.cloud-provider-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.provider-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.provider-icon.google {
  background: linear-gradient(135deg, #4285f4, #34a853);
}

.provider-icon.onedrive {
  background: linear-gradient(135deg, #0078d4, #106ebe);
}

.provider-icon.local {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.provider-details {
  flex: 1;
}

.provider-details h4 {
  margin: 0 0 0.25rem 0;
  color: var(--gray-800);
  font-size: var(--font-size-lg);
}

.storage-quota {
  margin: 0 0 0.5rem 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.storage-bar {
  width: 200px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
  transition: width 0.3s ease;
}

.provider-actions {
  display: flex;
  gap: 0.75rem;
}

/* Storage Options in Upload Modal */
.storage-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.storage-option {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: var(--radius-lg);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.storage-option:hover {
  border-color: var(--primary-300);
}

.storage-option.active {
  border-color: var(--primary-500);
  background: var(--primary-50);
}

.storage-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.storage-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.storage-label i {
  font-size: 1.5rem;
  color: var(--primary-500);
}

.storage-label span {
  font-weight: 600;
  color: var(--gray-800);
  font-size: var(--font-size-sm);
}

.storage-label small {
  color: var(--gray-500);
  font-size: var(--font-size-xs);
}

/* Cloud Settings Modal */
.cloud-modal {
  max-width: 700px;
}

.cloud-providers {
  space-y: 1.5rem;
}

.provider-section {
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.provider-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.provider-info {
  flex: 1;
}

.provider-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--gray-800);
  font-size: var(--font-size-lg);
}

.provider-info p {
  margin: 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.provider-status .status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator.connected {
  background: var(--success-50);
  color: var(--success-700);
}

.status-indicator.disconnected {
  background: var(--gray-100);
  color: var(--gray-600);
}

.provider-actions {
  margin-top: 1rem;
}

.connected-info {
  padding: 1rem;
  background: var(--success-50);
  border-radius: var(--radius-md);
  margin-top: 1rem;
}

.connected-info p {
  margin: 0 0 0.5rem 0;
  color: var(--success-800);
  font-size: var(--font-size-sm);
}

.connected-info p:last-of-type {
  margin-bottom: 1rem;
}

.cloud-settings {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.cloud-settings h4 {
  margin: 0 0 1rem 0;
  color: var(--gray-800);
  font-size: var(--font-size-lg);
}

.setting-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--gray-700);
}

.setting-item select {
  margin-left: auto;
  min-width: 150px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

.stat-icon.info {
  background: var(--info-gradient);
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
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
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

/* Filter controls now use global styles for consistency */

.content-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  padding: 2rem;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
}

.document-card {
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.document-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-soft);
  transform: translateY(-2px);
}

.document-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.document-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
}

.document-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
}

.document-meta {
  font-size: 0.9rem;
  color: var(--text-medium);
  margin: 0;
}

.document-status {
  flex-shrink: 0;
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
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.expired {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.expiring {
  background: #fef3c7;
  color: #92400e;
}

.document-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-medium);
}

.detail-item i {
  width: 16px;
  color: var(--text-light);
  flex-shrink: 0;
}

.detail-item.description {
  grid-column: 1 / -1;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: var(--border-radius-sm);
  margin-top: 0.5rem;
}

.document-actions {
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

/* Modal styles */
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  transition: border-color 0.3s ease;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.file-preview {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-medium);
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Success and Error notifications */
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

  /* Filter controls responsive styles handled by global CSS */

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .document-actions {
    justify-content: center;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
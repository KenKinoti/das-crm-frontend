<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Documents</h1>
      <button @click="showUploadModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Upload Document
      </button>
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

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search documents..."
          @input="filterDocuments"
        />
      </div>
      <div class="filter-controls">
        <select v-model="categoryFilter" @change="filterDocuments">
          <option value="">All Categories</option>
          <option value="Medical">Medical</option>
          <option value="Legal">Legal</option>
          <option value="Insurance">Insurance</option>
          <option value="Care Plan">Care Plan</option>
          <option value="Personal">Personal</option>
          <option value="Emergency">Emergency</option>
          <option value="Other">Other</option>
        </select>
        <select v-model="participantFilter" @change="filterDocuments">
          <option value="">All Participants</option>
          <option v-for="participant in participants" :key="participant.id" :value="participant.id">
            {{ participant.first_name }} {{ participant.last_name }}
          </option>
        </select>
        <select v-model="statusFilter" @change="filterDocuments">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="expiring">Expiring Soon</option>
        </select>
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
            <button @click="deleteDocument(document)" class="btn-small btn-danger">
              <i class="fas fa-trash"></i>
              Delete
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
                @change="handleFileSelect" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                required 
              />
              <div v-if="selectedFile" class="file-preview">
                <i :class="getFileIcon(selectedFile.type)"></i>
                <span>{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Document Name *</label>
                <input v-model="newDocument.name" type="text" required placeholder="Enter document name" />
              </div>
              <div class="form-group">
                <label>Category *</label>
                <select v-model="newDocument.category" required>
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
                <select v-model="newDocument.participant_id" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Expiry Date</label>
                <input v-model="newDocument.expiry_date" type="date" />
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="newDocument.description" 
                rows="3" 
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
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useDocumentsStore } from '../stores/documents'
import { useParticipantsStore } from '../stores/participants'

export default {
  name: 'Documents',
  data() {
    return {
      filteredDocuments: [],
      searchQuery: '',
      categoryFilter: '',
      participantFilter: '',
      statusFilter: '',
      showUploadModal: false,
      isUploading: false,
      selectedFile: null,
      newDocument: {
        name: '',
        category: '',
        participant_id: '',
        expiry_date: '',
        description: '',
        is_confidential: false
      }
    }
  },
  computed: {
    ...mapState(useDocumentsStore, ['documents', 'isLoading', 'error']),
    ...mapGetters(useDocumentsStore, ['documentsByCategory', 'activeDocuments', 'expiringDocuments']),
    ...mapState(useParticipantsStore, { participants: 'participants' })
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
      
      if (this.categoryFilter) {
        filtered = filtered.filter(doc => doc.category === this.categoryFilter)
      }

      if (this.participantFilter) {
        filtered = filtered.filter(doc => doc.participant_id == this.participantFilter)
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
      
      alert(`📄 ${document.name}\n📁 Category: ${document.category}\n👤 Participant: ${participant}\n📊 Status: ${status}\n📅 Uploaded: ${this.formatDate(document.created_at)}${expiry}${document.description ? '\n📝 Description: ' + document.description : ''}`)
    },

    editDocument(document) {
      alert(`Edit functionality for "${document.name}" - Coming soon!`)
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
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
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

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-controls select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  background: white;
  cursor: pointer;
  min-width: 120px;
}

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

  .filter-controls {
    flex-direction: column;
  }

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
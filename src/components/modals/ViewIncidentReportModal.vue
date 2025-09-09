<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <div class="title-icon" :class="getStatusIconClass(report?.status)">
            <i class="fas fa-file-alt"></i>
          </div>
          <div>
            <h2 class="modal-title">{{ isEditMode ? 'Review Report' : 'Incident Report' }}</h2>
            <p class="modal-subtitle">
              <span :class="getStatusBadgeClass(report?.status)" class="status-badge">
                {{ formatStatus(report?.status) }}
              </span>
              {{ isEditMode ? 'Update status and add notes' : 'Complete incident details' }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <button 
            v-if="canEdit && !isEditMode" 
            type="button" 
            class="action-button edit-btn" 
            @click="toggleEditMode"
            title="Review & Update"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="close-button" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="modal-body" v-if="report">
        <!-- View Mode -->
        <div v-if="!isEditMode" class="view-mode">
          <!-- Report Overview Card -->
          <div class="overview-card">
            <div class="card-header">
              <h3><i class="fas fa-exclamation-triangle"></i> Incident Overview</h3>
              <span class="report-id">#{{ report.id }}</span>
            </div>
            <div class="overview-grid">
              <div class="overview-item">
                <div class="item-icon participant">
                  <i class="fas fa-user"></i>
                </div>
                <div class="item-content">
                  <label>Participant</label>
                  <span>{{ report.participant?.first_name }} {{ report.participant?.last_name }}</span>
                  <small>NDIS: {{ report.participant?.ndis_number || 'N/A' }}</small>
                </div>
              </div>
              
              <div class="overview-item">
                <div class="item-icon datetime">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="item-content">
                  <label>Date & Time</label>
                  <span>{{ formatDate(report.incident_date) }}</span>
                  <small>{{ report.incident_time }}</small>
                </div>
              </div>
              
              <div class="overview-item">
                <div class="item-icon location">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="item-content">
                  <label>Location</label>
                  <span>{{ report.location }}</span>
                </div>
              </div>
              
              <div class="overview-item">
                <div class="item-icon type">
                  <i class="fas fa-tag"></i>
                </div>
                <div class="item-content">
                  <label>Type</label>
                  <span class="type-badge">{{ formatIncidentType(report.incident_type) }}</span>
                </div>
              </div>
              
              <div class="overview-item">
                <div class="item-icon severity" :class="getSeverityIconClass(report.severity)">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="item-content">
                  <label>Severity</label>
                  <span :class="getSeverityBadgeClass(report.severity)" class="severity-badge">
                    {{ report.severity?.toUpperCase() }}
                  </span>
                </div>
              </div>
              
              <div class="overview-item">
                <div class="item-icon reporter">
                  <i class="fas fa-user-shield"></i>
                </div>
                <div class="item-content">
                  <label>Reported By</label>
                  <span>{{ report.reporter?.first_name }} {{ report.reporter?.last_name }}</span>
                  <small>{{ formatDate(report.created_at) }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Incident Details Sections -->
          <div class="details-sections">
            <!-- Description Section -->
            <div class="detail-section">
              <div class="section-header">
                <i class="fas fa-align-left"></i>
                <h4>Incident Description</h4>
              </div>
              <div class="section-content">
                <p class="description-text">{{ report.description || 'No description provided' }}</p>
              </div>
            </div>

            <!-- Immediate Actions Section -->
            <div v-if="report.immediate_action" class="detail-section">
              <div class="section-header">
                <i class="fas fa-first-aid"></i>
                <h4>Immediate Actions Taken</h4>
              </div>
              <div class="section-content">
                <p class="action-text">{{ report.immediate_action }}</p>
              </div>
            </div>

            <!-- Medical & Emergency Response -->
            <div class="detail-section">
              <div class="section-header">
                <i class="fas fa-heartbeat"></i>
                <h4>Medical & Emergency Response</h4>
              </div>
              <div class="section-content">
                <div class="response-grid">
                  <div class="response-item">
                    <div class="response-status" :class="{ active: report.medical_attention }">
                      <i class="fas" :class="report.medical_attention ? 'fa-check' : 'fa-times'"></i>
                    </div>
                    <div class="response-label">
                      <span>Medical Attention</span>
                      <small v-if="report.medical_details">{{ report.medical_details }}</small>
                    </div>
                  </div>
                  
                  <div class="response-item">
                    <div class="response-status" :class="{ active: report.emergency_services }">
                      <i class="fas" :class="report.emergency_services ? 'fa-check' : 'fa-times'"></i>
                    </div>
                    <div class="response-label">
                      <span>Emergency Services</span>
                      <small v-if="report.emergency_details">{{ report.emergency_details }}</small>
                    </div>
                  </div>
                  
                  <div class="response-item">
                    <div class="response-status" :class="{ active: report.family_notified }">
                      <i class="fas" :class="report.family_notified ? 'fa-check' : 'fa-times'"></i>
                    </div>
                    <div class="response-label">
                      <span>Family/Guardian Notified</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="report.injuries_description" class="injuries-section">
                  <h5><i class="fas fa-band-aid"></i> Injuries Description</h5>
                  <p>{{ report.injuries_description }}</p>
                </div>
              </div>
            </div>

            <!-- Witnesses & Follow-up -->
            <div class="detail-section">
              <div class="section-header">
                <i class="fas fa-eye"></i>
                <h4>Witnesses & Follow-up</h4>
              </div>
              <div class="section-content">
                <div class="followup-grid">
                  <div class="followup-item">
                    <div class="followup-status" :class="{ active: report.witnesses_present }">
                      <i class="fas" :class="report.witnesses_present ? 'fa-check' : 'fa-times'"></i>
                    </div>
                    <div class="followup-label">
                      <span>Witnesses Present</span>
                      <small v-if="report.witness_details">{{ report.witness_details }}</small>
                    </div>
                  </div>
                  
                  <div class="followup-item">
                    <div class="followup-status" :class="{ active: report.follow_up_required }">
                      <i class="fas" :class="report.follow_up_required ? 'fa-check' : 'fa-times'"></i>
                    </div>
                    <div class="followup-label">
                      <span>Follow-up Required</span>
                      <small v-if="report.follow_up_details">{{ report.follow_up_details }}</small>
                    </div>
                  </div>
                </div>
                
                <div v-if="report.preventive_measures" class="prevention-section">
                  <h5><i class="fas fa-shield-alt"></i> Preventive Measures</h5>
                  <p>{{ report.preventive_measures }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <form v-else @submit.prevent="updateReport" class="edit-mode">
          <div class="edit-sections">
            <div class="edit-section">
              <div class="section-header">
                <i class="fas fa-clipboard-check"></i>
                <h4>Review & Update Status</h4>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label for="status" class="form-label">
                    <i class="fas fa-flag"></i>
                    Status *
                  </label>
                  <select 
                    id="status" 
                    v-model="editForm.status" 
                    class="form-input" 
                    :class="{ 'error': errors.status }"
                    required
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="requires_action">Requires Action</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div v-if="errors.status" class="error-message">{{ errors.status }}</div>
                </div>
                
                <div class="form-group">
                  <label for="priority" class="form-label">
                    <i class="fas fa-star"></i>
                    Priority
                  </label>
                  <select 
                    id="priority" 
                    v-model="editForm.priority" 
                    class="form-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div class="form-group full-width">
                  <div class="checkbox-section">
                    <label class="checkbox-item">
                      <input 
                        id="ndis_notified" 
                        v-model="editForm.ndis_notified" 
                        type="checkbox"
                        class="checkbox"
                      >
                      <span class="checkmark"></span>
                      <span class="checkbox-label">NDIS notified of this incident</span>
                    </label>
                  </div>
                </div>
                
                <div class="form-group full-width">
                  <label for="review_notes" class="form-label">
                    <i class="fas fa-sticky-note"></i>
                    Review Notes
                  </label>
                  <textarea 
                    id="review_notes" 
                    v-model="editForm.review_notes" 
                    class="form-textarea"
                    rows="4"
                    placeholder="Add any additional notes or observations..."
                  ></textarea>
                </div>
                
                <div class="form-group full-width">
                  <label for="corrective_actions" class="form-label">
                    <i class="fas fa-tools"></i>
                    Corrective Actions
                  </label>
                  <textarea 
                    id="corrective_actions" 
                    v-model="editForm.corrective_actions" 
                    class="form-textarea"
                    rows="3"
                    placeholder="What corrective actions have been or will be taken?"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <div class="footer-actions">
          <button type="button" class="btn btn-secondary" @click="handleClose">
            <i class="fas fa-times"></i>
            {{ isEditMode ? 'Cancel' : 'Close' }}
          </button>
          
          <div class="action-buttons">
            <button 
              v-if="isEditMode" 
              type="button" 
              class="btn btn-outline-primary" 
              @click="cancelEdit"
            >
              <i class="fas fa-undo"></i>
              Reset
            </button>
            
            <button 
              v-if="isEditMode" 
              type="submit" 
              class="btn btn-success" 
              :disabled="submitting"
              @click="updateReport"
            >
              <span v-if="submitting" class="spinner"></span>
              <i v-else class="fas fa-save"></i>
              {{ submitting ? 'Updating...' : 'Update Report' }}
            </button>
            
            <button 
              v-if="!isEditMode && canEdit" 
              type="button" 
              class="btn btn-primary" 
              @click="toggleEditMode"
            >
              <i class="fas fa-edit"></i>
              Review & Update
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, computed } from 'vue'
import { incidentReportService } from '@/services/incidentReports'
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ViewIncidentReportModal',
  props: {
    report: {
      type: Object,
      default: null
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const submitting = ref(false)
    const errors = ref({})
    const isEditMode = ref(false)
    
    const editForm = reactive({
      status: '',
      priority: '',
      ndis_notified: false,
      review_notes: '',
      corrective_actions: ''
    })

    // Initialize form with current report data
    const initializeForm = () => {
      if (props.report) {
        editForm.status = props.report.status || 'submitted'
        editForm.priority = props.report.priority || 'medium'
        editForm.ndis_notified = props.report.ndis_notified || false
        editForm.review_notes = props.report.review_notes || ''
        editForm.corrective_actions = props.report.corrective_actions || ''
      }
    }

    watch(() => props.report, initializeForm, { immediate: true })

    const handleOverlayClick = (event) => {
      if (event.target === event.currentTarget) {
        handleClose()
      }
    }

    const handleClose = () => {
      if (isEditMode.value) {
        cancelEdit()
      } else {
        emit('close')
      }
    }

    const toggleEditMode = () => {
      isEditMode.value = true
      initializeForm()
    }

    const cancelEdit = () => {
      isEditMode.value = false
      initializeForm()
      errors.value = {}
    }

    const updateReport = async () => {
      if (submitting.value) return
      
      try {
        submitting.value = true
        errors.value = {}
        
        const updateData = {
          status: editForm.status,
          priority: editForm.priority,
          ndis_notified: editForm.ndis_notified,
          review_notes: editForm.review_notes || undefined,
          corrective_actions: editForm.corrective_actions || undefined,
          reviewed_by: authStore.user?.id,
          reviewed_at: new Date().toISOString()
        }
        
        await incidentReportService.updateIncidentReport(props.report.id, updateData)
        showSuccessNotification('Incident report updated successfully')
        emit('updated')
        
      } catch (error) {
        console.error('Error updating incident report:', error)
        
        if (error.response?.data?.error?.message) {
          showErrorNotification(error.response.data.error.message)
        } else {
          showErrorNotification('Failed to update incident report. Please try again.')
        }
      } finally {
        submitting.value = false
      }
    }

    // Helper methods
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const formatIncidentType = (type) => {
      return type?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || ''
    }

    const formatStatus = (status) => {
      return status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || ''
    }

    const getSeverityBadgeClass = (severity) => {
      const classes = {
        low: 'severity-low',
        medium: 'severity-medium',
        high: 'severity-high',
        critical: 'severity-critical'
      }
      return classes[severity] || 'severity-medium'
    }

    const getStatusBadgeClass = (status) => {
      const classes = {
        submitted: 'status-submitted',
        under_review: 'status-review',
        completed: 'status-completed',
        requires_action: 'status-action'
      }
      return classes[status] || 'status-submitted'
    }

    const getStatusIconClass = (status) => {
      const classes = {
        submitted: 'icon-submitted',
        under_review: 'icon-review',
        completed: 'icon-completed',
        requires_action: 'icon-action'
      }
      return classes[status] || 'icon-submitted'
    }

    const getSeverityIconClass = (severity) => {
      const classes = {
        low: 'severity-icon-low',
        medium: 'severity-icon-medium',
        high: 'severity-icon-high',
        critical: 'severity-icon-critical'
      }
      return classes[severity] || 'severity-icon-medium'
    }

    return {
      submitting,
      errors,
      isEditMode,
      editForm,
      handleOverlayClick,
      handleClose,
      toggleEditMode,
      cancelEdit,
      updateReport,
      formatDate,
      formatIncidentType,
      formatStatus,
      getSeverityBadgeClass,
      getStatusBadgeClass,
      getStatusIconClass,
      getSeverityIconClass
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1055;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 24px 24px 0 0;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.title-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.title-icon.icon-submitted {
  background: rgba(59, 130, 246, 0.2);
}

.title-icon.icon-review {
  background: rgba(245, 158, 11, 0.2);
}

.title-icon.icon-completed {
  background: rgba(16, 185, 129, 0.2);
}

.title-icon.icon-action {
  background: rgba(239, 68, 68, 0.2);
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.modal-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.status-submitted {
  background: rgba(59, 130, 246, 0.2);
  color: #dbeafe;
}

.status-badge.status-review {
  background: rgba(245, 158, 11, 0.2);
  color: #fef3c7;
}

.status-badge.status-completed {
  background: rgba(16, 185, 129, 0.2);
  color: #d1fae5;
}

.status-badge.status-action {
  background: rgba(239, 68, 68, 0.2);
  color: #fee2e2;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.view-mode {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.overview-card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.card-header h3 i {
  color: #667eea;
}

.report-id {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.overview-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.overview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.item-icon.participant {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.item-icon.datetime {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.item-icon.location {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.item-icon.type {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.item-icon.severity.severity-icon-low {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.item-icon.severity.severity-icon-medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.item-icon.severity.severity-icon-high {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.item-icon.severity.severity-icon-critical {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
}

.item-icon.reporter {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.item-content {
  flex: 1;
}

.item-content label {
  display: block;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.item-content span {
  display: block;
  font-weight: 600;
  color: #1e293b;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.item-content small {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
}

.type-badge {
  background: #667eea !important;
  color: white !important;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
}

.severity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
}

.severity-badge.severity-low {
  background: #dcfce7;
  color: #16a34a;
}

.severity-badge.severity-medium {
  background: #fef3c7;
  color: #d97706;
}

.severity-badge.severity-high {
  background: #fee2e2;
  color: #dc2626;
}

.severity-badge.severity-critical {
  background: #fee2e2;
  color: #991b1b;
}

.details-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.section-header h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.section-header i {
  color: #667eea;
  font-size: 1.125rem;
}

.section-content {
  line-height: 1.6;
}

.description-text,
.action-text {
  font-size: 1rem;
  color: #374151;
  margin: 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.response-grid,
.followup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.response-item,
.followup-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.response-status,
.followup-status {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
  background: #e5e7eb;
  color: #6b7280;
}

.response-status.active,
.followup-status.active {
  background: #10b981;
  color: white;
}

.response-label,
.followup-label {
  flex: 1;
}

.response-label span,
.followup-label span {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.response-label small,
.followup-label small {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.injuries-section,
.prevention-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.injuries-section h5,
.prevention-section h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.injuries-section h5 i,
.prevention-section h5 i {
  color: #667eea;
}

.injuries-section p,
.prevention-section p {
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* Edit Mode Styles */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.edit-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.edit-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #667eea;
  width: 16px;
}

.form-input,
.form-textarea {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.checkbox-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.checkbox {
  display: none;
}

.checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: white;
}

.checkbox:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.checkbox-label {
  font-weight: 500;
  color: #374151;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 2px solid #f1f5f9;
  background: #f8fafc;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.btn-outline-primary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dark theme support */
[data-theme="dark"] .modal-container {
  background: #1e293b;
  color: #f1f5f9;
}

[data-theme="dark"] .overview-card,
[data-theme="dark"] .detail-section,
[data-theme="dark"] .edit-section {
  background: #334155;
  border-color: #475569;
}

[data-theme="dark"] .card-header h3,
[data-theme="dark"] .section-header h4 {
  color: #f1f5f9;
}

[data-theme="dark"] .overview-item {
  background: #475569;
  border-color: #64748b;
}

[data-theme="dark"] .item-content span {
  color: #f1f5f9;
}

[data-theme="dark"] .description-text,
[data-theme="dark"] .action-text {
  background: #475569;
  color: #f1f5f9;
}

[data-theme="dark"] .response-item,
[data-theme="dark"] .followup-item {
  background: #475569;
  border-color: #64748b;
}

[data-theme="dark"] .response-label span,
[data-theme="dark"] .followup-label span {
  color: #f1f5f9;
}

[data-theme="dark"] .form-label {
  color: #f1f5f9;
}

[data-theme="dark"] .form-input,
[data-theme="dark"] .form-textarea {
  background: #475569;
  border-color: #64748b;
  color: #f1f5f9;
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-textarea:focus {
  background: #475569;
  border-color: #667eea;
}

[data-theme="dark"] .checkbox-section {
  background: #475569;
  border-color: #64748b;
}

[data-theme="dark"] .checkbox-label {
  color: #f1f5f9;
}

[data-theme="dark"] .checkmark {
  background: #64748b;
  border-color: #94a3b8;
}

[data-theme="dark"] .modal-footer {
  background: #334155;
  border-color: #475569;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    border-radius: 20px;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1.5rem;
    border-radius: 20px 20px 0 0;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .title-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .footer-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
  }
  
  .response-grid,
  .followup-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .modal-subtitle {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
<template>
  <div class="care-notes-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Care Notes</h1>
          <p class="page-subtitle">View and manage care notes taken during shifts</p>
        </div>
        <button 
          class="btn btn-primary d-flex align-items-center gap-2"
          @click="showCreateModal = true"
        >
          <i class="fas fa-plus"></i>
          Add Care Note
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card">
      <div class="card">
        <div class="card-body">
          <div class="row g-3">
            <!-- Participant Filter -->
            <div class="col-md-3">
              <label for="participant-filter" class="form-label">Participant</label>
              <select 
                id="participant-filter" 
                class="form-select" 
                v-model="filters.participant_id"
                @change="loadCareNotes"
              >
                <option value="">All Participants</option>
                <option 
                  v-for="participant in participants" 
                  :key="participant.id" 
                  :value="participant.id"
                >
                  {{ participant.first_name }} {{ participant.last_name }}
                </option>
              </select>
            </div>

            <!-- Staff Filter -->
            <div class="col-md-3">
              <label for="staff-filter" class="form-label">Staff Member</label>
              <select 
                id="staff-filter" 
                class="form-select" 
                v-model="filters.staff_id"
                @change="loadCareNotes"
              >
                <option value="">All Staff</option>
                <option 
                  v-for="staff in staffMembers" 
                  :key="staff.id" 
                  :value="staff.id"
                >
                  {{ staff.first_name }} {{ staff.last_name }}
                </option>
              </select>
            </div>

            <!-- Note Type Filter -->
            <div class="col-md-3">
              <label for="type-filter" class="form-label">Note Type</label>
              <select 
                id="type-filter" 
                class="form-select" 
                v-model="filters.note_type"
                @change="loadCareNotes"
              >
                <option value="">All Types</option>
                <option value="daily_progress">Daily Progress</option>
                <option value="medication">Medication</option>
                <option value="behaviour">Behaviour</option>
                <option value="health">Health</option>
                <option value="communication">Communication</option>
                <option value="achievement">Achievement</option>
                <option value="concern">Concern</option>
              </select>
            </div>

            <!-- Priority Filter -->
            <div class="col-md-3">
              <label for="priority-filter" class="form-label">Priority</label>
              <select 
                id="priority-filter" 
                class="form-select" 
                v-model="filters.priority"
                @change="loadCareNotes"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <!-- Date Range -->
            <div class="col-md-6">
              <div class="row g-2">
                <div class="col">
                  <label for="from-date" class="form-label">From Date</label>
                  <input 
                    id="from-date"
                    type="date" 
                    class="form-control" 
                    v-model="filters.from_date"
                    @change="loadCareNotes"
                  >
                </div>
                <div class="col">
                  <label for="to-date" class="form-label">To Date</label>
                  <input 
                    id="to-date"
                    type="date" 
                    class="form-control" 
                    v-model="filters.to_date"
                    @change="loadCareNotes"
                  >
                </div>
              </div>
            </div>

            <!-- Additional Options -->
            <div class="col-md-6">
              <label class="form-label">Additional Options</label>
              <div class="d-flex gap-3 mt-2">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="include-private"
                    v-model="filters.include_private"
                    @change="loadCareNotes"
                  >
                  <label class="form-check-label" for="include-private">
                    Include Private Notes
                  </label>
                </div>
                <div class="form-check" v-if="canViewConfidential">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="include-confidential"
                    v-model="filters.include_confidential"
                    @change="loadCareNotes"
                  >
                  <label class="form-check-label" for="include-confidential">
                    Include Confidential Notes
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Clear Filters Button -->
          <div class="row mt-3">
            <div class="col">
              <button class="btn btn-outline-secondary" @click="clearFilters">
                <i class="fas fa-times"></i> Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section" v-if="stats">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="stat-content">
              <h3>{{ stats.total_notes || 0 }}</h3>
              <p>Total Notes</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon urgent">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <h3>{{ stats.follow_up_required || 0 }}</h3>
              <p>Follow-up Required</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="stat-card">
            <div class="stat-content">
              <h4>Notes by Type</h4>
              <div class="type-breakdown">
                <span 
                  v-for="type in stats.by_type" 
                  :key="type.note_type"
                  class="type-badge"
                >
                  {{ formatNoteType(type.note_type) }}: {{ type.count }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Care Notes List -->
    <div class="care-notes-content">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Care Notes</h5>
        </div>
        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading care notes...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="careNotes.length === 0" class="empty-state">
            <div class="text-center py-5">
              <i class="fas fa-sticky-note fa-3x text-muted mb-3"></i>
              <h5>No Care Notes Found</h5>
              <p class="text-muted">No care notes match your current filters.</p>
              <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="fas fa-plus"></i> Add First Care Note
              </button>
            </div>
          </div>

          <!-- Care Notes Grid -->
          <div v-else class="care-notes-grid">
            <div 
              v-for="note in careNotes" 
              :key="note.id"
              class="care-note-card"
              @click="viewNoteDetails(note)"
            >
              <!-- Note Header -->
              <div class="note-header">
                <div class="note-type-badge" :class="getNoteTypeClass(note.note_type)">
                  {{ formatNoteType(note.note_type) }}
                </div>
                <div class="note-priority-badge" :class="getPriorityClass(note.priority)">
                  {{ note.priority }}
                </div>
              </div>

              <!-- Note Title and Content -->
              <div class="note-content">
                <h6 class="note-title">{{ note.title }}</h6>
                <p class="note-preview">{{ truncateText(note.content, 150) }}</p>
              </div>

              <!-- Note Metadata -->
              <div class="note-metadata">
                <div class="metadata-row">
                  <span class="metadata-label">
                    <i class="fas fa-user"></i>
                    {{ note.participant?.first_name }} {{ note.participant?.last_name }}
                  </span>
                  <span class="metadata-value">
                    <i class="fas fa-calendar"></i>
                    {{ formatDate(note.note_date) }}
                  </span>
                </div>
                <div class="metadata-row">
                  <span class="metadata-label">
                    <i class="fas fa-user-md"></i>
                    {{ note.staff?.first_name }} {{ note.staff?.last_name }}
                  </span>
                  <span class="metadata-value" v-if="note.note_time">
                    <i class="fas fa-clock"></i>
                    {{ note.note_time }}
                  </span>
                </div>
              </div>

              <!-- Note Flags -->
              <div class="note-flags">
                <span v-if="note.is_private" class="flag-badge private">
                  <i class="fas fa-lock"></i> Private
                </span>
                <span v-if="note.is_confidential" class="flag-badge confidential">
                  <i class="fas fa-shield-alt"></i> Confidential
                </span>
                <span v-if="note.requires_follow_up" class="flag-badge follow-up">
                  <i class="fas fa-flag"></i> Follow-up Required
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="note-actions">
                <button 
                  class="btn btn-sm btn-outline-primary"
                  @click.stop="editNote(note)"
                  v-if="canEditNote(note)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn btn-sm btn-outline-danger"
                  @click.stop="deleteNote(note)"
                  v-if="canDeleteNote(note)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination && pagination.total_pages > 1" class="pagination-container">
            <nav aria-label="Care notes pagination">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                  <button class="page-link" @click="changePage(pagination.current_page - 1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                <li 
                  v-for="page in getVisiblePages()" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.current_page }"
                >
                  <button class="page-link" @click="changePage(page)">
                    {{ page }}
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: pagination.current_page === pagination.total_pages }">
                  <button class="page-link" @click="changePage(pagination.current_page + 1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Care Note Modal -->
    <div class="modal fade" id="careNoteModal" tabindex="-1" ref="careNoteModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingNote ? 'Edit Care Note' : 'Create Care Note' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveCareNote">
            <div class="modal-body">
              <div class="row g-3">
                <!-- Participant Selection -->
                <div class="col-md-6">
                  <label for="note-participant" class="form-label">Participant *</label>
                  <select 
                    id="note-participant"
                    class="form-select" 
                    v-model="noteForm.participant_id"
                    :disabled="editingNote"
                    required
                  >
                    <option value="">Select Participant</option>
                    <option 
                      v-for="participant in participants" 
                      :key="participant.id" 
                      :value="participant.id"
                    >
                      {{ participant.first_name }} {{ participant.last_name }}
                    </option>
                  </select>
                </div>

                <!-- Note Type -->
                <div class="col-md-6">
                  <label for="note-type" class="form-label">Note Type *</label>
                  <select id="note-type" class="form-select" v-model="noteForm.note_type" required>
                    <option value="">Select Type</option>
                    <option value="daily_progress">Daily Progress</option>
                    <option value="medication">Medication</option>
                    <option value="behaviour">Behaviour</option>
                    <option value="health">Health</option>
                    <option value="communication">Communication</option>
                    <option value="achievement">Achievement</option>
                    <option value="concern">Concern</option>
                  </select>
                </div>

                <!-- Title -->
                <div class="col-12">
                  <label for="note-title" class="form-label">Title *</label>
                  <input 
                    id="note-title"
                    type="text" 
                    class="form-control" 
                    v-model="noteForm.title"
                    required
                    maxlength="255"
                  >
                </div>

                <!-- Content -->
                <div class="col-12">
                  <label for="note-content" class="form-label">Content *</label>
                  <textarea 
                    id="note-content"
                    class="form-control" 
                    rows="6"
                    v-model="noteForm.content"
                    required
                  ></textarea>
                </div>

                <!-- Date and Time -->
                <div class="col-md-6">
                  <label for="note-date" class="form-label">Date *</label>
                  <input 
                    id="note-date"
                    type="date" 
                    class="form-control" 
                    v-model="noteForm.note_date"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label for="note-time" class="form-label">Time</label>
                  <input 
                    id="note-time"
                    type="time" 
                    class="form-control" 
                    v-model="noteForm.note_time"
                  >
                </div>

                <!-- Priority -->
                <div class="col-md-6">
                  <label for="note-priority" class="form-label">Priority</label>
                  <select id="note-priority" class="form-select" v-model="noteForm.priority">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <!-- Category -->
                <div class="col-md-6">
                  <label for="note-category" class="form-label">Category</label>
                  <input 
                    id="note-category"
                    type="text" 
                    class="form-control" 
                    v-model="noteForm.category"
                    placeholder="Optional category"
                  >
                </div>

                <!-- Tags -->
                <div class="col-12">
                  <label for="note-tags" class="form-label">Tags</label>
                  <input 
                    id="note-tags"
                    type="text" 
                    class="form-control" 
                    v-model="tagsInput"
                    placeholder="Enter tags separated by commas"
                  >
                  <small class="form-text text-muted">
                    Example: medication, blood pressure, mobility
                  </small>
                </div>

                <!-- Flags -->
                <div class="col-12">
                  <div class="form-check-group">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="note-private"
                        v-model="noteForm.is_private"
                      >
                      <label class="form-check-label" for="note-private">
                        Private Note (Only visible to management)
                      </label>
                    </div>
                    <div class="form-check" v-if="canMarkConfidential">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="note-confidential"
                        v-model="noteForm.is_confidential"
                      >
                      <label class="form-check-label" for="note-confidential">
                        Confidential (Restricted access)
                      </label>
                    </div>
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="note-follow-up"
                        v-model="noteForm.requires_follow_up"
                      >
                      <label class="form-check-label" for="note-follow-up">
                        Requires Follow-up
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Follow-up Details (shown if follow-up is required) -->
                <div v-if="noteForm.requires_follow_up" class="col-12">
                  <div class="follow-up-section">
                    <h6>Follow-up Details</h6>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label for="follow-up-by" class="form-label">Follow-up By</label>
                        <select id="follow-up-by" class="form-select" v-model="noteForm.follow_up_by">
                          <option value="">Select Staff Member</option>
                          <option 
                            v-for="staff in staffMembers" 
                            :key="staff.id" 
                            :value="staff.id"
                          >
                            {{ staff.first_name }} {{ staff.last_name }}
                          </option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label for="follow-up-date" class="form-label">Follow-up Date</label>
                        <input 
                          id="follow-up-date"
                          type="date" 
                          class="form-control" 
                          v-model="noteForm.follow_up_date"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingNote ? 'Update Note' : 'Create Note' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Note Details Modal -->
    <div class="modal fade" id="noteDetailsModal" tabindex="-1" ref="noteDetailsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Care Note Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedNote">
            <div class="note-details-content">
              <!-- Note Header -->
              <div class="details-header">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h4>{{ selectedNote.title }}</h4>
                    <div class="badge-group">
                      <span class="badge" :class="getNoteTypeClass(selectedNote.note_type)">
                        {{ formatNoteType(selectedNote.note_type) }}
                      </span>
                      <span class="badge" :class="getPriorityClass(selectedNote.priority)">
                        {{ selectedNote.priority }}
                      </span>
                    </div>
                  </div>
                  <div class="note-flags">
                    <span v-if="selectedNote.is_private" class="flag-badge private">
                      <i class="fas fa-lock"></i> Private
                    </span>
                    <span v-if="selectedNote.is_confidential" class="flag-badge confidential">
                      <i class="fas fa-shield-alt"></i> Confidential
                    </span>
                  </div>
                </div>
              </div>

              <!-- Note Content -->
              <div class="details-content">
                <h6>Content</h6>
                <div class="note-content-display">{{ selectedNote.content }}</div>
              </div>

              <!-- Metadata -->
              <div class="details-metadata">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="metadata-item">
                      <label>Participant</label>
                      <span>{{ selectedNote.participant?.first_name }} {{ selectedNote.participant?.last_name }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="metadata-item">
                      <label>Staff Member</label>
                      <span>{{ selectedNote.staff?.first_name }} {{ selectedNote.staff?.last_name }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="metadata-item">
                      <label>Date & Time</label>
                      <span>
                        {{ formatDate(selectedNote.note_date) }}
                        <span v-if="selectedNote.note_time">at {{ selectedNote.note_time }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6" v-if="selectedNote.category">
                    <div class="metadata-item">
                      <label>Category</label>
                      <span>{{ selectedNote.category }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="getNoteTags(selectedNote).length > 0" class="details-tags">
                <label>Tags</label>
                <div class="tag-list">
                  <span 
                    v-for="tag in getNoteTags(selectedNote)" 
                    :key="tag"
                    class="tag-badge"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Follow-up Information -->
              <div v-if="selectedNote.requires_follow_up" class="details-followup">
                <h6>Follow-up Information</h6>
                <div class="row g-3">
                  <div class="col-md-6" v-if="selectedNote.follow_up_user">
                    <div class="metadata-item">
                      <label>Assigned To</label>
                      <span>{{ selectedNote.follow_up_user.first_name }} {{ selectedNote.follow_up_user.last_name }}</span>
                    </div>
                  </div>
                  <div class="col-md-6" v-if="selectedNote.follow_up_date">
                    <div class="metadata-item">
                      <label>Due Date</label>
                      <span>{{ formatDate(selectedNote.follow_up_date) }}</span>
                    </div>
                  </div>
                  <div class="col-12" v-if="selectedNote.follow_up_notes">
                    <div class="metadata-item">
                      <label>Follow-up Notes</label>
                      <div class="follow-up-notes">{{ selectedNote.follow_up_notes }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Timestamps -->
              <div class="details-timestamps">
                <small class="text-muted">
                  Created: {{ formatDateTime(selectedNote.created_at) }}
                  <span v-if="selectedNote.updated_at !== selectedNote.created_at">
                    • Updated: {{ formatDateTime(selectedNote.updated_at) }}
                  </span>
                </small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button 
              v-if="selectedNote && canEditNote(selectedNote)" 
              type="button" 
              class="btn btn-primary"
              @click="editNoteFromDetails"
            >
              <i class="fas fa-edit"></i> Edit Note
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import careNotesAPI from '../services/careNotes'
import participantsAPI from '../services/participants'
import usersAPI from '../services/users'
import { Modal } from 'bootstrap'

export default {
  name: 'CareNotes',
  setup() {
    const authStore = useAuthStore()
    const { showToast } = useToast()

    // Reactive data
    const loading = ref(false)
    const saving = ref(false)
    const careNotes = ref([])
    const participants = ref([])
    const staffMembers = ref([])
    const stats = ref(null)
    const pagination = ref(null)
    
    // Modals
    const careNoteModal = ref(null)
    const noteDetailsModal = ref(null)
    const showCreateModal = ref(false)
    const selectedNote = ref(null)
    const editingNote = ref(null)

    // Filters
    const filters = reactive({
      participant_id: '',
      staff_id: '',
      note_type: '',
      priority: '',
      from_date: '',
      to_date: '',
      include_private: false,
      include_confidential: false,
      page: 1,
      limit: 20
    })

    // Note form
    const noteForm = reactive({
      participant_id: '',
      shift_id: null,
      title: '',
      content: '',
      note_type: '',
      priority: 'normal',
      note_date: new Date().toISOString().split('T')[0],
      note_time: '',
      is_private: false,
      is_confidential: false,
      requires_follow_up: false,
      follow_up_by: '',
      follow_up_date: '',
      tags: [],
      category: ''
    })

    const tagsInput = ref('')

    // Computed properties
    const canViewConfidential = computed(() => {
      return ['admin', 'super_admin'].includes(authStore.user?.role)
    })

    const canMarkConfidential = computed(() => {
      return ['admin', 'super_admin'].includes(authStore.user?.role)
    })

    // Methods
    const loadCareNotes = async () => {
      try {
        loading.value = true
        const response = await careNotesAPI.getCareNotes(filters)
        careNotes.value = response.data.care_notes || []
        pagination.value = response.data.pagination
      } catch (error) {
        console.error('Error loading care notes:', error)
        showToast('Error loading care notes', 'error')
      } finally {
        loading.value = false
      }
    }

    const loadStats = async () => {
      try {
        const response = await careNotesAPI.getCareNoteStats()
        stats.value = response.data
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    const loadParticipants = async () => {
      try {
        const response = await participantsAPI.getParticipants({ limit: 1000 })
        participants.value = response.data.participants || []
      } catch (error) {
        console.error('Error loading participants:', error)
      }
    }

    const loadStaffMembers = async () => {
      try {
        const response = await usersAPI.getUsers({ limit: 1000 })
        staffMembers.value = response.data.users || []
      } catch (error) {
        console.error('Error loading staff members:', error)
      }
    }

    const clearFilters = () => {
      Object.keys(filters).forEach(key => {
        if (key === 'page') filters[key] = 1
        else if (key === 'limit') filters[key] = 20
        else if (typeof filters[key] === 'boolean') filters[key] = false
        else filters[key] = ''
      })
      loadCareNotes()
    }

    const formatNoteType = (type) => {
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-AU')
    }

    const formatDateTime = (datetime) => {
      return new Date(datetime).toLocaleString('en-AU')
    }

    const truncateText = (text, length = 100) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    const getNoteTypeClass = (type) => {
      const classes = {
        daily_progress: 'bg-primary',
        medication: 'bg-success',
        behaviour: 'bg-warning',
        health: 'bg-danger',
        communication: 'bg-info',
        achievement: 'bg-success',
        concern: 'bg-warning'
      }
      return classes[type] || 'bg-secondary'
    }

    const getPriorityClass = (priority) => {
      const classes = {
        low: 'bg-secondary',
        normal: 'bg-primary',
        high: 'bg-warning',
        urgent: 'bg-danger'
      }
      return classes[priority] || 'bg-primary'
    }

    const getNoteTags = (note) => {
      if (!note.tags) return []
      try {
        return JSON.parse(note.tags)
      } catch {
        return []
      }
    }

    const canEditNote = (note) => {
      const userRole = authStore.user?.role
      const userId = authStore.user?.id
      
      return ['admin', 'super_admin', 'manager'].includes(userRole) || 
             note.staff_id === userId
    }

    const canDeleteNote = (note) => {
      const userRole = authStore.user?.role
      const userId = authStore.user?.id
      
      return ['admin', 'super_admin', 'manager'].includes(userRole) || 
             note.staff_id === userId
    }

    const resetNoteForm = () => {
      Object.keys(noteForm).forEach(key => {
        if (key === 'priority') noteForm[key] = 'normal'
        else if (key === 'note_date') noteForm[key] = new Date().toISOString().split('T')[0]
        else if (typeof noteForm[key] === 'boolean') noteForm[key] = false
        else if (Array.isArray(noteForm[key])) noteForm[key] = []
        else noteForm[key] = ''
      })
      tagsInput.value = ''
    }

    const editNote = (note) => {
      editingNote.value = note
      
      // Populate form
      Object.keys(noteForm).forEach(key => {
        if (key === 'note_date') {
          noteForm[key] = note[key].split('T')[0]
        } else if (key === 'follow_up_date' && note[key]) {
          noteForm[key] = note[key].split('T')[0]
        } else if (key === 'tags') {
          noteForm[key] = getNoteTags(note)
        } else {
          noteForm[key] = note[key] || (typeof noteForm[key] === 'boolean' ? false : '')
        }
      })
      
      tagsInput.value = getNoteTags(note).join(', ')
      
      nextTick(() => {
        const modal = new Modal(careNoteModal.value)
        modal.show()
      })
    }

    const editNoteFromDetails = () => {
      const detailsModal = Modal.getInstance(noteDetailsModal.value)
      detailsModal.hide()
      
      setTimeout(() => {
        editNote(selectedNote.value)
      }, 300)
    }

    const saveCareNote = async () => {
      try {
        saving.value = true
        
        // Process tags
        const tags = tagsInput.value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
        
        const noteData = { ...noteForm, tags }
        
        // Convert date strings to proper format
        if (noteData.note_date) {
          noteData.note_date = new Date(noteData.note_date + 'T00:00:00').toISOString()
        }
        if (noteData.follow_up_date) {
          noteData.follow_up_date = new Date(noteData.follow_up_date + 'T00:00:00').toISOString()
        }
        
        if (editingNote.value) {
          await careNotesAPI.updateCareNote(editingNote.value.id, noteData)
          showToast('Care note updated successfully', 'success')
        } else {
          await careNotesAPI.createCareNote(noteData)
          showToast('Care note created successfully', 'success')
        }
        
        const modal = Modal.getInstance(careNoteModal.value)
        modal.hide()
        
        await loadCareNotes()
        await loadStats()
        
      } catch (error) {
        console.error('Error saving care note:', error)
        showToast('Error saving care note', 'error')
      } finally {
        saving.value = false
      }
    }

    const deleteNote = async (note) => {
      if (!confirm('Are you sure you want to delete this care note?')) return
      
      try {
        await careNotesAPI.deleteCareNote(note.id)
        showToast('Care note deleted successfully', 'success')
        await loadCareNotes()
        await loadStats()
      } catch (error) {
        console.error('Error deleting care note:', error)
        showToast('Error deleting care note', 'error')
      }
    }

    const viewNoteDetails = (note) => {
      selectedNote.value = note
      nextTick(() => {
        const modal = new Modal(noteDetailsModal.value)
        modal.show()
      })
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value?.total_pages) {
        filters.page = page
        loadCareNotes()
      }
    }

    const getVisiblePages = () => {
      if (!pagination.value) return []
      
      const current = pagination.value.current_page
      const total = pagination.value.total_pages
      const pages = []
      
      const start = Math.max(1, current - 2)
      const end = Math.min(total, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }

    // Watchers
    watch(showCreateModal, (show) => {
      if (show) {
        resetNoteForm()
        editingNote.value = null
        nextTick(() => {
          const modal = new Modal(careNoteModal.value)
          modal.show()
          showCreateModal.value = false
        })
      }
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadParticipants(),
        loadStaffMembers(),
        loadStats()
      ])
      await loadCareNotes()
    })

    return {
      // Data
      loading,
      saving,
      careNotes,
      participants,
      staffMembers,
      stats,
      pagination,
      filters,
      noteForm,
      tagsInput,
      selectedNote,
      editingNote,
      showCreateModal,
      careNoteModal,
      noteDetailsModal,
      
      // Computed
      canViewConfidential,
      canMarkConfidential,
      
      // Methods
      loadCareNotes,
      clearFilters,
      formatNoteType,
      formatDate,
      formatDateTime,
      truncateText,
      getNoteTypeClass,
      getPriorityClass,
      getNoteTags,
      canEditNote,
      canDeleteNote,
      editNote,
      editNoteFromDetails,
      saveCareNote,
      deleteNote,
      viewNoteDetails,
      changePage,
      getVisiblePages
    }
  }
}
</script>

<style scoped>
.care-notes-page {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6c757d;
  margin-bottom: 0;
}

.filters-card {
  margin-bottom: 2rem;
}

.filters-card .card {
  border: 1px solid #e9ecef;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.stats-section {
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-icon.urgent {
  background: #dc3545;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #6c757d;
  margin-bottom: 0;
  font-size: 0.9rem;
}

.type-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.type-badge {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.care-notes-content .card {
  border: 1px solid #e9ecef;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.care-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.care-note-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.care-note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.note-type-badge,
.note-priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.note-content {
  margin-bottom: 1rem;
}

.note-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.note-preview {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0;
}

.note-metadata {
  margin-bottom: 1rem;
}

.metadata-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.metadata-row:last-child {
  margin-bottom: 0;
}

.metadata-label,
.metadata-value {
  font-size: 0.85rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metadata-label i,
.metadata-value i {
  width: 14px;
  text-align: center;
}

.note-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.flag-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.flag-badge.private {
  background: #ffc107;
  color: #212529;
}

.flag-badge.confidential {
  background: #dc3545;
  color: white;
}

.flag-badge.follow-up {
  background: #fd7e14;
  color: white;
}

.note-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  gap: 0.5rem;
}

.care-note-card:hover .note-actions {
  opacity: 1;
}

.note-actions .btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  opacity: 0.5;
}

.pagination-container {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.modal-body {
  max-height: 80vh;
  overflow-y: auto;
}

.form-check-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.follow-up-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.follow-up-section h6 {
  color: #495057;
  margin-bottom: 1rem;
}

.details-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.details-header h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.badge-group {
  display: flex;
  gap: 0.5rem;
}

.details-content {
  margin-bottom: 1.5rem;
}

.details-content h6 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.note-content-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  white-space: pre-wrap;
  line-height: 1.6;
}

.details-metadata {
  margin-bottom: 1.5rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.metadata-item span {
  color: #212529;
}

.details-tags {
  margin-bottom: 1.5rem;
}

.details-tags label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.5rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-badge {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.details-followup {
  margin-bottom: 1.5rem;
}

.details-followup h6 {
  color: #495057;
  margin-bottom: 1rem;
}

.follow-up-notes {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  white-space: pre-wrap;
  line-height: 1.5;
}

.details-timestamps {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

/* Responsive Design */
@media (max-width: 768px) {
  .care-notes-page {
    padding: 1rem;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }
  
  .stats-section .row {
    --bs-gutter-x: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .care-notes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .care-note-card {
    padding: 1rem;
  }
  
  .note-actions {
    opacity: 1;
  }
  
  .metadata-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .type-breakdown {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .modal-body {
    max-height: 70vh;
  }
  
  .details-header .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }
  
  .tag-list {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 576px) {
  .filters-card .row {
    --bs-gutter-x: 0.5rem;
  }
  
  .filters-card .col-md-3,
  .filters-card .col-md-6 {
    margin-bottom: 1rem;
  }
  
  .stats-section .col-md-3,
  .stats-section .col-md-6 {
    margin-bottom: 1rem;
  }
}
</style>
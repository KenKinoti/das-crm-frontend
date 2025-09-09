<template>
  <div class="container-fluid">
    <!-- Add glassmorphism background overlay -->
    <div class="page-overlay"></div>
    
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-sticky-note"></i>
          Care Notes
        </h1>
        <p>View and manage care notes taken during shifts</p>
      </div>
      <button 
        class="btn btn-shift"
        @click="showCreateModal = true"
      >
        <i class="fas fa-plus"></i>
        Add Care Note
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section" :class="{ minimized: filtersMinimized }">
      <div class="filters-header">
        <h4 class="filters-title">
          <i class="fas fa-search"></i>
          Search & Filters
        </h4>
        <button @click="filtersMinimized = !filtersMinimized" class="btn-minimize" :title="filtersMinimized ? 'Expand Filters' : 'Minimize Filters'">
          <i :class="filtersMinimized ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
        </button>
      </div>
      <div v-show="!filtersMinimized" class="filters-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search care notes..." 
            class="form-input"
            @input="debouncedLoadCareNotes"
          />
        </div>
        
        <!-- Filter Controls -->
        <div class="filter-controls">
          <select v-model="filters.participant_id" @change="debouncedLoadCareNotes" class="form-select">
            <option value="">All Participants</option>
            <option 
              v-for="participant in participants" 
              :key="participant.id" 
              :value="participant.id"
            >
              {{ participant.first_name }} {{ participant.last_name }}
            </option>
          </select>
          
          <select 
            v-if="!isCareWorker"
            v-model="filters.staff_id" 
            @change="debouncedLoadCareNotes" 
            class="form-select"
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
          
          <select v-model="filters.note_type" @change="debouncedLoadCareNotes" class="form-select">
            <option value="">All Types</option>
            <option value="daily_progress">Daily Progress</option>
            <option value="medication">Medication</option>
            <option value="behaviour">Behaviour</option>
            <option value="health">Health</option>
            <option value="communication">Communication</option>
            <option value="achievement">Achievement</option>
            <option value="concern">Concern</option>
          </select>

          <select v-model="filters.priority" @change="debouncedLoadCareNotes" class="form-select">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline-elegant" title="Clear">
            <i class="fas fa-times"></i>
            Clear
          </button>
          
          <!-- View Toggle -->
          <div class="view-toggle">
            <button 
              @click="currentView = 'grid'" 
              :class="['view-btn-elegant', { active: currentView === 'grid' }]"
              title="Grid View"
            >
              <i class="fas fa-th"></i>
            </button>
            <button 
              @click="currentView = 'list'" 
              :class="['view-btn-elegant', { active: currentView === 'list' }]"
              title="List View"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.total_notes || 0 }}</div>
          <div class="stat-label">Total Notes</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.follow_up_required || 0 }}</div>
          <div class="stat-label">Follow-up Required</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getTodayNotesCount() }}</div>
          <div class="stat-label">Today's Notes</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">
          <i class="fas fa-calendar-week"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getWeekNotesCount() }}</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>
    </div>

    <!-- Care Notes Content -->
    <div class="content-card">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading care notes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="careNotes.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-sticky-note"></i>
        <h3>No Care Notes Found</h3>
        <p>No care notes match your current filters.</p>
        <button class="btn btn-shift" @click="showCreateModal = true">
          <i class="fas fa-plus"></i>
          Add First Care Note
        </button>
      </div>

      <div v-else-if="careNotes.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <!-- Grid View -->
      <div v-else-if="currentView === 'grid'" class="care-notes-grid">
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
      
      <!-- List View -->
      <div v-else class="care-notes-list">
        <div class="list-header">
          <div class="header-cell">Date/Time</div>
          <div class="header-cell">Participant</div>
          <div class="header-cell">Type</div>
          <div class="header-cell">Priority</div>
          <div class="header-cell">Title</div>
          <div class="header-cell">Staff</div>
          <div class="header-cell">Actions</div>
        </div>
        
        <div class="list-body">
          <div v-for="note in careNotes" :key="note.id" class="list-row" @click="viewNoteDetails(note)">
            <div class="list-cell" data-label="Date/Time">
              <div class="cell-main">{{ formatDate(note.note_date) }}</div>
              <div class="cell-sub" v-if="note.note_time">{{ note.note_time }}</div>
            </div>
            <div class="list-cell" data-label="Participant">
              <div class="cell-main">{{ note.participant?.first_name }} {{ note.participant?.last_name }}</div>
            </div>
            <div class="list-cell" data-label="Type">
              <span class="badge" :class="getNoteTypeClass(note.note_type)">{{ formatNoteType(note.note_type) }}</span>
            </div>
            <div class="list-cell" data-label="Priority">
              <span class="badge" :class="getPriorityClass(note.priority)">{{ note.priority }}</span>
            </div>
            <div class="list-cell" data-label="Title">
              <div class="cell-main">{{ note.title }}</div>
              <div class="cell-sub">{{ truncateText(note.content, 50) }}</div>
            </div>
            <div class="list-cell" data-label="Staff">
              {{ note.staff?.first_name }} {{ note.staff?.last_name }}
            </div>
            <div class="list-cell actions-cell" data-label="Actions" @click.stop>
              <button @click="editNote(note)" v-if="canEditNote(note)" class="action-btn edit-btn" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteNote(note)" v-if="canDeleteNote(note)" class="action-btn delete-btn" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
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

    // View and search
    const currentView = ref('grid')
    const searchQuery = ref('')
    const filtersMinimized = ref(true)

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
    const isCareWorker = computed(() => {
      return authStore.user?.role === 'care_worker'
    })

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
        
        // Apply role-based filtering
        const requestFilters = { ...filters }
        
        // Care workers can only see their own notes
        if (authStore.user?.role === 'care_worker') {
          requestFilters.staff_id = authStore.user.id
        }
        
        const response = await careNotesAPI.getCareNotes(requestFilters)
        careNotes.value = response.data.care_notes || []
        pagination.value = response.data.pagination
      } catch (error) {
        console.error('Error loading care notes:', error)
        showToast('Error loading care notes', 'error')
        // Set empty state to prevent UI issues
        careNotes.value = []
        pagination.value = null
      } finally {
        loading.value = false
      }
    }

    // Debounced version to prevent excessive API calls
    let loadTimeout = null
    const debouncedLoadCareNotes = () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
      loadTimeout = setTimeout(() => {
        loadCareNotes()
      }, 300)
    }

    const loadStats = async () => {
      try {
        const statsFilters = {}
        
        // Care workers can only see stats for their own notes
        if (authStore.user?.role === 'care_worker') {
          statsFilters.staff_id = authStore.user.id
        }
        
        const response = await careNotesAPI.getCareNoteStats(statsFilters)
        stats.value = response.data
      } catch (error) {
        console.error('Error loading stats:', error)
        // Set null to hide stats section on error
        stats.value = null
      }
    }

    const loadParticipants = async () => {
      try {
        const response = await participantsAPI.getParticipants({ limit: 1000 })
        participants.value = response.data.participants || []
      } catch (error) {
        console.error('Error loading participants:', error)
        participants.value = []
      }
    }

    const loadStaffMembers = async () => {
      try {
        const response = await usersAPI.getUsers({ limit: 1000 })
        staffMembers.value = response.data.users || []
      } catch (error) {
        console.error('Error loading staff members:', error)
        staffMembers.value = []
      }
    }

    const clearFilters = () => {
      Object.keys(filters).forEach(key => {
        if (key === 'page') filters[key] = 1
        else if (key === 'limit') filters[key] = 20
        else if (typeof filters[key] === 'boolean') filters[key] = false
        else filters[key] = ''
      })
      debouncedLoadCareNotes()
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
      
      // For care workers, automatically set themselves as the staff member
      if (authStore.user?.role === 'care_worker') {
        noteForm.staff_id = authStore.user.id
      }
      
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

    // Helper methods for stats
    const getTodayNotesCount = () => {
      if (!careNotes.value) return 0
      const today = new Date().toISOString().split('T')[0]
      return careNotes.value.filter(note => note.note_date && note.note_date.startsWith(today)).length
    }

    const getWeekNotesCount = () => {
      if (!careNotes.value) return 0
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return careNotes.value.filter(note => {
        if (!note.note_date) return false
        const noteDate = new Date(note.note_date)
        return noteDate >= weekAgo && noteDate <= now
      }).length
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
      // Load critical data first
      await Promise.all([
        loadParticipants(),
        loadStaffMembers()
      ])
      
      // Load main content
      await loadCareNotes()
      
      // Load stats in background (non-blocking)
      loadStats().catch(err => console.warn('Stats loading failed:', err))
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
      currentView,
      searchQuery,
      filtersMinimized,
      
      // Computed
      isCareWorker,
      canViewConfidential,
      canMarkConfidential,
      
      // Methods
      loadCareNotes,
      debouncedLoadCareNotes,
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
      getVisiblePages,
      getTodayNotesCount,
      getWeekNotesCount
    }
  }
}
</script>

<style scoped>
/* Import shared styles for consistent layout */
@import url('../assets/styles/participants-common.css');

.container-fluid {
  position: relative;
  padding: 1.5rem;
  min-height: 100vh;
}

.page-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(249, 250, 251, 0.95) 0%, 
    rgba(243, 244, 246, 0.9) 50%, 
    rgba(249, 250, 251, 0.95) 100%);
  pointer-events: none;
  z-index: -1;
}

[data-theme="dark"] .page-overlay {
  background: linear-gradient(135deg, 
    rgba(17, 24, 39, 0.95) 0%, 
    rgba(31, 41, 55, 0.9) 50%, 
    rgba(17, 24, 39, 0.95) 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .page-header {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(100, 116, 139, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
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

[data-theme="dark"] .header-content h1 {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-content h1 i {
  color: #667eea;
  -webkit-text-fill-color: #667eea;
  font-size: 1.5rem;
}

[data-theme="dark"] .header-content h1 i {
  color: #8b5cf6;
  -webkit-text-fill-color: #8b5cf6;
}

.header-content p {
  font-size: 1.1rem;
  color: rgba(107, 114, 128, 0.8);
  margin: 0;
  font-weight: 500;
}

[data-theme="dark"] .header-content p {
  color: rgba(148, 163, 184, 0.9);
}

/* Filters Section */
.filters-section {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

[data-theme="dark"] .filters-section {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filters-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

[data-theme="dark"] .filters-title {
  color: #f3f4f6;
}

.btn-minimize {
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.3);
  border-radius: 6px;
  padding: 6px 10px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  margin-left: auto;
  flex-shrink: 0;
}

.btn-minimize:hover {
  background: rgba(107, 114, 128, 0.2);
  border-color: rgba(107, 114, 128, 0.5);
  color: #374151;
}

[data-theme="dark"] .btn-minimize {
  background: rgba(55, 65, 81, 0.5);
  border-color: rgba(75, 85, 99, 0.5);
  color: #9ca3af;
}

[data-theme="dark"] .btn-minimize:hover {
  background: rgba(55, 65, 81, 0.7);
  border-color: rgba(75, 85, 99, 0.7);
  color: #d1d5db;
}

.filters-section.minimized {
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}

.filters-section.minimized .filters-header {
  margin-bottom: 0;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.search-box {
  position: relative;
  flex: 1 1 auto;
  min-width: 200px;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.9rem;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

[data-theme="dark"] .form-input {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(100, 116, 139, 0.4);
  color: #f1f5f9;
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .form-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  background: rgba(30, 41, 59, 0.95);
}

[data-theme="dark"] .search-box i {
  color: #94a3b8;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.form-select {
  padding: 0.65rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  min-width: 96px;
  max-width: 96px;
  backdrop-filter: blur(10px);
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

[data-theme="dark"] .form-select {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(100, 116, 139, 0.4);
  color: #f1f5f9;
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .form-select:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  background: rgba(30, 41, 59, 0.95);
}

[data-theme="dark"] .form-select option {
  background: #1e293b;
  color: #f1f5f9;
}

.view-toggle {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.9);
}

.view-btn-elegant {
  background: transparent;
  color: #6b7280;
  border: none;
  padding: 0.65rem 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn-elegant:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.view-btn-elegant.active {
  background: #667eea;
  color: white;
}

[data-theme="dark"] .view-toggle {
  border-color: rgba(100, 116, 139, 0.4);
  background: rgba(30, 41, 59, 0.8);
}

[data-theme="dark"] .view-btn-elegant {
  color: #94a3b8;
}

[data-theme="dark"] .view-btn-elegant:hover {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

[data-theme="dark"] .view-btn-elegant.active {
  background: #8b5cf6;
  color: white;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .stat-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.8) 100%);
  border: 1px solid rgba(100, 116, 139, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}

[data-theme="dark"] .stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  border-color: rgba(139, 92, 246, 0.4);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.stat-icon.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.stat-icon.info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

[data-theme="dark"] .stat-number {
  color: #f1f5f9;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

[data-theme="dark"] .stat-label {
  color: #94a3b8;
}

/* Content Card */
.content-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .content-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

[data-theme="dark"] .loading-state,
[data-theme="dark"] .empty-state {
  color: #94a3b8;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-left-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

[data-theme="dark"] .loading-spinner {
  border-color: rgba(75, 85, 99, 0.3);
  border-left-color: #8b5cf6;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

[data-theme="dark"] .empty-state i {
  color: #64748b;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

[data-theme="dark"] .empty-state h3 {
  color: #f1f5f9;
}

[data-theme="dark"] .empty-state p {
  color: #94a3b8;
}

/* Dark Theme - Care Note Cards */
[data-theme="dark"] .care-note-card {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(100, 116, 139, 0.4);
  backdrop-filter: blur(20px);
}

[data-theme="dark"] .care-note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(139, 92, 246, 0.6);
}

[data-theme="dark"] .note-title {
  color: #f1f5f9;
}

[data-theme="dark"] .note-preview {
  color: #94a3b8;
}

[data-theme="dark"] .metadata-label,
[data-theme="dark"] .metadata-value {
  color: #94a3b8;
}

/* Dark Theme - Badges */
[data-theme="dark"] .note-type-badge,
[data-theme="dark"] .note-priority-badge {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .flag-badge.private {
  background: rgba(251, 191, 36, 0.9);
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

[data-theme="dark"] .flag-badge.confidential {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

[data-theme="dark"] .flag-badge.follow-up {
  background: rgba(249, 115, 22, 0.9);
  color: white;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

/* Dark Theme - Action Buttons */
[data-theme="dark"] .note-actions .btn {
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .btn-outline-primary {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

[data-theme="dark"] .btn-outline-primary:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.6);
  color: #93c5fd;
}

[data-theme="dark"] .btn-outline-danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

[data-theme="dark"] .btn-outline-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.6);
  color: #fca5a5;
}

/* Dark Theme - List View */
[data-theme="dark"] .care-notes-list {
  color: #f1f5f9;
}

[data-theme="dark"] .list-header {
  background: rgba(30, 41, 59, 0.8);
  border-bottom: 1px solid rgba(100, 116, 139, 0.4);
}

[data-theme="dark"] .header-cell {
  color: #e2e8f0;
  font-weight: 600;
}

[data-theme="dark"] .list-row {
  background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .list-row:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .list-cell {
  color: #cbd5e1;
}

[data-theme="dark"] .cell-main {
  color: #f1f5f9;
}

[data-theme="dark"] .cell-sub {
  color: #94a3b8;
}

[data-theme="dark"] .action-btn {
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .edit-btn {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

[data-theme="dark"] .edit-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.6);
  color: #93c5fd;
}

[data-theme="dark"] .delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

[data-theme="dark"] .delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.6);
  color: #fca5a5;
}

/* Dark Theme - Pagination */
[data-theme="dark"] .pagination-container {
  border-top: 1px solid rgba(75, 85, 99, 0.3);
}

[data-theme="dark"] .page-link {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(100, 116, 139, 0.4);
  color: #94a3b8;
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .page-link:hover {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(139, 92, 246, 0.6);
  color: #8b5cf6;
}

[data-theme="dark"] .page-item.active .page-link {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

[data-theme="dark"] .page-item.disabled .page-link {
  background: rgba(17, 24, 39, 0.5);
  border-color: rgba(75, 85, 99, 0.2);
  color: #64748b;
}

/* Grid View */
.care-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  padding: 1.25rem;
}

@media (max-width: 768px) {
  .care-notes-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
}

/* Buttons */
.btn {
  background: #667eea;
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
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-shift {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
}

.btn-shift:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-outline-elegant {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
}

.btn-outline-elegant:hover {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.care-note-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.6);
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

/* Dark Theme - Modals */
[data-theme="dark"] .modal-content {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%);
  border: 1px solid rgba(100, 116, 139, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
}

[data-theme="dark"] .modal-header {
  border-bottom: 1px solid rgba(100, 116, 139, 0.3);
}

[data-theme="dark"] .modal-title {
  color: #f1f5f9;
}

[data-theme="dark"] .btn-close {
  filter: invert(1);
  opacity: 0.7;
}

[data-theme="dark"] .btn-close:hover {
  opacity: 1;
}

[data-theme="dark"] .modal-footer {
  border-top: 1px solid rgba(100, 116, 139, 0.3);
}

/* Dark Theme - Form Elements */
[data-theme="dark"] .form-label {
  color: #e2e8f0;
  font-weight: 500;
}

[data-theme="dark"] .form-control,
[data-theme="dark"] .form-select {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.4);
  color: #f1f5f9;
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .form-control:focus,
[data-theme="dark"] .form-select:focus {
  background: rgba(30, 41, 59, 0.95);
  border-color: #8b5cf6;
  box-shadow: 0 0 0 0.2rem rgba(139, 92, 246, 0.25);
  color: #f1f5f9;
}

[data-theme="dark"] .form-control::placeholder {
  color: #94a3b8;
}

[data-theme="dark"] .form-text {
  color: #94a3b8;
}

[data-theme="dark"] .form-check-input {
  background-color: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.4);
}

[data-theme="dark"] .form-check-input:checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

[data-theme="dark"] .form-check-input:focus {
  border-color: #8b5cf6;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(139, 92, 246, 0.25);
}

[data-theme="dark"] .form-check-label {
  color: #e2e8f0;
}

/* Dark Theme - Follow-up Section */
[data-theme="dark"] .follow-up-section {
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(75, 85, 99, 0.4);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .follow-up-section h6 {
  color: #e2e8f0;
}

/* Dark Theme - Details */
[data-theme="dark"] .details-header {
  border-bottom: 1px solid rgba(100, 116, 139, 0.3);
}

[data-theme="dark"] .details-header h4 {
  color: #f1f5f9;
}

[data-theme="dark"] .details-content h6,
[data-theme="dark"] .details-followup h6 {
  color: #e2e8f0;
}

[data-theme="dark"] .note-content-display,
[data-theme="dark"] .follow-up-notes {
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(75, 85, 99, 0.4);
  color: #e2e8f0;
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .metadata-item label {
  color: #94a3b8;
}

[data-theme="dark"] .metadata-item span {
  color: #f1f5f9;
}

[data-theme="dark"] .details-tags label {
  color: #94a3b8;
}

[data-theme="dark"] .tag-badge {
  background: #8b5cf6;
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

[data-theme="dark"] .details-timestamps {
  border-top: 1px solid rgba(100, 116, 139, 0.3);
}

[data-theme="dark"] .text-muted {
  color: #94a3b8 !important;
}

/* Dark Theme - Buttons */
[data-theme="dark"] .btn-shift {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
}

[data-theme="dark"] .btn-shift:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
  box-shadow: 0 8px 28px rgba(139, 92, 246, 0.5);
}

[data-theme="dark"] .btn-outline-elegant {
  background: rgba(55, 65, 81, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.5);
  color: #94a3b8;
}

[data-theme="dark"] .btn-outline-elegant:hover {
  background: rgba(55, 65, 81, 0.7);
  border-color: rgba(75, 85, 99, 0.7);
  color: #d1d5db;
  transform: translateY(-1px);
}

[data-theme="dark"] .btn-primary {
  background: #8b5cf6;
  border-color: #8b5cf6;
}

[data-theme="dark"] .btn-primary:hover {
  background: #7c3aed;
  border-color: #7c3aed;
}

[data-theme="dark"] .btn-secondary {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(75, 85, 99, 0.6);
  color: #d1d5db;
}

[data-theme="dark"] .btn-secondary:hover {
  background: rgba(55, 65, 81, 1);
  border-color: rgba(75, 85, 99, 0.8);
  color: #f3f4f6;
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
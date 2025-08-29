<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Shift Scheduling</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Schedule New Shift
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ shifts.length }}</div>
          <div class="stat-label">Total Shifts</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ todayShifts }}</div>
          <div class="stat-label">Today's Shifts</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ upcomingShifts }}</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ urgentShifts }}</div>
          <div class="stat-label">Needs Attention</div>
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
          placeholder="Search shifts..."
          @input="filterShifts"
        />
      </div>
      <div class="filter-controls">
        <select v-model="statusFilter" @change="filterShifts">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="dateFilter" @change="filterShifts">
          <option value="">All Dates</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="this_week">This Week</option>
          <option value="next_week">Next Week</option>
        </select>
        <input 
          v-model="participantFilter" 
          type="text" 
          placeholder="Filter by participant..."
          @input="filterShifts"
        />
      </div>
    </div>

    <!-- Calendar View Toggle -->
    <div class="view-toggle">
      <button 
        @click="currentView = 'list'" 
        :class="['view-btn', { active: currentView === 'list' }]"
      >
        <i class="fas fa-list"></i>
        List View
      </button>
      <button 
        @click="currentView = 'calendar'" 
        :class="['view-btn', { active: currentView === 'calendar' }]"
      >
        <i class="fas fa-calendar"></i>
        Calendar View
      </button>
    </div>

    <!-- Shifts List/Calendar -->
    <div class="content-card">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading shifts...</p>
      </div>

      <div v-else-if="filteredShifts.length === 0 && !searchQuery" class="empty-state">
        <i class="fas fa-calendar-alt"></i>
        <h3>No Shifts Scheduled</h3>
        <p>Get started by scheduling your first shift</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Schedule First Shift
        </button>
      </div>

      <div v-else-if="filteredShifts.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <!-- List View -->
      <div v-else-if="currentView === 'list'" class="shifts-grid">
        <div v-for="shift in filteredShifts" :key="shift.id" :class="['shift-card', `shift-${shift.status}`]">
          <!-- Debug info (remove in production) -->
          <div class="shift-header">
            <div class="shift-time">
              <div class="time-main">{{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }}</div>
              <div class="time-date">{{ formatDate(shift.start_time) }}</div>
            </div>
            <div class="shift-status">
              <span :class="['status-badge', shift.status]">
                {{ formatStatus(shift.status) }}
              </span>
            </div>
          </div>
          
          <div class="shift-details">
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-user"></i>
                <span><strong>Participant:</strong> {{ getParticipantName(shift.participant_id) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-user-nurse"></i>
                <span><strong>Staff:</strong> {{ getStaffName(shift.staff_id) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-heart"></i>
                <span><strong>Service:</strong> {{ shift.service_type }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>Location:</strong> {{ shift.location }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span><strong>Duration:</strong> {{ calculateDuration(shift.start_time, shift.end_time) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-dollar-sign"></i>
                <span><strong>Rate:</strong> ${{ shift.hourly_rate }}/hr</span>
              </div>
            </div>
            <div v-if="shift.notes" class="detail-item notes">
              <i class="fas fa-sticky-note"></i>
              <span><strong>Notes:</strong> {{ shift.notes }}</span>
            </div>
          </div>

          <div class="shift-actions">
            <button @click="viewShift(shift)" class="btn-small btn-view">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button 
              v-if="shift.status === 'scheduled'" 
              @click="startShift(shift)" 
              class="btn-small btn-start"
              :disabled="isSubmitting"
            >
              <i class="fas fa-play"></i>
              Start Shift
            </button>
            <button 
              v-if="shift.status === 'in_progress'" 
              @click="completeShift(shift)" 
              class="btn-small btn-complete"
              :disabled="isSubmitting"
            >
              <i class="fas fa-check-circle"></i>
              Complete Shift
            </button>
            <button @click="editShift(shift)" class="btn-small btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="cancelShift(shift)" class="btn-small btn-cancel">
              <i class="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else class="calendar-view">
        <div class="calendar-header">
          <button @click="previousMonth" class="calendar-nav-btn">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3>{{ formatMonthYear(currentDate) }}</h3>
          <button @click="nextMonth" class="calendar-nav-btn">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="calendar-grid">
          <!-- Day headers -->
          <div class="calendar-header-day" v-for="day in dayHeaders" :key="day">
            {{ day }}
          </div>
          
          <!-- Calendar days -->
          <div 
            v-for="day in calendarDays" 
            :key="day.date" 
            :class="['calendar-day', {
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'has-shifts': day.shifts.length > 0
            }]"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
            <div v-if="day.shifts.length > 0" class="day-shifts">
              <div 
                v-for="shift in day.shifts.slice(0, 2)" 
                :key="shift.id" 
                :class="['shift-indicator', shift.status]"
                @click="viewShift(shift)"
                :title="`${getParticipantName(shift.participant_id)} - ${shift.service_type}`"
              >
                {{ formatTime(shift.start_time) }}
              </div>
              <div v-if="day.shifts.length > 2" class="more-shifts">
                +{{ day.shifts.length - 2 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Shift Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Schedule New Shift</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addShift">
            <div class="form-row">
              <div class="form-group">
                <label>Participant *</label>
                <select v-model="newShift.participant_id" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Staff Member *</label>
                <select v-model="newShift.staff_id" required>
                  <option value="">Select Staff</option>
                  <option v-for="staff in staffMembers" :key="staff.id" :value="staff.id">
                    {{ staff.first_name }} {{ staff.last_name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input v-model="newShift.date" type="date" required />
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select v-model="newShift.service_type" required>
                  <option value="">Select Service</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Community Access">Community Access</option>
                  <option value="Domestic Assistance">Domestic Assistance</option>
                  <option value="Social Support">Social Support</option>
                  <option value="Transport">Transport</option>
                  <option value="Nursing Care">Nursing Care</option>
                  <option value="Therapy Support">Therapy Support</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Time *</label>
                <input v-model="newShift.start_time" type="time" required @change="calculateEndTimeFromDuration" />
              </div>
              <div class="form-group">
                <label>Duration (hours)</label>
                <input 
                  v-model="newShift.duration_hours" 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24" 
                  placeholder="4.0" 
                  @input="calculateEndTimeFromDuration"
                />
                <small>Auto-calculates end time</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>End Time *</label>
                <input v-model="newShift.end_time" type="time" required @change="calculateDurationFromTimes" />
                <small>Or set manually to override duration</small>
              </div>
              <div class="form-group"></div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Hourly Rate ($) *</label>
                <input v-model="newShift.hourly_rate" type="number" step="0.01" min="0" required placeholder="45.00" />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <select v-model="newShift.location" required>
                  <option value="">Select Location</option>
                  <option value="Participant's Home">Participant's Home</option>
                  <option value="Community">Community</option>
                  <option value="Office">Office</option>
                  <option value="Medical Facility">Medical Facility</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea 
                v-model="newShift.notes" 
                rows="3" 
                placeholder="Any special instructions or notes for this shift..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>
                <input v-model="newShift.send_notifications" type="checkbox" />
                Send notification to participant and staff
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-schedule" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Scheduling...
                </span>
                <span v-else>
                  <i class="fas fa-calendar-plus"></i>
                  Schedule Shift
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Shift Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Shift</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateEditedShift">
            <div class="form-row">
              <div class="form-group">
                <label>Participant *</label>
                <select v-model="newShift.participant_id" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Staff Member *</label>
                <select v-model="newShift.staff_id" required>
                  <option value="">Select Staff</option>
                  <option v-for="staff in staffMembers" :key="staff.id" :value="staff.id">
                    {{ staff.first_name }} {{ staff.last_name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input v-model="newShift.date" type="date" required />
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select v-model="newShift.service_type" required>
                  <option value="">Select Service</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Community Access">Community Access</option>
                  <option value="Domestic Assistance">Domestic Assistance</option>
                  <option value="Social Support">Social Support</option>
                  <option value="Transport">Transport</option>
                  <option value="Nursing Care">Nursing Care</option>
                  <option value="Therapy Support">Therapy Support</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Time *</label>
                <input v-model="newShift.start_time" type="time" required @change="calculateEndTimeFromDuration" />
              </div>
              <div class="form-group">
                <label>Duration (hours)</label>
                <input 
                  v-model="newShift.duration_hours" 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24" 
                  placeholder="4.0" 
                  @input="calculateEndTimeFromDuration"
                />
                <small>Auto-calculates end time</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>End Time *</label>
                <input v-model="newShift.end_time" type="time" required @change="calculateDurationFromTimes" />
                <small>Or set manually to override duration</small>
              </div>
              <div class="form-group"></div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Hourly Rate ($) *</label>
                <input v-model="newShift.hourly_rate" type="number" step="0.01" min="0" required placeholder="45.00" />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <select v-model="newShift.location" required>
                  <option value="">Select Location</option>
                  <option value="Participant's Home">Participant's Home</option>
                  <option value="Community">Community</option>
                  <option value="Office">Office</option>
                  <option value="Medical Facility">Medical Facility</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea 
                v-model="newShift.notes" 
                rows="3" 
                placeholder="Any special instructions or notes for this shift..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-edit" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Updating...
                </span>
                <span v-else>
                  <i class="fas fa-save"></i>
                  Update Shift
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Shift Modal -->
    <div v-if="showViewModal && selectedShift" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h3>Shift Details</h3>
          <button @click="closeViewModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="shift-detail-grid">
            <div class="detail-section">
              <h4><i class="fas fa-calendar-alt"></i> Service Information</h4>
              <div class="detail-item">
                <span class="label">Service Type:</span>
                <span class="value">{{ selectedShift.service_type }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['status-badge', selectedShift.status]">{{ formatStatus(selectedShift.status) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Location:</span>
                <span class="value">{{ selectedShift.location }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-users"></i> People</h4>
              <div class="detail-item">
                <span class="label">Participant:</span>
                <span class="value">{{ getParticipantName(selectedShift.participant_id) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Staff Member:</span>
                <span class="value">{{ getStaffName(selectedShift.staff_id) }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-clock"></i> Schedule</h4>
              <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value">{{ formatDate(selectedShift.start_time) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Time:</span>
                <span class="value">{{ formatTime(selectedShift.start_time) }} - {{ formatTime(selectedShift.end_time) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Duration:</span>
                <span class="value">{{ calculateDuration(selectedShift.start_time, selectedShift.end_time) }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-dollar-sign"></i> Payment</h4>
              <div class="detail-item">
                <span class="label">Hourly Rate:</span>
                <span class="value">${{ selectedShift.hourly_rate }}/hr</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Cost:</span>
                <span class="value total-cost">${{ (parseFloat(calculateDuration(selectedShift.start_time, selectedShift.end_time)) * selectedShift.hourly_rate).toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="selectedShift.notes" class="detail-section full-width">
              <h4><i class="fas fa-sticky-note"></i> Notes</h4>
              <div class="notes-content">
                {{ selectedShift.notes }}
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeViewModal" class="btn btn-view">Close</button>
            <button @click="editShift(selectedShift); closeViewModal()" class="btn btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button 
              v-if="selectedShift.status === 'scheduled'" 
              @click="startShift(selectedShift); closeViewModal()" 
              class="btn btn-success"
            >
              <i class="fas fa-play"></i>
              Start Shift
            </button>
            <button 
              v-if="selectedShift.status === 'in_progress'" 
              @click="completeShift(selectedShift); closeViewModal()" 
              class="btn btn-success"
            >
              <i class="fas fa-check"></i>
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete/Cancel Confirmation Modal -->
    <div v-if="showDeleteModal && shiftToDelete" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Cancel Shift</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="delete-confirmation">
            <div class="delete-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Are you sure you want to cancel this shift?</h4>
            <div class="shift-summary">
              <p><strong>Participant:</strong> {{ getParticipantName(shiftToDelete.participant_id) }}</p>
              <p><strong>Staff:</strong> {{ getStaffName(shiftToDelete.staff_id) }}</p>
              <p><strong>Date:</strong> {{ formatDate(shiftToDelete.start_time) }}</p>
              <p><strong>Time:</strong> {{ formatTime(shiftToDelete.start_time) }} - {{ formatTime(shiftToDelete.end_time) }}</p>
              <p><strong>Service:</strong> {{ shiftToDelete.service_type }}</p>
            </div>
            <p class="warning-text">
              <i class="fas fa-info-circle"></i>
              This action cannot be undone. The shift will be marked as cancelled.
            </p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn btn-view">
            <i class="fas fa-times"></i>
            Keep Shift
          </button>
          <button @click="confirmCancelShift" class="btn btn-delete" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              Cancelling...
            </span>
            <span v-else>
              <i class="fas fa-ban"></i>
              Cancel Shift
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Start Shift Modal -->
    <div v-if="showStartModal && shiftToStart" class="modal-overlay" @click="closeStartModal">
      <div class="modal-content start-modal" @click.stop>
        <div class="modal-header">
          <h3>Start Shift</h3>
          <button @click="closeStartModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="shift-start-info">
            <div class="start-icon">
              <i class="fas fa-play-circle"></i>
            </div>
            <h4>Ready to start this shift?</h4>
            <div class="shift-summary">
              <p><strong>Participant:</strong> {{ getParticipantName(shiftToStart.participant_id) }}</p>
              <p><strong>Staff:</strong> {{ getStaffName(shiftToStart.staff_id) }}</p>
              <p><strong>Time:</strong> {{ formatTime(shiftToStart.start_time) }} - {{ formatTime(shiftToStart.end_time) }}</p>
              <p><strong>Service:</strong> {{ shiftToStart.service_type }}</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeStartModal" class="btn btn-view">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmStartShift" class="btn btn-start" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              Starting...
            </span>
            <span v-else>
              <i class="fas fa-play"></i>
              Start Shift
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Complete Shift Modal -->
    <div v-if="showCompleteModal && shiftToComplete" class="modal-overlay" @click="closeCompleteModal">
      <div class="modal-content complete-modal" @click.stop>
        <div class="modal-header">
          <h3>Complete Shift</h3>
          <button @click="closeCompleteModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="shift-complete-info">
            <div class="complete-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h4>Complete this shift?</h4>
            <div class="shift-summary">
              <p><strong>Participant:</strong> {{ getParticipantName(shiftToComplete.participant_id) }}</p>
              <p><strong>Staff:</strong> {{ getStaffName(shiftToComplete.staff_id) }}</p>
              <p><strong>Time:</strong> {{ formatTime(shiftToComplete.start_time) }} - {{ formatTime(shiftToComplete.end_time) }}</p>
              <p><strong>Service:</strong> {{ shiftToComplete.service_type }}</p>
            </div>
            
            <div class="form-group">
              <label for="completion-notes">Completion Notes (Optional)</label>
              <textarea 
                id="completion-notes"
                v-model="completionNotes"
                rows="3"
                placeholder="Add any notes about the completed shift..."
                class="form-textarea"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeCompleteModal" class="btn btn-view">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button @click="confirmCompleteShift" class="btn btn-complete" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              Completing...
            </span>
            <span v-else>
              <i class="fas fa-check-circle"></i>
              Complete Shift
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useShiftsStore } from '../stores/shifts'
import { useParticipantsStore } from '../stores/participants'
import { useUsersStore } from '../stores/users'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'Scheduling',
  data() {
    return {
      filteredShifts: [],
      searchQuery: '',
      statusFilter: '',
      dateFilter: '',
      participantFilter: '',
      currentView: 'list',
      showAddModal: false,
      showEditModal: false,
      showViewModal: false,
      showDeleteModal: false,
      showStartModal: false,
      showCompleteModal: false,
      editingShift: null,
      selectedShift: null,
      shiftToDelete: null,
      shiftToStart: null,
      shiftToComplete: null,
      completionNotes: '',
      isSubmitting: false,
      currentDate: new Date(),
      dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      newShift: {
        participant_id: '',
        staff_id: '',
        date: '',
        start_time: '',
        end_time: '',
        duration_hours: 4.0,
        service_type: '',
        location: '',
        hourly_rate: 45.00,
        notes: '',
        send_notifications: true
      }
    }
  },
  computed: {
    ...mapState(useShiftsStore, ['shifts', 'isLoading', 'error']),
    ...mapState(useParticipantsStore, { allParticipants: 'participants' }),
    ...mapState(useUsersStore, { allStaffMembers: 'users' }),
    
    // Filter only active participants and staff
    participants() {
      return this.allParticipants.filter(p => p.is_active !== false)
    },
    
    staffMembers() {
      return this.allStaffMembers.filter(s => s.is_active !== false)
    },
    
    todayShifts() {
      const today = new Date().toDateString()
      return this.shifts.filter(shift => 
        new Date(shift.start_time).toDateString() === today
      ).length
    },
    upcomingShifts() {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return this.shifts.filter(shift => {
        const shiftDate = new Date(shift.start_time)
        return shiftDate >= now && shiftDate <= nextWeek
      }).length
    },
    urgentShifts() {
      return this.shifts.filter(shift => 
        shift.status === 'scheduled' && 
        new Date(shift.start_time) < new Date(Date.now() + 24 * 60 * 60 * 1000)
      ).length
    },

    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      // Get first day of the month
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // Get first day of calendar (might be from previous month)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      // Get last day of calendar (might be from next month)
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
      
      const days = []
      const today = new Date()
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayShifts = this.shifts.filter(shift => {
          const shiftDate = new Date(shift.start_time)
          return shiftDate.toDateString() === date.toDateString()
        })
        
        days.push({
          date: new Date(date).toISOString(),
          dayNumber: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          shifts: dayShifts
        })
      }
      
      return days
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    ...mapActions(useShiftsStore, ['fetchShifts', 'createShift', 'updateShift', 'deleteShift']),
    ...mapActions(useParticipantsStore, ['fetchParticipants']),
    ...mapActions(useUsersStore, ['fetchUsers']),
    
    async loadData() {
      this.isLoading = true
      try {
        console.log('Loading scheduling data...')
        
        const [shiftsResult, participantsResult, usersResult] = await Promise.allSettled([
          this.fetchShifts(),
          this.fetchParticipants(),
          this.fetchUsers()
        ])
        
        // Check individual results
        if (shiftsResult.status === 'rejected') {
          console.error('Failed to load shifts:', shiftsResult.reason)
        } else {
          console.log('Loaded shifts:', this.shifts.length)
        }
        
        if (participantsResult.status === 'rejected') {
          console.error('Failed to load participants:', participantsResult.reason)
          showErrorNotification(new Error('Failed to load participants. Shift creation will not work properly.'))
        } else {
          console.log('Loaded participants:', this.participants.length)
        }
        
        if (usersResult.status === 'rejected') {
          console.error('Failed to load users/staff:', usersResult.reason)
          showErrorNotification(new Error('Failed to load staff members. Shift creation will not work properly.'))
        } else {
          console.log('Loaded staff members:', this.staffMembers.length)
        }
        
        this.filterShifts()
      } catch (error) {
        console.error('Error loading data:', error)
        showErrorNotification(error, 'Failed to load data. Please refresh the page.')
      } finally {
        this.isLoading = false
      }
    },

    filterShifts() {
      let filtered = [...this.shifts]
      
      // Search functionality
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(shift => {
          const participant = this.participants.find(p => p.id === shift.participant_id)
          const staff = this.staffMembers.find(s => s.id === shift.staff_id)
          const participantName = participant ? `${participant.first_name} ${participant.last_name}`.toLowerCase() : ''
          const staffName = staff ? `${staff.first_name} ${staff.last_name}`.toLowerCase() : ''
          
          return participantName.includes(query) ||
                 staffName.includes(query) ||
                 (shift.service_type && shift.service_type.toLowerCase().includes(query)) ||
                 (shift.location && shift.location.toLowerCase().includes(query)) ||
                 (shift.notes && shift.notes.toLowerCase().includes(query))
        })
      }
      
      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(shift => shift.status === this.statusFilter)
      }

      // Participant filter
      if (this.participantFilter && this.participantFilter.trim()) {
        const query = this.participantFilter.toLowerCase().trim()
        filtered = filtered.filter(shift => {
          const participant = this.participants.find(p => p.id === shift.participant_id)
          const participantName = participant ? `${participant.first_name} ${participant.last_name}`.toLowerCase() : ''
          return participantName.includes(query)
        })
      }
      
      // Date filter
      if (this.dateFilter) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        filtered = filtered.filter(shift => {
          const shiftDate = new Date(shift.start_time)
          const shiftDay = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate())
          
          switch (this.dateFilter) {
            case 'today':
              return shiftDay.getTime() === today.getTime()
            case 'tomorrow':
              return shiftDay.getTime() === tomorrow.getTime()
            case 'this_week':
              return shiftDate >= today && shiftDate < nextWeek
            case 'next_week':
              return shiftDate >= nextWeek && shiftDate < new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
            default:
              return true
          }
        })
      }
      
      // Sort by start time (ascending)
      filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      
      this.filteredShifts = filtered
    },

    async addShift() {
      if (!this.validateShiftForm()) {
        return
      }

      this.isSubmitting = true
      try {
        // Create datetime strings in ISO format with timezone - backend expects timezone format
        const startDateTime = `${this.newShift.date}T${this.newShift.start_time}:00+00:00`
        const endDateTime = `${this.newShift.date}T${this.newShift.end_time}:00+00:00`
        
        // Validate IDs - they should be UUID strings, don't convert to numbers
        const participantId = this.newShift.participant_id
        const staffId = this.newShift.staff_id
        
        // Validate UUIDs (they should be strings)
        if (!participantId || typeof participantId !== 'string' || participantId.trim() === '') {
          console.error('Invalid participant ID:', this.newShift.participant_id)
          throw new Error('Invalid participant selected. Please select a valid participant.')
        }
        if (!staffId || typeof staffId !== 'string' || staffId.trim() === '') {
          console.error('Invalid staff ID:', this.newShift.staff_id)
          throw new Error('Invalid staff member selected. Please select a valid staff member.')
        }
        
        // ID format validation - allow both UUIDs and custom formats like 'user_admin'
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        // Custom format: any string that's not empty and doesn't contain special characters
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        const customIdRegex = /^[a-zA-Z0-9_-]+$/
        
        if (!uuidRegex.test(participantId) && !customIdRegex.test(participantId)) {
          console.error('Invalid participant ID format:', participantId)
          throw new Error('Invalid participant ID format. Please refresh and try again.')
        }
        if (!uuidRegex.test(staffId) && !customIdRegex.test(staffId)) {
          console.error('Invalid staff ID format:', staffId)
          throw new Error('Invalid staff ID format. Please refresh and try again.')
        }
        
        const hourlyRate = parseFloat(this.newShift.hourly_rate)
        if (isNaN(hourlyRate) || hourlyRate <= 0) {
          throw new Error('Invalid hourly rate')
        }
        
        const shiftData = {
          participant_id: participantId,
          staff_id: staffId,
          start_time: startDateTime,
          end_time: endDateTime,
          service_type: this.newShift.service_type.trim(),
          location: this.newShift.location.trim(),
          status: 'scheduled',
          hourly_rate: hourlyRate,
          notes: (this.newShift.notes || '').trim()
        }
        
        console.log('Creating shift with data:', shiftData)
        console.log('Participants available:', this.participants.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` })))
        console.log('Staff available:', this.staffMembers.map(s => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })))
        
        const result = await this.createShift(shiftData)
        console.log('Shift creation result:', result)
        
        // Reload the shifts data to ensure UI is updated
        await this.fetchShifts()
        this.filterShifts()
        // Force Vue to re-render the component
        this.$forceUpdate()
        this.closeModal()
        showSuccessNotification('Shift scheduled successfully!')
        
      } catch (error) {
        console.error('Error scheduling shift:', error)
        console.error('Error response:', error.response)
        console.error('Error status:', error.response?.status)
        console.error('Error data:', error.response?.data)
        
        // More specific error messages based on status
        if (error.response?.status === 404) {
          if (error.response.config?.url?.includes('participants')) {
            showErrorNotification(error, 'Participant not found. Please refresh the page and try again.')
          } else if (error.response.config?.url?.includes('users')) {
            showErrorNotification(error, 'Staff member not found. Please refresh the page and try again.')  
          } else {
            showErrorNotification(error, 'Resource not found (404). Please check your selection and try again.')
          }
        } else {
          showErrorNotification(error, 'Error scheduling shift. Please try again.')
        }
      } finally {
        this.isSubmitting = false
      }
    },

    validateShiftForm() {
      console.log('Validating shift form...')
      console.log('Form data:', this.newShift)
      console.log('Selected participant_id:', this.newShift.participant_id, 'type:', typeof this.newShift.participant_id)
      console.log('Selected staff_id:', this.newShift.staff_id, 'type:', typeof this.newShift.staff_id)
      
      // Check if data is loaded
      if (!this.participants || this.participants.length === 0) {
        showErrorNotification(new Error('No participants available. Please ensure participants are loaded.'))
        return false
      }
      if (!this.staffMembers || this.staffMembers.length === 0) {
        showErrorNotification(new Error('No staff members available. Please ensure staff data is loaded.'))
        return false
      }
      
      if (!this.newShift.participant_id || this.newShift.participant_id === '') {
        showErrorNotification(new Error('Please select a participant'))
        return false
      }
      if (!this.newShift.staff_id || this.newShift.staff_id === '') {
        showErrorNotification(new Error('Please select a staff member'))
        return false
      }
      
      // Validate that selected IDs exist in the loaded data
      const selectedParticipant = this.participants.find(p => p.id == this.newShift.participant_id)
      if (!selectedParticipant) {
        showErrorNotification(new Error('Selected participant not found. Please refresh the page and try again.'))
        return false
      }
      
      const selectedStaff = this.staffMembers.find(s => s.id == this.newShift.staff_id)
      if (!selectedStaff) {
        showErrorNotification(new Error('Selected staff member not found. Please refresh the page and try again.'))
        return false
      }
      if (!this.newShift.date) {
        showErrorNotification(new Error('Please select a date'))
        return false
      }
      if (!this.newShift.start_time) {
        showErrorNotification(new Error('Please select a start time'))
        return false
      }
      if (!this.newShift.end_time) {
        showErrorNotification(new Error('Please select an end time'))
        return false
      }
      if (this.newShift.start_time >= this.newShift.end_time) {
        showErrorNotification(new Error('End time must be after start time'))
        return false
      }
      if (!this.newShift.service_type) {
        showErrorNotification(new Error('Please select a service type'))
        return false
      }
      if (!this.newShift.location) {
        showErrorNotification(new Error('Please select a location'))
        return false
      }
      if (!this.newShift.hourly_rate || parseFloat(this.newShift.hourly_rate) <= 0) {
        showErrorNotification(new Error('Please enter a valid hourly rate'))
        return false
      }
      return true
    },

    viewShift(shift) {
      this.selectedShift = shift
      this.showViewModal = true
    },

    closeViewModal() {
      this.showViewModal = false
      this.selectedShift = null
    },

    async startShift(shift) {
      this.shiftToStart = shift
      this.showStartModal = true
    },

    async confirmStartShift() {
      if (!this.shiftToStart) return
      
      this.isSubmitting = true
      try {
        console.log('🚀 Starting shift process for:', this.shiftToStart.id)
        console.log('📊 Current shift status before:', this.shiftToStart.status)
        
        // Optimistically update the UI first
        const shiftIndex = this.shifts.findIndex(s => s.id === this.shiftToStart.id)
        console.log('📍 Found shift at index:', shiftIndex)
        
        if (shiftIndex !== -1) {
          console.log('⚡ Updating shift status optimistically...')
          
          // Create a completely new shift object to force reactivity
          const updatedShift = {
            ...this.shifts[shiftIndex],
            status: 'in_progress',
            actual_start_time: new Date().toISOString()
          }
          
          // Replace the entire array to force Vue to detect changes
          const newShifts = [...this.shifts]
          newShifts[shiftIndex] = updatedShift
          this.shifts = newShifts
          
          console.log('✅ Local update done. New status:', this.shifts[shiftIndex].status)
          console.log('🔍 Updated shift object:', this.shifts[shiftIndex])
        }
        
        // Force immediate UI update
        this.filterShifts()
        this.$nextTick(() => {
          this.$forceUpdate()
        })
        
        const updateData = {
          status: 'in_progress',
          actual_start_time: new Date().toISOString()
        }
        
        console.log('🌐 Sending API update:', updateData)
        const result = await this.updateShift(this.shiftToStart.id, updateData)
        console.log('✅ API update successful:', result)
        
        // Refresh from server to ensure consistency
        console.log('🔄 Refreshing data from server...')
        await this.fetchShifts()
        this.filterShifts()
        
        // Check if the shift status is correct after refresh
        const updatedShift = this.shifts.find(s => s.id === this.shiftToStart.id)
        console.log('📊 Final shift status after refresh:', updatedShift?.status)
        
        this.closeStartModal()
        showSuccessNotification('Shift started successfully!')
      } catch (error) {
        console.error('❌ Error starting shift:', error)
        // Revert optimistic update on error
        await this.fetchShifts()
        this.filterShifts()
        showErrorNotification(error, 'Error starting shift. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    async completeShift(shift) {
      this.shiftToComplete = shift
      this.completionNotes = ''
      this.showCompleteModal = true
    },

    async confirmCompleteShift() {
      if (!this.shiftToComplete) return
      
      this.isSubmitting = true
      try {
        // Optimistically update the UI first
        const shiftIndex = this.shifts.findIndex(s => s.id === this.shiftToComplete.id)
        if (shiftIndex !== -1) {
          this.shifts[shiftIndex].status = 'completed'
          this.shifts[shiftIndex].actual_end_time = new Date().toISOString()
          if (this.completionNotes && this.completionNotes.trim()) {
            this.shifts[shiftIndex].completion_notes = this.completionNotes.trim()
          }
          
          // Also update filteredShifts if they exist
          const filteredIndex = this.filteredShifts.findIndex(s => s.id === this.shiftToComplete.id)
          if (filteredIndex !== -1) {
            this.filteredShifts[filteredIndex].status = 'completed'
            this.filteredShifts[filteredIndex].actual_end_time = new Date().toISOString()
            if (this.completionNotes && this.completionNotes.trim()) {
              this.filteredShifts[filteredIndex].completion_notes = this.completionNotes.trim()
            }
          }
        }
        
        // Force immediate UI update
        this.filterShifts()
        this.$forceUpdate()
        
        const updateData = {
          status: 'completed',
          actual_end_time: new Date().toISOString()
        }
        if (this.completionNotes && this.completionNotes.trim()) {
          updateData.completion_notes = this.completionNotes.trim()
        }
        
        console.log('Completing shift with data:', updateData)
        await this.updateShift(this.shiftToComplete.id, updateData)
        
        // Refresh from server to ensure consistency
        await this.fetchShifts()
        this.filterShifts()
        this.closeCompleteModal()
        showSuccessNotification('Shift completed successfully!')
      } catch (error) {
        console.error('Error completing shift:', error)
        // Revert optimistic update on error
        await this.fetchShifts()
        this.filterShifts()
        showErrorNotification(error, 'Error completing shift. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    editShift(shift) {
      // Pre-populate the form with existing shift data
      const shiftDate = new Date(shift.start_time)
      const startTime = shiftDate.toTimeString().slice(0, 5)
      const endDate = new Date(shift.end_time)
      const endTime = endDate.toTimeString().slice(0, 5)
      
      this.editingShift = { ...shift }
      console.log('Editing shift data:', shift)
      console.log('Original participant_id:', shift.participant_id, 'type:', typeof shift.participant_id)
      console.log('Original staff_id:', shift.staff_id, 'type:', typeof shift.staff_id)
      
      // Calculate duration from existing times
      const startMs = shiftDate.getTime()
      const endMs = endDate.getTime()
      const durationHours = parseFloat(((endMs - startMs) / (1000 * 60 * 60)).toFixed(1))

      this.newShift = {
        participant_id: shift.participant_id ? shift.participant_id.toString() : '',
        staff_id: shift.staff_id ? shift.staff_id.toString() : '',
        date: shiftDate.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        duration_hours: durationHours,
        service_type: shift.service_type,
        location: shift.location,
        hourly_rate: shift.hourly_rate,
        notes: shift.notes || '',
        send_notifications: false
      }
      this.showEditModal = true
    },

    async updateEditedShift() {
      if (!this.validateShiftForm()) {
        return
      }

      this.isSubmitting = true
      try {
        // Validate the shift data before sending - backend expects timezone format
        // Ensure time format includes seconds
        const startTime = this.newShift.start_time.includes(':') ? 
          (this.newShift.start_time.split(':').length === 2 ? this.newShift.start_time + ':00' : this.newShift.start_time) : 
          this.newShift.start_time + ':00:00'
        const endTime = this.newShift.end_time.includes(':') ? 
          (this.newShift.end_time.split(':').length === 2 ? this.newShift.end_time + ':00' : this.newShift.end_time) : 
          this.newShift.end_time + ':00:00'
          
        const startDateTime = `${this.newShift.date}T${startTime}Z`
        const endDateTime = `${this.newShift.date}T${endTime}Z`
        
        console.log('Formatted start_time:', startDateTime)
        console.log('Formatted end_time:', endDateTime)
        
        // Validate IDs - they should be UUID strings, don't convert to numbers
        const participantId = this.newShift.participant_id
        const staffId = this.newShift.staff_id
        
        // Validate UUIDs (they should be strings)
        if (!participantId || typeof participantId !== 'string' || participantId.trim() === '') {
          console.error('Invalid participant ID:', this.newShift.participant_id)
          throw new Error('Invalid participant selected. Please select a valid participant.')
        }
        if (!staffId || typeof staffId !== 'string' || staffId.trim() === '') {
          console.error('Invalid staff ID:', this.newShift.staff_id)
          throw new Error('Invalid staff member selected. Please select a valid staff member.')
        }
        
        // ID format validation - allow both UUIDs and custom formats like 'user_admin'
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        // Custom format: any string that's not empty and doesn't contain special characters
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        const customIdRegex = /^[a-zA-Z0-9_-]+$/
        
        if (!uuidRegex.test(participantId) && !customIdRegex.test(participantId)) {
          console.error('Invalid participant ID format:', participantId)
          throw new Error('Invalid participant ID format. Please refresh and try again.')
        }
        if (!uuidRegex.test(staffId) && !customIdRegex.test(staffId)) {
          console.error('Invalid staff ID format:', staffId)
          throw new Error('Invalid staff ID format. Please refresh and try again.')
        }
        
        const hourlyRate = parseFloat(this.newShift.hourly_rate)
        if (isNaN(hourlyRate) || hourlyRate <= 0) {
          throw new Error('Invalid hourly rate')
        }
        
        const shiftData = {
          participant_id: participantId,
          staff_id: staffId,
          start_time: startDateTime,
          end_time: endDateTime,
          service_type: this.newShift.service_type.trim(),
          location: this.newShift.location.trim(),
          hourly_rate: hourlyRate,
          notes: (this.newShift.notes || '').trim()
        }
        
        console.log('Updating shift with data:', shiftData)
        console.log('Editing shift ID:', this.editingShift.id)
        console.log('Participants available:', this.participants.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` })))
        console.log('Staff available:', this.staffMembers.map(s => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })))
        
        const result = await this.updateShift(this.editingShift.id, shiftData)
        console.log('Shift update result:', result)
        
        // Reload the shifts data to ensure UI is updated
        await this.fetchShifts()
        this.filterShifts()
        // Force Vue to re-render the component
        this.$forceUpdate()
        this.closeEditModal()
        showSuccessNotification('Shift updated successfully!')
        
      } catch (error) {
        console.error('Error updating shift:', error)
        console.error('Error response:', error.response)
        console.error('Error status:', error.response?.status)
        console.error('Error data:', error.response?.data)
        
        // More specific error messages based on status
        if (error.response?.status === 404) {
          if (error.response.config?.url?.includes('shifts')) {
            showErrorNotification(error, 'Shift not found. It may have been deleted by another user.')
          } else if (error.response.config?.url?.includes('participants')) {
            showErrorNotification(error, 'Participant not found. Please refresh the page and try again.')
          } else if (error.response.config?.url?.includes('users')) {
            showErrorNotification(error, 'Staff member not found. Please refresh the page and try again.')  
          } else {
            showErrorNotification(error, 'Resource not found (404). Please check your selection and try again.')
          }
        } else {
          showErrorNotification(error, 'Error updating shift. Please try again.')
        }
      } finally {
        this.isSubmitting = false
      }
    },

    closeEditModal() {
      this.showEditModal = false
      this.editingShift = null
      this.resetForm()
    },

    cancelShift(shift) {
      this.shiftToDelete = shift
      this.showDeleteModal = true
    },

    async confirmCancelShift() {
      if (!this.shiftToDelete) return
      
      this.isSubmitting = true
      try {
        const updateData = { 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        }
        await this.updateShift(this.shiftToDelete.id, updateData)
        await this.fetchShifts()
        this.filterShifts()
        this.$forceUpdate()
        this.closeDeleteModal()
        showSuccessNotification('Shift cancelled successfully!')
      } catch (error) {
        console.error('Error cancelling shift:', error)
        showErrorNotification(error, 'Error cancelling shift. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.shiftToDelete = null
    },

    closeStartModal() {
      this.showStartModal = false
      this.shiftToStart = null
    },

    closeCompleteModal() {
      this.showCompleteModal = false
      this.shiftToComplete = null
      this.completionNotes = ''
    },

    closeModal() {
      this.showAddModal = false
      this.resetForm()
    },

    resetForm() {
      this.newShift = {
        participant_id: '',
        staff_id: '',
        date: '',
        start_time: '',
        end_time: '',
        duration_hours: 4.0,
        service_type: '',
        location: '',
        hourly_rate: 45.00,
        notes: '',
        send_notifications: true
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },

    formatTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    formatStatus(status) {
      const statusMap = {
        'scheduled': 'Scheduled',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'no_show': 'No Show'
      }
      return statusMap[status] || status
    },

    calculateDuration(startTime, endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const durationMs = end - start
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours === 0) {
        return `${minutes}m`
      } else if (minutes === 0) {
        return `${hours}h`
      } else {
        return `${hours}h ${minutes}m`
      }
    },

    getParticipantName(participantId) {
      if (!participantId) return 'Unknown Participant'
      
      // Handle both string and number comparison
      const participant = this.participants.find(p => p.id == participantId || p.id === participantId)
      if (!participant) {
        // Only log once per missing participant to avoid spam
        if (!this._loggedMissingParticipants) this._loggedMissingParticipants = new Set()
        if (!this._loggedMissingParticipants.has(participantId)) {
          console.warn('Participant not found for ID:', participantId, 'Available participants:', this.participants.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` })))
          this._loggedMissingParticipants.add(participantId)
        }
      }
      return participant ? `${participant.first_name} ${participant.last_name}` : 'Unknown Participant'
    },
    
    getStaffName(staffId) {
      // Handle both string and number comparison
      const staff = this.staffMembers.find(s => s.id == staffId || s.id === staffId)
      if (!staff) {
        console.log('Staff not found for ID:', staffId, 'Available staff:', this.staffMembers.map(s => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })))
      }
      return staff ? `${staff.first_name} ${staff.last_name}` : 'Unknown Staff'
    },
    

    // Calendar methods
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },

    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },

    formatMonthYear(date) {
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long'
      })
    },

    calculateEndTimeFromDuration() {
      if (this.newShift.start_time && this.newShift.duration_hours) {
        const [hours, minutes] = this.newShift.start_time.split(':').map(Number)
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0, 0)
        
        const durationMs = this.newShift.duration_hours * 60 * 60 * 1000
        const endDate = new Date(startDate.getTime() + durationMs)
        
        const endHours = String(endDate.getHours()).padStart(2, '0')
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
        this.newShift.end_time = `${endHours}:${endMinutes}`
      }
    },

    calculateDurationFromTimes() {
      if (this.newShift.start_time && this.newShift.end_time) {
        const [startHours, startMinutes] = this.newShift.start_time.split(':').map(Number)
        const [endHours, endMinutes] = this.newShift.end_time.split(':').map(Number)
        
        const startDate = new Date()
        startDate.setHours(startHours, startMinutes, 0, 0)
        
        const endDate = new Date()
        endDate.setHours(endHours, endMinutes, 0, 0)
        
        // Handle next day scenarios
        if (endDate <= startDate) {
          endDate.setDate(endDate.getDate() + 1)
        }
        
        const durationMs = endDate - startDate
        this.newShift.duration_hours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(1))
      }
    },

    formatStatus(status) {
      const statusMap = {
        scheduled: 'Scheduled',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
      }
      return statusMap[status] || status
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

.stat-icon.danger {
  background: var(--danger-gradient);
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

.filter-controls select,
.filter-controls input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: var(--border-radius-sm);
  background: white;
  cursor: pointer;
  min-width: 120px;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.view-btn {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.view-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.view-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.content-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  padding: 2rem;
}

.shifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
}

.shift-card {
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.shift-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-soft);
  transform: translateY(-2px);
}

/* Dynamic Shift Card Colors */
.shift-card.shift-in_progress {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%) !important;
  border-color: #10b981 !important;
  border-width: 3px !important;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4) !important;
}

.shift-card.shift-in_progress:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-color: #059669;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
}

.shift-card.shift-completed {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border-color: #ef4444;
  border-width: 2px;
}

.shift-card.shift-completed:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
  border-color: #dc2626;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25);
}

.shift-card.shift-scheduled {
  background: rgba(255, 255, 255, 1);
  border-color: #e2e8f0;
}

.shift-card.shift-cancelled {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%);
  border-color: #9ca3af;
  opacity: 0.7;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.shift-time {
  flex: 1;
}

.time-main {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}

.time-date {
  font-size: 0.9rem;
  color: var(--text-medium);
}

.shift-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.scheduled {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.in_progress {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.shift-details {
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

.detail-item.notes {
  grid-column: 1 / -1;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: var(--border-radius-sm);
  margin-top: 0.5rem;
}

.shift-actions {
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

.btn-success {
  background: var(--success-gradient);
  color: white;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
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

/* Enhanced Status Button Styles */
.btn-start {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-start:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-start:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
}

.btn-complete {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-complete:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-complete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
}

/* Enhanced Status Badge Colors */
.status-badge.scheduled {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.status-badge.in_progress {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-badge.completed {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.calendar-view {
  padding: 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.calendar-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-dark);
}

.calendar-nav-btn {
  background: none;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-nav-btn:hover {
  background: var(--primary-color);
  color: white;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header-day {
  background: var(--primary-color);
  color: white;
  padding: 1rem;
  font-weight: 600;
  text-align: center;
  font-size: 0.9rem;
}

.calendar-day {
  background: white;
  min-height: 120px;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.calendar-day:hover {
  background: #f8fafc;
}

.calendar-day.other-month {
  background: #f1f5f9;
  color: var(--text-light);
}

.calendar-day.today {
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid var(--primary-color);
}

.calendar-day.has-shifts {
  background: rgba(16, 185, 129, 0.05);
}

.day-number {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1rem;
}

.day-shifts {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shift-indicator {
  background: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shift-indicator:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shift-indicator.scheduled {
  background: #3b82f6;
}

.shift-indicator.in_progress {
  background: #f59e0b;
}

.shift-indicator.completed {
  background: #10b981;
}

.shift-indicator.cancelled {
  background: #dc2626;
}

.more-shifts {
  font-size: 0.7rem;
  color: var(--text-medium);
  margin-top: 2px;
  font-style: italic;
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
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 800px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header h3::before {
  content: '\f073';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  opacity: 0.9;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 1.1rem;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  background: white;
}

/* Start/Complete Shift Modal Styles */
.start-modal, .complete-modal {
  max-width: 500px;
}

.shift-start-info, .shift-complete-info {
  text-align: center;
}

.start-icon, .complete-icon {
  margin-bottom: 1rem;
}

.start-icon i {
  font-size: 3rem;
  color: #10b981;
  animation: pulse 2s infinite;
}

.complete-icon i {
  font-size: 3rem;
  color: #3b82f6;
  animation: bounce 1s ease-in-out;
}

.shift-start-info h4, .shift-complete-info h4 {
  color: var(--text-dark);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.shift-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  padding: 1rem;
  text-align: left;
  margin-bottom: 1.5rem;
}

.shift-summary p {
  margin: 0.5rem 0;
  color: var(--text-dark);
}

.shift-summary strong {
  color: var(--text-dark);
  font-weight: 600;
}

.start-modal .modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  margin: 0;
  margin-top: 1.5rem;
}

.complete-modal .form-group {
  text-align: left;
  margin-bottom: 1.5rem;
}

.complete-modal .form-textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: var(--border-radius);
  padding: 0.75rem;
  font-family: inherit;
  resize: vertical;
}

.complete-modal .form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group small {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
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

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  margin: 0;
  margin-top: 1.5rem;
}

/* Premium Button System */
.btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.btn:not(:disabled):active {
  transform: scale(0.98);
}

/* Button Sizes */
.btn-small {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  min-width: 90px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

.btn-outline {
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

.btn-start {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-start:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-complete {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-complete:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

/* New Color Scheme Buttons */
.btn-view {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-view:hover:not(:disabled) {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-edit:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

.btn-cancel {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.btn-cancel:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

.btn-schedule {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-schedule:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

/* View Modal Styles */
.view-modal {
  max-width: 800px;
}

/* Delete Modal Styles */
.delete-modal {
  max-width: 500px;
}

.delete-confirmation {
  text-align: center;
}

.delete-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.delete-confirmation h4 {
  color: var(--text-dark);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.shift-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.shift-summary p {
  margin: 0.5rem 0;
  display: flex;
  justify-content: space-between;
}

.shift-summary strong {
  color: var(--text-medium);
}

.warning-text {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 1rem;
  color: #92400e;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.shift-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section .detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-section .detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 500;
  color: var(--text-medium);
}

.detail-item .value {
  font-weight: 600;
  color: var(--text-dark);
}

.detail-item .value.total-cost {
  font-size: 1.1rem;
  color: var(--primary-color);
}

.notes-content {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  color: var(--text-dark);
  line-height: 1.5;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Success notification */
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

/* Error notification */
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

  .shifts-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .shift-actions {
    justify-content: center;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .view-toggle {
    justify-content: center;
  }
}
</style>

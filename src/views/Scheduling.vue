<template>
  <div class="container-fluid">
    <!-- Add glassmorphism background overlay -->
    <div class="page-overlay"></div>
    <div class="page-header">
      <div class="page-header-shimmer" v-if="isLoading"></div>
      <div class="header-content">
        <h1>
          <i class="fas fa-calendar-alt"></i>
          Shift Scheduling
        </h1>
        <p>Manage staff shifts, assignments, and scheduling coordination</p>
      </div>
      <button @click="showAddModal = true" class="btn btn-shift">
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
      
      <!-- Split Components: Days Active -->
      <div class="stat-card days-component" :class="daysColorClass">
        <div class="stat-icon" :class="daysIconClass">
          <i class="fas fa-calendar-week"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ activeDaysCount }}</div>
          <div class="stat-label">Days Active</div>
        </div>
      </div>
      
      <!-- Split Components: Scheduled Shifts -->
      <div class="stat-card scheduled-component" :class="scheduledColorClass">
        <div class="stat-icon" :class="scheduledIconClass">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalScheduledShifts }}</div>
          <div class="stat-label">Shifts Scheduled</div>
        </div>
      </div>
    </div>

    <!-- Critical Shifts ETA Card -->
    <div v-if="criticalShifts.length > 0" class="eta-alert-card">
      <div class="eta-card-header">
        <div class="eta-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="eta-title">
          <h3>Critical Shifts - Immediate Attention Required</h3>
          <p>{{ criticalShifts.length }} shift{{ criticalShifts.length !== 1 ? 's' : '' }} starting soon</p>
        </div>
      </div>
      <div class="eta-shifts-list">
        <div v-for="shift in criticalShifts.slice(0, 3)" :key="shift.id" class="eta-shift-badge">
          <div class="eta-badge-content">
            <div class="eta-countdown-badge">{{ getTimeUntilShift(shift) }}</div>
            <div class="eta-shift-info">
              <div class="eta-time">{{ formatTime(shift.start_time) }} - {{ formatDate(shift.start_time) }}</div>
              <div class="eta-details-row">
                <span class="eta-badge eta-participant-badge">{{ getParticipantName(shift.participant_id) }}</span>
                <span class="eta-badge eta-staff-badge">{{ getStaffName(shift.staff_id) }}</span>
                <span class="eta-badge eta-service-badge">{{ formatServiceType(shift.service_type) }}</span>
              </div>
            </div>
            <button @click="startShift(shift)" class="btn-eta-start">
              <i class="fas fa-play"></i>
              Start
            </button>
          </div>
        </div>
        <div v-if="criticalShifts.length > 3" class="eta-more">
          +{{ criticalShifts.length - 3 }} more critical shifts
        </div>
      </div>
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
            placeholder="Search shifts..." 
            class="form-input"
            @input="filterShifts"
          />
        </div>
        
        <!-- Filter Controls -->
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterShifts" class="form-select">
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select v-model="dateFilter" @change="filterShifts" class="form-select">
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
            <option value="next_week">Next Week</option>
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
            <button 
              @click="currentView = 'calendar'" 
              :class="['view-btn-elegant', { active: currentView === 'calendar' }]"
              title="Calendar View"
            >
              <i class="fas fa-calendar"></i>
            </button>
          </div>
        </div>
      </div>
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
        <button @click="showAddModal = true" class="btn btn-shift">
          <i class="fas fa-plus"></i>
          Schedule First Shift
        </button>
      </div>

      <div v-else-if="filteredShifts.length === 0 && searchQuery" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No Results Found</h3>
        <p>Try adjusting your search criteria</p>
      </div>

      <!-- Grid View -->
      <div v-if="currentView === 'grid'" class="participants-grid">
        <div v-for="shift in filteredShifts" :key="shift.id" :class="['participant-card', `shift-${shift.status}`, getUrgencyClass(shift)]">
          <div class="participant-header">
            <div class="participant-avatar">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="participant-info">
              <h3>{{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }}</h3>
              <p class="participant-ndis">{{ formatDate(shift.start_time) }}</p>
            </div>
            <div class="participant-status">
              <span :class="['status-badge', getStatusClass(shift.status)]">
                {{ formatStatus(shift.status) }}
              </span>
            </div>
          </div>
          
          <div class="participant-details">
            <div class="detail-row">
              <i class="fas fa-user"></i>
              <span>{{ getParticipantName(shift.participant_id) }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-user-nurse"></i>
              <span>{{ getStaffName(shift.staff_id) }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-heart"></i>
              <span>{{ shift.service_type }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ shift.location }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-clock"></i>
              <span>{{ calculateDuration(shift.start_time, shift.end_time) }}</span>
            </div>
          </div>

          <div class="participant-actions">
            <button @click="viewShift(shift)" class="action-btn view-btn" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editShift(shift)" class="action-btn edit-btn" title="Edit Shift">
              <i class="fas fa-edit"></i>
            </button>
            <button 
              v-if="shift.status === 'scheduled'" 
              @click="startShift(shift)" 
              class="action-btn schedule-btn"
              title="Start Shift"
              :disabled="isSubmitting"
            >
              <i class="fas fa-play"></i>
            </button>
            <button 
              v-if="shift.status === 'in_progress'" 
              @click="showCompleteShiftModal(shift)" 
              class="action-btn approve-btn"
              title="Complete Shift"
              :disabled="isSubmitting"
            >
              <i class="fas fa-check"></i>
            </button>
            <button v-if="canCancelShifts" @click="showCancelShiftModal(shift)" class="action-btn delete-btn" title="Cancel Shift">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- List View -->
      <div v-else-if="currentView === 'list'" class="shifts-list-view">
        <div class="list-header">
          <div class="header-cell">Time</div>
          <div class="header-cell">Participant</div>
          <div class="header-cell">Staff</div>
          <div class="header-cell">Service</div>
          <div class="header-cell">Location</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>
        <div v-for="shift in filteredShifts" :key="shift.id" :class="['shift-row', `shift-${shift.status}`, getUrgencyClass(shift)]">
          <div class="row-cell time-cell">
            <div class="time-main">{{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }}</div>
            <div class="time-date">{{ formatDate(shift.start_time) }}</div>
          </div>
          <div class="row-cell participant-cell">{{ getParticipantName(shift.participant_id) }}</div>
          <div class="row-cell staff-cell">{{ getStaffName(shift.staff_id) }}</div>
          <div class="row-cell service-cell">{{ shift.service_type }}</div>
          <div class="row-cell location-cell">{{ shift.location }}</div>
          <div class="row-cell status-cell">
            <span :class="['status-badge', shift.status]">
              {{ formatStatus(shift.status) }}
            </span>
            <div v-if="getUrgencyLevel(shift) !== 'normal'" class="urgency-indicator" :class="getUrgencyLevel(shift)">
              <i :class="getUrgencyIcon(shift)"></i>
            </div>
          </div>
          <div class="row-cell actions-cell">
            <button 
              v-if="shift.status === 'scheduled'" 
              @click="startShift(shift)" 
              class="btn-mini btn-start"
              :disabled="isSubmitting"
              title="Start Shift"
            >
              <i class="fas fa-play"></i>
            </button>
            <button 
              v-if="shift.status === 'in_progress'" 
              @click="showCompleteShiftModal(shift)" 
              class="btn-mini btn-complete"
              :disabled="isSubmitting"
              title="Complete Shift"
            >
              <i class="fas fa-check-circle"></i>
            </button>
            <button @click="editShift(shift)" class="btn-mini btn-edit" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="canCancelShifts" @click="showCancelShiftModal(shift)" class="btn-mini btn-cancel" title="Cancel">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else-if="currentView === 'calendar'" class="calendar-view">
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
        <div class="modal-header modal-header-shift-success">
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
                <div class="searchable-dropdown">
                  <input 
                    v-model="participantSearch" 
                    @input="filterParticipants" 
                    @focus="showParticipantDropdown = true"
                    @blur="hideParticipantDropdown"
                    :placeholder="selectedParticipant ? `${selectedParticipant.first_name} ${selectedParticipant.last_name}` : 'Search participants...'"
                    class="form-input searchable-input"
                    autocomplete="off"
                  />
                  <div v-if="showParticipantDropdown" class="dropdown-list">
                    <div 
                      v-for="participant in filteredParticipants" 
                      :key="participant.id"
                      @mousedown="selectParticipant(participant)"
                      class="dropdown-item"
                    >
                      <div class="participant-option">
                        <div class="participant-info">
                          <span class="name">{{ participant.first_name }} {{ participant.last_name }}</span>
                          <span class="details">{{ participant.ndis_number || 'No NDIS' }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="filteredParticipants.length === 0" class="dropdown-empty">
                      No participants found
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Staff Member *</label>
                <div class="searchable-dropdown">
                  <input 
                    v-model="staffSearch" 
                    @input="filterStaff" 
                    @focus="showStaffDropdown = true"
                    @blur="hideStaffDropdown"
                    :placeholder="selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : 'Search staff members...'"
                    class="form-input searchable-input"
                    autocomplete="off"
                  />
                  <div v-if="showStaffDropdown" class="dropdown-list">
                    <div 
                      v-for="staff in filteredStaffWithAvailability" 
                      :key="staff.id"
                      @mousedown="selectStaff(staff)"
                      class="dropdown-item"
                    >
                      <div class="staff-option">
                        <div class="staff-info">
                          <span class="name">{{ staff.first_name }} {{ staff.last_name }}</span>
                          <span class="role">{{ formatRole(staff.role) }}</span>
                        </div>
                        <div class="availability-info">
                          <div class="availability-badge" :class="staff.availabilityClass">
                            {{ staff.availabilityPercentage }}% available
                          </div>
                          <div class="hours-info">{{ staff.availableHours }}h available today</div>
                          <div v-if="staff.nextAvailable" class="next-available">
                            Next: {{ staff.nextAvailable }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="filteredStaffWithAvailability.length === 0" class="dropdown-empty">
                      No staff members found
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input v-model="newShift.date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select v-model="newShift.service_type" class="form-select" required>
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
                <input v-model="newShift.start_time" type="time" class="form-input" required @change="calculateEndTimeFromDuration" />
              </div>
              <div class="form-group">
                <label>Duration (hours)</label>
                <input 
                  v-model="newShift.duration_hours" 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24" 
                  class="form-input"
                  placeholder="4.0" 
                  @input="calculateEndTimeFromDuration"
                />
                <small>Auto-calculates end time</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>End Time *</label>
                <input v-model="newShift.end_time" type="time" class="form-input" required @change="calculateDurationFromTimes" />
                <small>Or set manually to override duration</small>
              </div>
              <div class="form-group"></div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Hourly Rate ($) *</label>
                <input v-model="newShift.hourly_rate" type="number" step="0.01" min="0" class="form-input" required placeholder="45.00" />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <select v-model="newShift.location" class="form-select" required>
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
                class="form-textarea"
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
              <button type="submit" class="btn btn-shift" :disabled="isSubmitting">
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
        <div class="modal-header modal-header-shift-success">
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
                <select v-model="newShift.participant_id" class="form-select" required>
                  <option value="">Select Participant</option>
                  <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Staff Member *</label>
                <select v-model="newShift.staff_id" class="form-select" required>
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
                <input v-model="newShift.date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select v-model="newShift.service_type" class="form-select" required>
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
                <input v-model="newShift.start_time" type="time" class="form-input" required @change="calculateEndTimeFromDuration" />
              </div>
              <div class="form-group">
                <label>Duration (hours)</label>
                <input 
                  v-model="newShift.duration_hours" 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24" 
                  class="form-input"
                  placeholder="4.0" 
                  @input="calculateEndTimeFromDuration"
                />
                <small>Auto-calculates end time</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>End Time *</label>
                <input v-model="newShift.end_time" type="time" class="form-input" required @change="calculateDurationFromTimes" />
                <small>Or set manually to override duration</small>
              </div>
              <div class="form-group"></div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Hourly Rate ($) *</label>
                <input v-model="newShift.hourly_rate" type="number" step="0.01" min="0" class="form-input" required placeholder="45.00" />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <select v-model="newShift.location" class="form-select" required>
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
                class="form-textarea"
                placeholder="Any special instructions or notes for this shift..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-shift" :disabled="isSubmitting">
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
        <div class="modal-header modal-header-shift-info">
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
              @click="showCompleteShiftModal(selectedShift); closeViewModal()" 
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
        <div class="modal-header modal-header-shift-success">
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
        <div class="modal-header modal-header-shift-success">
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
import { useAuthStore } from '../stores/auth'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export default {
  name: 'Scheduling',
  data() {
    return {
      filteredShifts: [],
      searchQuery: '',
      statusFilter: '',
      dateFilter: '',
      currentView: 'list',
      filtersMinimized: true,
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
      },
      // Searchable dropdown state
      participantSearch: '',
      staffSearch: '',
      showParticipantDropdown: false,
      showStaffDropdown: false,
      selectedParticipant: null,
      selectedStaff: null,
      filteredParticipants: [],
      filteredStaffWithAvailability: []
    }
  },
  computed: {
    ...mapState(useShiftsStore, ['shifts', 'isLoading', 'error']),
    ...mapState(useParticipantsStore, { allParticipants: 'participants' }),
    ...mapState(useUsersStore, { allStaffMembers: 'users' }),
    ...mapState(useAuthStore, ['user']),
    
    // Permission checking
    canCancelShifts() {
      return this.user && (this.user.role === 'admin' || this.user.role === 'manager')
    },

    criticalShifts() {
      return this.filteredShifts.filter(shift => {
        return shift.status === 'scheduled' && this.getUrgencyLevel(shift) === 'critical'
      }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    },
    
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
    
    // Combined stats for demonstration
    activeDaysCount() {
      // Count unique days that have scheduled shifts in the next 30 days
      const now = new Date()
      const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      const uniqueDays = new Set()
      this.shifts.forEach(shift => {
        const shiftDate = new Date(shift.start_time)
        if (shiftDate >= now && shiftDate <= next30Days) {
          const dayString = shiftDate.toDateString()
          uniqueDays.add(dayString)
        }
      })
      return uniqueDays.size
    },
    
    totalScheduledShifts() {
      return this.shifts.filter(shift => shift.status === 'scheduled').length
    },
    
    // Dynamic color classes for split components
    daysColorClass() {
      const count = this.activeDaysCount
      if (count >= 20) return 'high-activity'
      if (count >= 10) return 'moderate-activity'
      if (count >= 5) return 'low-activity'
      return 'minimal-activity'
    },
    
    daysIconClass() {
      const count = this.activeDaysCount
      if (count >= 20) return 'success'
      if (count >= 10) return 'warning'
      if (count >= 5) return 'info'
      return 'danger'
    },
    
    scheduledColorClass() {
      const count = this.totalScheduledShifts
      if (count >= 50) return 'high-scheduled'
      if (count >= 20) return 'moderate-scheduled'
      if (count >= 10) return 'low-scheduled'
      return 'minimal-scheduled'
    },
    
    scheduledIconClass() {
      const count = this.totalScheduledShifts
      if (count >= 50) return 'success'
      if (count >= 20) return 'primary'
      if (count >= 10) return 'warning'
      return 'danger'
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
    ...mapActions(useShiftsStore, ['fetchShifts', 'createShift', 'updateShift', 'updateShiftStatus', 'startShift', 'completeShift', 'cancelShift', 'deleteShift']),
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
        
        // Initialize dropdowns with full data
        this.filteredParticipants = this.participants.slice(0, 10)
        this.filterStaff()
      } catch (error) {
        console.error('Error loading data:', error)
        showErrorNotification(error, 'Failed to load data. Please refresh the page.')
      } finally {
        this.isLoading = false
      }
    },

    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
      this.dateFilter = ''
      this.filterShifts()
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
        const updateData = {
          status: 'in_progress',
          actual_start_time: new Date().toISOString()
        }
        
        console.log('🚀 Starting shift:', this.shiftToStart.id)
        console.log('📊 Update data:', updateData)
        console.log('🔑 Auth token:', localStorage.getItem('auth_token')?.substring(0, 10) + '...')
        
        // Use direct fetch for maximum debugging visibility
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://das-crm-backend-567187485284.us-central1.run.app/api/v1'
        const response = await fetch(`${baseURL}/shifts/${this.shiftToStart.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(updateData)
        })
        
        console.log('🔍 Response status:', response.status)
        console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))
        
        const responseText = await response.text()
        console.log('🔍 Raw response:', responseText)
        
        if (!response.ok) {
          throw new Error(`API call failed with status ${response.status}: ${responseText}`)
        }
        
        let responseData
        try {
          responseData = JSON.parse(responseText)
          console.log('✅ Parsed response:', responseData)
        } catch (parseError) {
          console.warn('⚠️ Could not parse response as JSON:', parseError)
          responseData = { success: true }
        }
        
        // Refresh data from server
        await this.fetchShifts()
        this.filterShifts()
        
        this.closeStartModal()
        showSuccessNotification('Shift started successfully!')
        
      } catch (error) {
        console.error('❌ Start shift failed:', error)
        showErrorNotification(error, `Error starting shift: ${error.message}`)
      } finally {
        this.isSubmitting = false
      }
    },

    async showCompleteShiftModal(shift) {
      this.shiftToComplete = shift
      this.completionNotes = ''
      this.showCompleteModal = true
    },

    async confirmCompleteShift() {
      if (!this.shiftToComplete) return
      
      this.isSubmitting = true
      try {
        const completionNotes = this.completionNotes && this.completionNotes.trim() ? this.completionNotes.trim() : ''
        
        // Use the store's completeShift method which handles the correct API call
        await this.completeShift(this.shiftToComplete.id, completionNotes)
        
        // Refresh from server to ensure consistency
        await this.fetchShifts()
        this.filterShifts()
        this.closeCompleteModal()
        showSuccessNotification('Shift completed successfully!')
      } catch (error) {
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

    showCancelShiftModal(shift) {
      this.shiftToDelete = shift
      this.showDeleteModal = true
    },

    async confirmCancelShift() {
      if (!this.shiftToDelete) return
      
      this.isSubmitting = true
      try {
        // Use the store's cancelShift method which handles the correct API call
        await this.cancelShift(this.shiftToDelete.id, 'Cancelled by user')
        await this.fetchShifts()
        this.filterShifts()
        this.$forceUpdate()
        this.closeDeleteModal()
        showSuccessNotification('Shift cancelled successfully!')
      } catch (error) {
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
        year: 'numeric',
        timeZone: this.user?.timezone || 'Australia/Adelaide'
      })
    },

    formatTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: this.user?.timezone || 'Australia/Adelaide'
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

    getStatusClass(status) {
      const classes = {
        'scheduled': 'scheduled',
        'in_progress': 'active',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'no_show': 'expired'
      }
      return classes[status] || 'scheduled'
    },

    formatServiceType(serviceType) {
      const serviceMap = {
        'support_work': 'Support',
        'personal_care': 'Care',
        'transport': 'Transport',
        'community_access': 'Community',
        'household_tasks': 'Household'
      }
      return serviceMap[serviceType] || serviceType
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

    getUrgencyLevel(shift) {
      if (shift.status !== 'scheduled') return 'normal'
      
      // Get current time in user's timezone
      const now = new Date()
      const userNow = new Date(now.toLocaleString("sv-SE", {timeZone: this.user?.timezone || "Australia/Adelaide"}))
      const shiftStart = new Date(shift.start_time)
      const daysUntilStart = (shiftStart - userNow) / (1000 * 60 * 60 * 24)
      
      // Critical if shift starts within 2 days
      if (daysUntilStart <= 2 && daysUntilStart > 0) {
        return 'critical'
      }
      // Urgent if shift starts within 7 days
      else if (daysUntilStart <= 7 && daysUntilStart > 0) {
        return 'urgent'
      }
      
      return 'normal'
    },

    getUrgencyClass(shift) {
      const urgency = this.getUrgencyLevel(shift)
      if (urgency === 'critical') return 'shift-critical'
      if (urgency === 'urgent') return 'shift-urgent'
      return ''
    },
    
    getUrgencyIcon(shift) {
      const urgency = this.getUrgencyLevel(shift)
      if (urgency === 'critical') return 'fas fa-exclamation-circle'
      if (urgency === 'urgent') return 'fas fa-exclamation-triangle'
      return ''
    },
    
    getUrgencyText(shift) {
      const urgency = this.getUrgencyLevel(shift)
      // Get current time in user's timezone
      const now = new Date()
      const userNow = new Date(now.toLocaleString("sv-SE", {timeZone: this.user?.timezone || "Australia/Adelaide"}))
      const shiftStart = new Date(shift.start_time)
      const daysUntilStart = Math.ceil((shiftStart - userNow) / (1000 * 60 * 60 * 24))
      
      if (urgency === 'critical') {
        return daysUntilStart === 1 ? 'Tomorrow' : `${daysUntilStart} days left`
      }
      if (urgency === 'urgent') {
        return `${daysUntilStart} days left`
      }
      return ''
    },
    
    getTimeUntilShift(shift) {
      // Use Intl API for proper timezone handling
      const now = new Date()
      const shiftStart = new Date(shift.start_time)
      
      // Get current time in user's timezone
      const userNow = new Date(now.toLocaleString("sv-SE", {timeZone: this.user?.timezone || "Australia/Adelaide"}))
      const diffMs = shiftStart - userNow
      
      if (diffMs < 0) return 'Starting now'
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours === 0) {
        return `${diffMinutes}m`
      } else if (diffHours < 24) {
        return `${diffHours}h ${diffMinutes}m`
      } else {
        const diffDays = Math.floor(diffHours / 24)
        const remainingHours = diffHours % 24
        return `${diffDays}d ${remainingHours}h`
      }
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

    // Searchable dropdown methods
    filterParticipants() {
      const query = this.participantSearch.toLowerCase()
      this.filteredParticipants = this.participants.filter(participant => {
        const fullName = `${participant.first_name} ${participant.last_name}`.toLowerCase()
        const ndis = (participant.ndis_number || '').toLowerCase()
        return fullName.includes(query) || ndis.includes(query)
      }).slice(0, 10) // Limit to 10 results
    },

    filterStaff() {
      const query = this.staffSearch.toLowerCase()
      const targetDate = this.newShift.date || new Date().toISOString().split('T')[0]
      
      this.filteredStaffWithAvailability = this.staffMembers.filter(staff => {
        const fullName = `${staff.first_name} ${staff.last_name}`.toLowerCase()
        const role = (staff.role || '').toLowerCase()
        return fullName.includes(query) || role.includes(query)
      }).map(staff => {
        const availability = this.calculateStaffAvailability(staff, targetDate)
        return {
          ...staff,
          ...availability
        }
      }).sort((a, b) => {
        // Sort by availability percentage (highest first), then by available hours
        if (b.availabilityPercentage !== a.availabilityPercentage) {
          return b.availabilityPercentage - a.availabilityPercentage
        }
        return b.availableHours - a.availableHours
      }).slice(0, 10) // Limit to 10 results
    },

    calculateStaffAvailability(staff, date) {
      const today = new Date(date).toDateString()
      const staffShifts = this.shifts.filter(shift => {
        const shiftDate = new Date(shift.start_time).toDateString()
        return shiftDate === today && shift.staff_id == staff.id && shift.status !== 'cancelled'
      })

      const totalWorkingHours = 8 // Assume 8-hour work day
      let scheduledHours = 0
      let nextAvailableTime = null

      staffShifts.forEach(shift => {
        const start = new Date(shift.start_time)
        const end = new Date(shift.end_time)
        scheduledHours += (end - start) / (1000 * 60 * 60)
      })

      const availableHours = Math.max(0, totalWorkingHours - scheduledHours)
      const availabilityPercentage = Math.round((availableHours / totalWorkingHours) * 100)

      // Find next available time slot
      if (staffShifts.length > 0) {
        const sortedShifts = staffShifts.sort((a, b) => new Date(a.end_time) - new Date(b.end_time))
        const lastShift = sortedShifts[sortedShifts.length - 1]
        nextAvailableTime = new Date(lastShift.end_time).toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } else {
        nextAvailableTime = '9:00 AM'
      }

      let availabilityClass = 'high'
      if (availabilityPercentage < 50) availabilityClass = 'low'
      else if (availabilityPercentage < 80) availabilityClass = 'medium'

      return {
        availableHours: availableHours.toFixed(1),
        availabilityPercentage,
        availabilityClass,
        nextAvailable: availableHours > 0 ? nextAvailableTime : 'Fully booked'
      }
    },

    selectParticipant(participant) {
      this.selectedParticipant = participant
      this.newShift.participant_id = participant.id
      this.participantSearch = `${participant.first_name} ${participant.last_name}`
      this.showParticipantDropdown = false
    },

    selectStaff(staff) {
      this.selectedStaff = staff
      this.newShift.staff_id = staff.id
      this.staffSearch = `${staff.first_name} ${staff.last_name}`
      this.showStaffDropdown = false
    },

    hideParticipantDropdown() {
      setTimeout(() => {
        this.showParticipantDropdown = false
      }, 150)
    },

    hideStaffDropdown() {
      setTimeout(() => {
        this.showStaffDropdown = false
      }, 150)
    },

    formatRole(role) {
      const roleMap = {
        'care_worker': 'Care Worker',
        'support_coordinator': 'Support Coordinator',
        'manager': 'Manager',
        'admin': 'Administrator'
      }
      return roleMap[role] || role
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

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
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
  background: #1e293b;
  border: 1px solid rgba(51, 65, 85, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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

.page-header-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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
  transition: all 0.3s ease;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 0.25rem 0;
}

.search-box {
  position: relative;
  flex: 1 1 auto;
  min-width: 200px;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.9rem;
  z-index: 2;
}

[data-theme="dark"] .search-box i {
  color: #94a3b8;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: nowrap;
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

/* ETA Alert Card */
.eta-alert-card {
  background: linear-gradient(145deg, #ffffff 0%, #fef7f7 100%);
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 20px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.eta-alert-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(239, 68, 68, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.1);
  border-left-color: #dc2626;
}

.eta-card-header {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem 1rem;
  gap: 1rem;
}

.eta-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.eta-title h3 {
  margin: 0;
  color: #dc2626;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.eta-title p {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 400;
}

.eta-shifts-list {
  padding: 0 1.5rem 1.25rem;
}

.eta-shift-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  transition: all 0.3s ease;
}

.eta-shift-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
}

.eta-shift-time {
  flex: 1;
}

.eta-countdown {
  font-size: 1.5rem;
  font-weight: 800;
  color: #dc2626;
  line-height: 1;
}

.eta-shift-date {
  font-size: 0.75rem;
  color: #7f1d1d;
  margin-top: 0.25rem;
}

.eta-shift-details {
  flex: 2;
  padding: 0 1rem;
}

.eta-participant {
  font-weight: 600;
  color: #7f1d1d;
  font-size: 0.875rem;
}

.eta-staff, .eta-service {
  font-size: 0.75rem;
  color: #991b1b;
  margin-top: 0.25rem;
}

.eta-actions {
  flex: 0 0 auto;
}

.btn-eta-start {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 7px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-eta-start:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
}

.eta-more {
  text-align: center;
  padding: 0.5rem 0.75rem;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.8rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

/* New ETA Badge Layout */
.eta-shift-badge {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.eta-shift-badge:hover {
  background: rgba(249, 250, 251, 0.98);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(209, 213, 219, 0.8);
}

.eta-badge-content {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
}

.eta-countdown-badge {
  background: #ef4444;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
  min-width: 80px;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
  border: none;
}

.eta-shift-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eta-time {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.eta-details-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.eta-badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.eta-participant-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.eta-staff-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.eta-service-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.btn-eta-start {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;
  justify-content: center;
}

.btn-eta-start:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

@keyframes etaPulse {
  0%, 100% {
    box-shadow: 
      0 10px 40px rgba(239, 68, 68, 0.15),
      0 4px 15px rgba(239, 68, 68, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 
      0 15px 50px rgba(239, 68, 68, 0.3),
      0 6px 20px rgba(239, 68, 68, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
}

@keyframes etaBackgroundShift {
  0% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 25%;
  }
  50% {
    background-position: 100% 75%;
  }
  75% {
    background-position: 0% 75%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes etaBorderGlow {
  0%, 100% {
    background-position: 0% 50%;
    opacity: 1;
  }
  25% {
    background-position: 100% 25%;
    opacity: 0.8;
  }
  50% {
    background-position: 100% 75%;
    opacity: 1;
  }
  75% {
    background-position: 0% 75%;
    opacity: 0.9;
  }
}

.search-box i.original {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.8rem;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.85rem;
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .stat-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] .stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

/* Stat card colors matching icon colors */
.stat-card:nth-child(1) {
  border-left: 4px solid #6b7280;
}

.stat-card:nth-child(2) {
  border-left: 4px solid #10b981;
}

.stat-card:nth-child(3) {
  border-left: 4px solid #f59e0b;
}

.stat-card:nth-child(4) {
  border-left: 4px solid #ef4444;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-icon.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-number {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1;
}

[data-theme="dark"] .stat-number {
  color: #f3f4f6;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

[data-theme="dark"] .stat-label {
  color: #9ca3af;
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
.filter-controls input,
.filter-controls select {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-width: 120px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  font-size: 0.85rem;
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
  border-radius: 10px;
  padding: 0.75rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.shift-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.98);
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

/* Urgent shifts - within 7 days (yellow) */
.shift-card.shift-urgent {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 2px solid #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  animation: urgentPulse 3s infinite;
}

.shift-card.shift-urgent:hover {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* Critical shifts - within 2 days (red background as requested) */
.shift-card.shift-critical {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%);
  border: 2px solid #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  animation: criticalPulse 2s infinite;
}

.shift-card.shift-critical:hover {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.25);
}

@keyframes urgentPulse {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.15);
  }
}

@keyframes criticalPulse {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.25);
  }
}

/* Urgency indicator styles */
.urgency-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.urgency-indicator.urgent {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #92400e;
  border: 1px solid #fbbf24;
}

.urgency-indicator.critical {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: 1px solid #f97316;
  animation: criticalBlink 1.5s infinite;
}

@keyframes criticalBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
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
  margin-bottom: 0.75rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
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
  padding: 4px 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.75rem;
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

/* Grid View Styles */
.shifts-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.shift-card-grid {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.shift-card-grid:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.shift-card-grid.urgent {
  border-left-color: #fbbf24;
  background: linear-gradient(to right, #fef3c7 0%, white 8%);
}

.shift-card-grid.critical {
  border-left-color: #f87171;
  background: linear-gradient(to right, #fee2e2 0%, white 8%);
}

.shift-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.shift-participant {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}

.shift-grid-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shift-grid-body > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.shift-grid-body i {
  width: 16px;
  color: #94a3b8;
}

.shift-grid-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.shift-grid-actions .btn-small {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .shifts-grid-view {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .view-toggle {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .view-btn {
    flex: 1;
    min-width: auto;
  }
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 24px;
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05);
  width: 92%;
  max-width: 900px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.08);
  animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem 2.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  color: white;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
}

.modal-header-shift-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
  color: white;
}

.modal-header-shift-info {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%) !important;
  color: white;
}

.modal-header h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.025em;
}

.modal-header h3::before {
  content: '\f073';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  opacity: 0.9;
}

.close-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05) rotate(90deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.modal-body {
  padding: 2.5rem;
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
}

.modal-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
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
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-group input,
.form-group select,
.form-group textarea {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.03);
  font-weight: 500;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
  background: white;
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

.btn-shift {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.btn-shift:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
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
    padding: 1rem;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem;
  }

  .filters-header {
    margin-bottom: 0.75rem;
  }

  .filters-title {
    font-size: 0.9rem;
  }

  .filters-row {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .filter-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-controls select,
  .filter-controls input {
    width: 100%;
    min-width: auto;
  }

  .view-toggle {
    order: -1;
    justify-content: center;
    margin-bottom: 0.75rem;
  }

  .shifts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  /* ETA Badge Mobile Styles */
  .eta-alert-card {
    margin-bottom: 1rem;
    border-radius: 8px;
  }

  .eta-card-header {
    padding: 1rem;
  }

  .eta-shifts-list {
    padding: 0 1rem 1rem;
  }

  .eta-badge-content {
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .eta-countdown-badge {
    order: -1;
    align-self: center;
    min-width: 60px;
    font-size: 0.8rem;
    padding: 6px 10px;
  }

  .eta-shift-info {
    text-align: center;
  }

  .eta-details-row {
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-eta-start {
    align-self: center;
    min-width: 100px;
  }

  /* Stats Row Mobile */
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  /* Participant Cards Mobile */
  .participant-card {
    margin-bottom: 1rem;
  }

  .participant-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .participant-info h3 {
    font-size: 1rem;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-bottom: 0.375rem;
  }

  .participant-actions {
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .action-btn {
    min-width: 44px;
    padding: 0.5rem;
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

/* List View Styles - Inline Row Layout */
.shifts-list-view {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

[data-theme="dark"] .shifts-list-view {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
}

.list-header {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.2fr 1fr 1.2fr 100px 120px;
  gap: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 2px solid #e2e8f0;
  padding: 1rem;
  font-weight: 600;
  color: var(--text-dark);
}

[data-theme="dark"] .list-header {
  background: linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%);
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
  color: #f8fafc;
}

.header-cell {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-medium);
}

.shift-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.2fr 1fr 1.2fr 100px 120px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: all 0.3s ease;
}

.shift-row:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(102, 126, 234, 0.01) 100%);
  transform: translateX(4px);
}

[data-theme="dark"] .shift-row {
  border-bottom: 1px solid rgba(75, 85, 99, 0.15);
  color: #e5e7eb;
}

[data-theme="dark"] .shift-row:hover {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(55, 65, 81, 0.6) 100%);
  border-color: rgba(96, 165, 250, 0.3);
}

.shift-row.shift-urgent {
  border-left: 4px solid #fbbf24;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, transparent 100%);
}

.shift-row.shift-critical {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, transparent 100%);
}

[data-theme="dark"] .shift-row.shift-urgent {
  border-left-color: #fbbf24;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, transparent 100%);
}

[data-theme="dark"] .shift-row.shift-critical {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, transparent 100%);
}

.shift-row.urgent {
  border-left: 4px solid #fa709a;
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.05) 0%, transparent 100%);
}

.shift-row.warning {
  border-left: 4px solid #fbbf24;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, transparent 100%);
}

.row-cell {
  font-size: 0.9rem;
  color: var(--text-dark);
}

[data-theme="dark"] .row-cell {
  color: #f3f4f6;
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-main {
  font-weight: 600;
  font-size: 0.95rem;
}

.time-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

[data-theme="dark"] .time-main {
  color: #f9fafb;
}

[data-theme="dark"] .time-date {
  color: #9ca3af;
}

.participant-cell,
.staff-cell {
  font-weight: 500;
}

.service-cell,
.location-cell {
  font-size: 0.85rem;
  color: var(--text-medium);
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-cell .status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.urgency-indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.urgency-indicator.urgent {
  background: #fa709a;
  color: white;
}

.urgency-indicator.warning {
  background: #fbbf24;
  color: white;
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

[data-theme="dark"] .actions-cell .btn-small {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
}

[data-theme="dark"] .actions-cell .btn-small:hover {
  background: rgba(55, 65, 81, 1);
  border-color: rgba(96, 165, 250, 0.4);
  transform: translateY(-1px);
}

.btn-mini {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-mini.btn-start {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-mini.btn-complete {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.btn-mini.btn-edit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-mini.btn-cancel {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn-mini:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Mobile responsiveness for list view */
@media (max-width: 1200px) {
  .shifts-list-view .list-header,
  .shifts-list-view .shift-row {
    grid-template-columns: 1fr 1fr 1fr 80px 100px;
  }
  
  .service-cell,
  .location-cell {
    display: none;
  }
}

@media (max-width: 768px) {
  .shifts-list-view .list-header,
  .shifts-list-view .shift-row {
    grid-template-columns: 1fr 1fr 60px;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .staff-cell,
  .service-cell,
  .location-cell {
    display: none;
  }
  
  .actions-cell {
    flex-direction: column;
    gap: 0.2rem;
  }
}

/* Combined stats styling */
.stat-card.combined-stats {
  border: 2px solid #e0f2fe;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.stat-combined {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}

.days-count {
  color: #0f766e;
}

.separator {
  color: #64748b;
  font-weight: 400;
}

.scheduled-count {
  color: #1d4ed8;
}

/* Dynamic color classes for split components */
.stat-card.days-component.high-activity {
  border-left: 4px solid #059669;
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(240, 253, 244, 0.95) 100%);
}

[data-theme="dark"] .stat-card.days-component.high-activity {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(6, 78, 59, 0.2) 100%);
}

.stat-card.days-component.moderate-activity {
  border-left: 4px solid #d97706;
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(254, 243, 199, 0.95) 100%);
}

[data-theme="dark"] .stat-card.days-component.moderate-activity {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(120, 53, 15, 0.2) 100%);
}

.stat-card.days-component.low-activity {
  border-left: 4px solid #2563eb;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.95) 100%);
}

[data-theme="dark"] .stat-card.days-component.low-activity {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(30, 58, 138, 0.2) 100%);
}

.stat-card.days-component.minimal-activity {
  border-left: 4px solid #dc2626;
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.95) 100%);
}

[data-theme="dark"] .stat-card.days-component.minimal-activity {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(127, 29, 29, 0.2) 100%);
}

.stat-card.scheduled-component.high-scheduled {
  border-left: 4px solid #059669;
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(240, 253, 244, 0.95) 100%);
}

[data-theme="dark"] .stat-card.scheduled-component.high-scheduled {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(6, 78, 59, 0.2) 100%);
}

.stat-card.scheduled-component.moderate-scheduled {
  border-left: 4px solid #7c3aed;
  background: linear-gradient(135deg, rgba(250, 245, 255, 0.9) 0%, rgba(243, 232, 255, 0.95) 100%);
}

[data-theme="dark"] .stat-card.scheduled-component.moderate-scheduled {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(88, 28, 135, 0.2) 100%);
}

.stat-card.scheduled-component.low-scheduled {
  border-left: 4px solid #d97706;
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(254, 243, 199, 0.95) 100%);
}

[data-theme="dark"] .stat-card.scheduled-component.low-scheduled {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(120, 53, 15, 0.2) 100%);
}

.stat-card.scheduled-component.minimal-scheduled {
  border-left: 4px solid #dc2626;
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.95) 100%);
}

[data-theme="dark"] .stat-card.scheduled-component.minimal-scheduled {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(127, 29, 29, 0.2) 100%);
}

/* Searchable Dropdown Styles */
.searchable-dropdown {
  position: relative;
  width: 100%;
}

.searchable-dropdown::after {
  content: '\f078';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 12px;
}

.searchable-dropdown:focus-within::after {
  transform: translateY(-50%) rotate(180deg);
  color: #667eea;
}

.searchable-input {
  width: 100%;
  padding: 14px 50px 14px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  position: relative;
}

.searchable-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  margin-top: 8px;
  animation: dropdownSlideIn 0.2s ease-out;
}

.dropdown-item {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-left: 4px solid #667eea;
  transform: translateX(2px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.dropdown-item:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-empty {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-style: italic;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 8px;
  font-weight: 500;
  font-size: 14px;
}

/* Participant Option Styling */
.participant-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.participant-info .name {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.4;
}

.participant-info .details {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  opacity: 0.9;
}

/* Staff Option Styling */
.staff-option {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.staff-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.staff-info .name {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.4;
}

.staff-info .role {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  opacity: 0.9;
}

.availability-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 120px;
}

.availability-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.availability-badge.high {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.availability-badge.medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.availability-badge.low {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.hours-info {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.next-available {
  font-size: 10px;
  color: #667eea;
  font-weight: 500;
}

/* Responsive adjustments */
/* Animation Keyframes */
@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .staff-option {
    flex-direction: column;
    gap: 8px;
  }
  
  .availability-info {
    align-items: flex-start;
    min-width: auto;
  }
  
  .dropdown-list {
    max-height: 200px;
  }
  
  .modal-content {
    width: 95%;
    margin: 0 10px;
  }
  
  .modal-header {
    padding: 2rem 1.5rem 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
}

/* Dark Theme Styles */
[data-theme="dark"] .modal-overlay {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
}

[data-theme="dark"] .modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(148, 163, 184, 0.1);
}

[data-theme="dark"] .modal-header {
  background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

[data-theme="dark"] .modal-header::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%);
}

[data-theme="dark"] .modal-header h3 {
  color: #f1f5f9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .modal-body {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

[data-theme="dark"] .modal-body::before {
  background: linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.2) 50%, transparent 100%);
}

[data-theme="dark"] .form-group label {
  color: #f1f5f9;
}

[data-theme="dark"] .form-group input,
[data-theme="dark"] .form-group select,
[data-theme="dark"] .form-group textarea {
  background: #0f172a;
  border: 2px solid #475569;
  color: #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .form-group input::placeholder,
[data-theme="dark"] .form-group select::placeholder,
[data-theme="dark"] .form-group textarea::placeholder {
  color: #94a3b8;
}

[data-theme="dark"] .form-group input:focus,
[data-theme="dark"] .form-group select:focus,
[data-theme="dark"] .form-group textarea:focus {
  border-color: #8b5cf6;
  background: #1e293b;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.15);
}

[data-theme="dark"] .form-group small {
  color: #94a3b8;
}

[data-theme="dark"] .searchable-input {
  background: #0f172a;
  border: 2px solid #475569;
  color: #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .searchable-input::placeholder {
  color: #94a3b8;
}

[data-theme="dark"] .searchable-input:focus {
  border-color: #8b5cf6;
  background: #1e293b;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.15);
}

[data-theme="dark"] .searchable-dropdown::after {
  color: #94a3b8;
}

[data-theme="dark"] .searchable-dropdown:focus-within::after {
  color: #8b5cf6;
}

[data-theme="dark"] .dropdown-list {
  background: #0f172a;
  border: 2px solid #475569;
  box-shadow: 0 20px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(148, 163, 184, 0.1);
}

[data-theme="dark"] .dropdown-item {
  border-bottom: 1px solid rgba(71, 85, 105, 0.5);
}

[data-theme="dark"] .dropdown-item:hover {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-left: 4px solid #8b5cf6;
}

[data-theme="dark"] .dropdown-item:hover::before {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
}

[data-theme="dark"] .dropdown-empty {
  color: #94a3b8;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

[data-theme="dark"] .participant-info .name,
[data-theme="dark"] .staff-info .name {
  color: #f1f5f9;
}

[data-theme="dark"] .participant-info .details,
[data-theme="dark"] .staff-info .role {
  color: #94a3b8;
}

[data-theme="dark"] .modal-actions {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-top: 1px solid rgba(71, 85, 105, 0.5);
}

[data-theme="dark"] .btn-cancel {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #f1f5f9;
  border: none;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
}

[data-theme="dark"] .btn-cancel:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

[data-theme="dark"] .btn-shift {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #f1f5f9;
  border: none;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
}

[data-theme="dark"] .btn-shift:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

[data-theme="dark"] .btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
}

[data-theme="dark"] .btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

[data-theme="dark"] .btn-view {
  background: #374151;
  border: 2px solid #6b7280;
  color: #f1f5f9;
}

[data-theme="dark"] .btn-view:hover:not(:disabled) {
  background: #4b5563;
  border-color: #9ca3af;
  color: #f1f5f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .btn-edit {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
}

[data-theme="dark"] .btn-edit:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

[data-theme="dark"] .btn-delete {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
}

[data-theme="dark"] .btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

/* Dark theme for other modal states */
[data-theme="dark"] .modal-header-shift-success {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
}

[data-theme="dark"] .modal-header-shift-info {
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%) !important;
}

[data-theme="dark"] .view-modal .detail-section {
  background: #0f172a;
  border: 1px solid #475569;
}

[data-theme="dark"] .detail-section h4 {
  color: #8b5cf6;
}

[data-theme="dark"] .detail-item .label {
  color: #94a3b8;
}

[data-theme="dark"] .detail-item .value {
  color: #f1f5f9;
}

[data-theme="dark"] .detail-item .value.total-cost {
  color: #8b5cf6;
}

[data-theme="dark"] .notes-content {
  background: #0f172a;
  border: 1px solid #475569;
  color: #f1f5f9;
}

[data-theme="dark"] .shift-summary {
  background: #0f172a;
  border: 1px solid #475569;
}

[data-theme="dark"] .shift-summary p {
  color: #f1f5f9;
}

[data-theme="dark"] .shift-summary strong {
  color: #94a3b8;
}

[data-theme="dark"] .delete-confirmation h4 {
  color: #f1f5f9;
}

[data-theme="dark"] .warning-text {
  background: rgba(217, 119, 6, 0.2);
  border: 1px solid #d97706;
  color: #fbbf24;
}

[data-theme="dark"] .shift-start-info h4,
[data-theme="dark"] .shift-complete-info h4 {
  color: #f1f5f9;
}

/* Dark Theme Critical Shifts ETA Card */
[data-theme="dark"] .eta-alert-card {
  background: linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-left: 4px solid #ef4444;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .eta-alert-card::before {
  background: linear-gradient(45deg, 
    #f87171, #ef4444, #dc2626, #f87171, #ef4444);
  opacity: 0.8;
}

[data-theme="dark"] .eta-alert-card::after {
  background: radial-gradient(ellipse at top right, 
    rgba(248, 113, 113, 0.15) 0%, 
    transparent 50%),
    radial-gradient(ellipse at bottom left, 
    rgba(239, 68, 68, 0.1) 0%, 
    transparent 50%);
}

[data-theme="dark"] .eta-icon {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  color: #fef2f2;
  box-shadow: 0 6px 20px rgba(248, 113, 113, 0.4);
}

[data-theme="dark"] .eta-title h3 {
  color: #f87171;
}

[data-theme="dark"] .eta-title p {
  color: #9ca3af;
}

[data-theme="dark"] .eta-shift-badge {
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .eta-shift-badge:hover {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

[data-theme="dark"] .eta-countdown-badge {
  background: #ef4444;
  color: white;
}

[data-theme="dark"] .eta-time {
  color: #f1f5f9;
}

[data-theme="dark"] .eta-participant-badge {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

[data-theme="dark"] .eta-staff-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

[data-theme="dark"] .eta-service-badge {
  background: rgba(251, 191, 36, 0.2);
  color: #fde047;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

[data-theme="dark"] .btn-eta-start {
  background: #dc2626;
  color: white;
}

[data-theme="dark"] .btn-eta-start:hover {
  background: #b91c1c;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
}

[data-theme="dark"] .eta-more {
  color: #9ca3af;
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
}

/* Dark theme pulse animation adjustments */
@keyframes etaPulseDark {
  0%, 100% {
    box-shadow: 
      0 20px 60px rgba(239, 68, 68, 0.25),
      0 8px 25px rgba(220, 38, 38, 0.15),
      inset 0 1px 0 rgba(248, 113, 113, 0.15);
  }
  50% {
    box-shadow: 
      0 25px 70px rgba(239, 68, 68, 0.4),
      0 12px 30px rgba(220, 38, 38, 0.25),
      inset 0 1px 0 rgba(248, 113, 113, 0.25);
  }
}

[data-theme="dark"] .eta-alert-card {
  animation: etaBackgroundShift 8s ease-in-out infinite, etaPulseDark 3s infinite;
}

/* Dark Theme Support for Scheduling Cards */
[data-theme="dark"] .participant-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}

[data-theme="dark"] .participant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(31, 41, 55, 0.88) 100%);
}

[data-theme="dark"] .participant-header {
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

[data-theme="dark"] .participant-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  color: white;
}

[data-theme="dark"] .participant-info h3 {
  color: #f9fafb;
  font-weight: 600;
}

[data-theme="dark"] .participant-info p,
[data-theme="dark"] .participant-ndis {
  color: #d1d5db;
}

[data-theme="dark"] .detail-row {
  background: rgba(55, 65, 81, 0.4);
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 8px;
  color: #e5e7eb;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

[data-theme="dark"] .detail-row:hover {
  background: rgba(55, 65, 81, 0.6);
  border-color: rgba(75, 85, 99, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transform: translateX(2px);
}

[data-theme="dark"] .detail-row i {
  color: #60a5fa;
}

[data-theme="dark"] .detail-row span {
  color: #f3f4f6;
}

[data-theme="dark"] .participant-actions {
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  padding-top: 1rem;
  margin-top: 1rem;
}

/* Action Buttons Light Theme */
.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #64748b;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  font-size: 0.875rem;
  backdrop-filter: blur(5px);
}

.action-btn:hover {
  background: rgba(248, 250, 252, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.view-btn {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.action-btn.view-btn:hover {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-color: #3b82f6;
  color: #1d4ed8;
}

.action-btn.edit-btn {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.action-btn.edit-btn:hover {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%);
  border-color: #f59e0b;
  color: #d97706;
}

.action-btn.delete-btn {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.action-btn.delete-btn:hover {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  border-color: #ef4444;
  color: #dc2626;
}

.action-btn.schedule-btn {
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.action-btn.schedule-btn:hover {
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%);
  border-color: #22c55e;
  color: #16a34a;
}

.action-btn.approve-btn {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.action-btn.approve-btn:hover {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%);
  border-color: #10b981;
  color: #059669;
}

/* Action Button Containers */
.participant-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
}

[data-theme="dark"] .participant-actions {
  border-top-color: rgba(75, 85, 99, 0.3);
}

[data-theme="dark"] .action-btn {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .action-btn:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(96, 165, 250, 0.4);
  transform: translateY(-2px);
}

[data-theme="dark"] .action-btn.view-btn {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

[data-theme="dark"] .action-btn.view-btn:hover {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%);
  border-color: #60a5fa;
  color: #93c5fd;
}

[data-theme="dark"] .action-btn.edit-btn {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

[data-theme="dark"] .action-btn.edit-btn:hover {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.15) 100%);
  border-color: #fbbf24;
  color: #fcd34d;
}

[data-theme="dark"] .action-btn.delete-btn {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

[data-theme="dark"] .action-btn.delete-btn:hover {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%);
  border-color: #f87171;
  color: #fca5a5;
}

[data-theme="dark"] .status-badge.scheduled {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

[data-theme="dark"] .status-badge.in_progress {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

[data-theme="dark"] .status-badge.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

[data-theme="dark"] .status-badge.cancelled {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Dark theme for shift urgency states */
[data-theme="dark"] .participant-card.shift-urgent {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%);
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1), 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .participant-card.shift-critical {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(220, 38, 38, 0.1) 100%);
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15), 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .participant-card.shift-in_progress {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .participant-card.shift-completed {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.08) 100%);
  border-color: rgba(107, 114, 128, 0.4);
  opacity: 0.8;
}


</style>

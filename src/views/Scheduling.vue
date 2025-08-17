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
        <div v-for="shift in filteredShifts" :key="shift.id" class="shift-card">
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
                <span><strong>Participant:</strong> {{ shift.participant_name }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-user-nurse"></i>
                <span><strong>Staff:</strong> {{ shift.staff_name }}</span>
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
            <button @click="viewShift(shift)" class="btn-small btn-outline">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button 
              v-if="shift.status === 'scheduled'" 
              @click="startShift(shift)" 
              class="btn-small btn-success"
            >
              <i class="fas fa-play"></i>
              Start
            </button>
            <button 
              v-if="shift.status === 'in_progress'" 
              @click="completeShift(shift)" 
              class="btn-small btn-success"
            >
              <i class="fas fa-check"></i>
              Complete
            </button>
            <button @click="editShift(shift)" class="btn-small btn-outline">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="cancelShift(shift)" class="btn-small btn-danger">
              <i class="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar View Placeholder -->
      <div v-else class="calendar-view">
        <div class="calendar-placeholder">
          <i class="fas fa-calendar-alt"></i>
          <h3>Calendar View</h3>
          <p>Calendar view implementation coming soon...</p>
          <p>For now, switch to List View to manage shifts.</p>
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
                <input v-model="newShift.start_time" type="time" required />
              </div>
              <div class="form-group">
                <label>End Time *</label>
                <input v-model="newShift.end_time" type="time" required />
              </div>
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
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
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
  </div>
</template>

<script>
export default {
  name: 'Scheduling',
  data() {
    return {
      shifts: [],
      filteredShifts: [],
      participants: [],
      staffMembers: [],
      searchQuery: '',
      statusFilter: '',
      dateFilter: '',
      participantFilter: '',
      currentView: 'list',
      isLoading: false,
      showAddModal: false,
      isSubmitting: false,
      newShift: {
        participant_id: '',
        staff_id: '',
        date: '',
        start_time: '',
        end_time: '',
        service_type: '',
        location: '',
        hourly_rate: 45.00,
        notes: '',
        send_notifications: true
      }
    }
  },
  computed: {
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
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.isLoading = true
      try {
        await Promise.all([
          this.loadShifts(),
          this.loadParticipants(),
          this.loadStaffMembers()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadShifts() {
      const stored = localStorage.getItem('crm_shifts')
      if (stored) {
        this.shifts = JSON.parse(stored)
      } else {
        // Initialize with sample data
        this.shifts = [
          {
            id: '1',
            participant_id: '1',
            participant_name: 'Alice Johnson',
            staff_id: '1',
            staff_name: 'Sarah Wilson',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            service_type: 'Personal Care',
            location: "Participant's Home",
            status: 'scheduled',
            hourly_rate: 45.00,
            notes: 'Morning routine assistance',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            participant_id: '2',
            participant_name: 'Michael Smith',
            staff_id: '1',
            staff_name: 'Sarah Wilson',
            start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
            service_type: 'Community Access',
            location: 'Community',
            status: 'scheduled',
            hourly_rate: 50.00,
            notes: 'Shopping assistance at local mall',
            created_at: new Date().toISOString()
          }
        ]
        this.saveShifts()
      }
      this.filterShifts()
    },

    async loadParticipants() {
      const stored = localStorage.getItem('crm_participants')
      if (stored) {
        this.participants = JSON.parse(stored).filter(p => p.is_active)
      }
    },

    async loadStaffMembers() {
      const stored = localStorage.getItem('crm_staff')
      if (stored) {
        this.staffMembers = JSON.parse(stored).filter(s => s.is_active)
      }
    },

    saveShifts() {
      localStorage.setItem('crm_shifts', JSON.stringify(this.shifts))
    },

    filterShifts() {
      let filtered = [...this.shifts]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(shift => 
          shift.participant_name.toLowerCase().includes(query) ||
          shift.staff_name.toLowerCase().includes(query) ||
          shift.service_type.toLowerCase().includes(query) ||
          shift.location.toLowerCase().includes(query)
        )
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(shift => shift.status === this.statusFilter)
      }

      if (this.participantFilter) {
        const query = this.participantFilter.toLowerCase()
        filtered = filtered.filter(shift => 
          shift.participant_name.toLowerCase().includes(query)
        )
      }
      
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
      
      // Sort by start time
      filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      
      this.filteredShifts = filtered
    },

    async addShift() {
      this.isSubmitting = true
      try {
        // Find participant and staff names
        const participant = this.participants.find(p => p.id === this.newShift.participant_id)
        const staff = this.staffMembers.find(s => s.id === this.newShift.staff_id)
        
        // Create datetime strings
        const startDateTime = new Date(`${this.newShift.date}T${this.newShift.start_time}`).toISOString()
        const endDateTime = new Date(`${this.newShift.date}T${this.newShift.end_time}`).toISOString()
        
        const newShift = {
          id: Date.now().toString(),
          participant_id: this.newShift.participant_id,
          participant_name: `${participant.first_name} ${participant.last_name}`,
          staff_id: this.newShift.staff_id,
          staff_name: `${staff.first_name} ${staff.last_name}`,
          start_time: startDateTime,
          end_time: endDateTime,
          service_type: this.newShift.service_type,
          location: this.newShift.location,
          status: 'scheduled',
          hourly_rate: parseFloat(this.newShift.hourly_rate),
          notes: this.newShift.notes,
          created_at: new Date().toISOString()
        }
        
        this.shifts.unshift(newShift)
        this.saveShifts()
        this.filterShifts()
        this.closeModal()
        
        this.showSuccessMessage('Shift scheduled successfully!')
        
      } catch (error) {
        console.error('Error scheduling shift:', error)
        alert('Error scheduling shift. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    viewShift(shift) {
      const duration = this.calculateDuration(shift.start_time, shift.end_time)
      const totalCost = (parseFloat(duration) * shift.hourly_rate).toFixed(2)
      
      alert(`📅 ${shift.service_type}\n👤 Participant: ${shift.participant_name}\n👩‍⚕️ Staff: ${shift.staff_name}\n📅 Date: ${this.formatDate(shift.start_time)}\n🕐 Time: ${this.formatTime(shift.start_time)} - ${this.formatTime(shift.end_time)}\n⏱️ Duration: ${duration}\n📍 Location: ${shift.location}\n💰 Rate: $${shift.hourly_rate}/hr\n💵 Total: $${totalCost}\n📝 Status: ${this.formatStatus(shift.status)}${shift.notes ? '\n📋 Notes: ' + shift.notes : ''}`)
    },

    startShift(shift) {
      if (confirm(`Start shift for ${shift.participant_name}?`)) {
        shift.status = 'in_progress'
        shift.actual_start_time = new Date().toISOString()
        this.saveShifts()
        this.filterShifts()
        this.showSuccessMessage('Shift started successfully!')
      }
    },

    completeShift(shift) {
      const notes = prompt('Add completion notes (optional):')
      if (notes !== null) {
        shift.status = 'completed'
        shift.actual_end_time = new Date().toISOString()
        if (notes.trim()) {
          shift.completion_notes = notes.trim()
        }
        this.saveShifts()
        this.filterShifts()
        this.showSuccessMessage('Shift completed successfully!')
      }
    },

    editShift(shift) {
      alert(`Edit functionality for shift with ${shift.participant_name} - Coming soon!`)
    },

    cancelShift(shift) {
      if (confirm(`Are you sure you want to cancel the shift for ${shift.participant_name}?`)) {
        shift.status = 'cancelled'
        this.saveShifts()
        this.filterShifts()
        this.showSuccessMessage('Shift cancelled successfully!')
      }
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

    showSuccessMessage(message) {
      const notification = document.createElement('div')
      notification.className = 'success-notification'
      notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`
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

.calendar-view {
  text-align: center;
  padding: 4rem 2rem;
}

.calendar-placeholder {
  color: var(--text-light);
}

.calendar-placeholder i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--text-light);
}

.calendar-placeholder h3 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
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

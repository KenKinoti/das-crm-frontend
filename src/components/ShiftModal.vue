<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-calendar-plus"></i>
          {{ mode === 'edit' ? 'Edit Shift' : 'Schedule New Shift' }}
        </h3>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Participant *</label>
            <div class="searchable-select">
              <input 
                v-model="participantSearch" 
                @input="filterParticipants"
                @focus="showParticipantDropdown = true"
                type="text" 
                placeholder="Search and select participant..."
                class="form-input"
              >
              <div v-if="showParticipantDropdown" class="dropdown-list">
                <div 
                  v-for="participant in filteredParticipants" 
                  :key="participant.id"
                  @click="selectParticipant(participant)"
                  class="dropdown-item"
                  :class="{ active: form.participant_id === participant.id }"
                >
                  {{ participant.first_name }} {{ participant.last_name }}
                  <small>{{ participant.ndis_number || 'No NDIS' }}</small>
                </div>
                <div v-if="filteredParticipants.length === 0" class="dropdown-item disabled">
                  No participants found
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Staff Member *</label>
            <div class="searchable-select">
              <input 
                v-model="staffSearch" 
                @input="filterStaff"
                @focus="showStaffDropdown = true"
                type="text" 
                placeholder="Search and select staff member..."
                class="form-input"
              >
              <div v-if="showStaffDropdown" class="dropdown-list">
                <div 
                  v-for="staff in filteredStaff" 
                  :key="staff.id"
                  @click="selectStaff(staff)"
                  class="dropdown-item"
                  :class="{ active: form.staff_id === staff.id }"
                >
                  {{ staff.first_name }} {{ staff.last_name }}
                  <small>{{ staff.role }}</small>
                </div>
                <div v-if="filteredStaff.length === 0" class="dropdown-item disabled">
                  No staff members found
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Date *</label>
              <input v-model="form.date" type="date" required>
            </div>
            <div class="form-group">
              <label>Duration (hours) *</label>
              <input v-model="form.duration_hours" type="number" min="0.5" max="24" step="0.5" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Start Time *</label>
              <input v-model="form.start_time" type="time" required>
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input v-model="calculatedEndTime" type="time" readonly>
            </div>
          </div>
          
          <div class="form-group">
            <label>Service Type</label>
            <select v-model="form.service_type">
              <option value="support_work">Support Work</option>
              <option value="personal_care">Personal Care</option>
              <option value="transport">Transport</option>
              <option value="community_access">Community Access</option>
              <option value="household_tasks">Household Tasks</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Add any special instructions or notes..."></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-schedule" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i>
                {{ mode === 'edit' ? 'Updating...' : 'Scheduling...' }}
              </span>
              <span v-else>
                <i class="fas fa-save"></i>
                {{ mode === 'edit' ? 'Update Shift' : 'Schedule Shift' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShiftModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create' // 'create' or 'edit'
    },
    shift: {
      type: Object,
      default: null
    },
    participants: {
      type: Array,
      default: () => []
    },
    staffMembers: {
      type: Array,
      default: () => []
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      form: {
        participant_id: '',
        staff_id: '',
        date: '',
        start_time: '',
        duration_hours: 2,
        service_type: 'support_work',
        notes: ''
      },
      participantSearch: '',
      staffSearch: '',
      showParticipantDropdown: false,
      showStaffDropdown: false,
      filteredParticipants: [],
      filteredStaff: []
    }
  },
  
  computed: {
    calculatedEndTime() {
      if (!this.form.start_time || !this.form.duration_hours) return ''
      
      const [hours, minutes] = this.form.start_time.split(':').map(Number)
      const totalMinutes = hours * 60 + minutes + (this.form.duration_hours * 60)
      
      const endHours = Math.floor(totalMinutes / 60) % 24
      const endMinutes = totalMinutes % 60
      
      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
    }
  },
  
  watch: {
    show(newVal) {
      if (newVal) {
        this.initializeForm()
      }
    }
  },
  
  methods: {
    initializeForm() {
      if (this.mode === 'edit' && this.shift) {
        this.form = {
          participant_id: this.shift.participant_id,
          staff_id: this.shift.staff_id,
          date: this.shift.date,
          start_time: this.shift.start_time,
          duration_hours: this.shift.duration_hours,
          service_type: this.shift.service_type || 'support_work',
          notes: this.shift.notes || ''
        }
        // Set search values for edit mode
        const participant = this.participants.find(p => p.id === this.shift.participant_id)
        const staff = this.staffMembers.find(s => s.id === this.shift.staff_id)
        this.participantSearch = participant ? `${participant.first_name} ${participant.last_name}` : ''
        this.staffSearch = staff ? `${staff.first_name} ${staff.last_name}` : ''
      } else {
        this.form = {
          participant_id: '',
          staff_id: '',
          date: new Date().toISOString().split('T')[0],
          start_time: '09:00',
          duration_hours: 2,
          service_type: 'support_work',
          notes: ''
        }
        this.participantSearch = ''
        this.staffSearch = ''
      }
      
      // Initialize filtered lists
      this.filteredParticipants = this.participants.filter(p => p.is_active !== false)
      this.filteredStaff = this.staffMembers.filter(s => s.is_active !== false)
    },
    
    filterParticipants() {
      const search = this.participantSearch.toLowerCase()
      this.filteredParticipants = this.participants.filter(p => {
        if (p.is_active === false) return false
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
        const ndis = (p.ndis_number || '').toLowerCase()
        return fullName.includes(search) || ndis.includes(search)
      })
      this.showParticipantDropdown = true
    },
    
    filterStaff() {
      const search = this.staffSearch.toLowerCase()
      this.filteredStaff = this.staffMembers.filter(s => {
        if (s.is_active === false) return false
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
        const role = (s.role || '').toLowerCase()
        return fullName.includes(search) || role.includes(search)
      })
      this.showStaffDropdown = true
    },
    
    selectParticipant(participant) {
      this.form.participant_id = participant.id
      this.participantSearch = `${participant.first_name} ${participant.last_name}`
      this.showParticipantDropdown = false
    },
    
    selectStaff(staff) {
      this.form.staff_id = staff.id
      this.staffSearch = `${staff.first_name} ${staff.last_name}`
      this.showStaffDropdown = false
    },
    
    handleSubmit() {
      const shiftData = {
        ...this.form,
        end_time: this.calculatedEndTime
      }
      
      this.$emit(this.mode === 'edit' ? 'update' : 'create', shiftData)
    },
    
    closeModal() {
      this.$emit('close')
    }
  },
  
  mounted() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.searchable-select')) {
        this.showParticipantDropdown = false
        this.showStaffDropdown = false
      }
    })
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  padding: 4px;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background: #4b5563;
}

.btn-schedule {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-schedule:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.searchable-select {
  position: relative;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f9fafb;
}

.dropdown-item.active {
  background-color: #667eea;
  color: white;
}

.dropdown-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  color: #9ca3af;
}

.dropdown-item small {
  display: block;
  font-size: 12px;
  opacity: 0.7;
  margin-top: 2px;
}

.dropdown-item.active small {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .dropdown-list {
    max-height: 150px;
  }
}
</style>
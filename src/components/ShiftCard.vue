<template>
  <div class="shift-card" :class="cardClasses">
    <div class="shift-header">
      <div class="shift-time">
        <i class="fas fa-clock"></i>
        {{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }}
      </div>
      <div class="shift-status">
        <span class="status-badge" :class="shift.status">{{ getStatusLabel(shift.status) }}</span>
      </div>
    </div>
    
    <div class="shift-content">
      <div class="participant-info">
        <i class="fas fa-user"></i>
        <span>{{ getParticipantName(shift.participant_id) }}</span>
      </div>
      
      <div class="staff-info">
        <i class="fas fa-user-tie"></i>
        <span>{{ getStaffName(shift.staff_id) }}</span>
      </div>
      
      <div v-if="shift.service_type" class="service-type">
        <i class="fas fa-handshake"></i>
        <span>{{ formatServiceType(shift.service_type) }}</span>
      </div>
      
      <div class="duration">
        <i class="fas fa-hourglass-half"></i>
        <span>{{ shift.duration_hours }}h</span>
      </div>
    </div>
    
    <div v-if="shift.notes" class="shift-notes">
      <i class="fas fa-sticky-note"></i>
      <span>{{ shift.notes }}</span>
    </div>
    
    <div v-if="showActions" class="shift-actions">
      <button 
        v-if="canViewShift" 
        @click="$emit('view', shift)" 
        class="btn-mini btn-view" 
        title="View Details"
      >
        <i class="fas fa-eye"></i>
      </button>
      
      <button 
        v-if="canStartShift" 
        @click="$emit('start', shift)" 
        class="btn-mini btn-start" 
        title="Start Shift"
      >
        <i class="fas fa-play"></i>
      </button>
      
      <button 
        v-if="canCompleteShift" 
        @click="$emit('complete', shift)" 
        class="btn-mini btn-complete" 
        title="Complete Shift"
      >
        <i class="fas fa-check"></i>
      </button>
      
      <button 
        v-if="canEditShift" 
        @click="$emit('edit', shift)" 
        class="btn-mini btn-edit" 
        title="Edit"
      >
        <i class="fas fa-edit"></i>
      </button>
      
      <button 
        v-if="canCancelShift" 
        @click="$emit('cancel', shift)" 
        class="btn-mini btn-cancel" 
        title="Cancel"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { performanceMixin } from '../mixins/performance'

export default {
  name: 'ShiftCard',
  mixins: [performanceMixin],
  
  props: {
    shift: {
      type: Object,
      required: true
    },
    participants: {
      type: Array,
      default: () => []
    },
    staffMembers: {
      type: Array,
      default: () => []
    },
    showActions: {
      type: Boolean,
      default: true
    },
    permissions: {
      type: Object,
      default: () => ({
        canView: true,
        canEdit: true,
        canStart: true,
        canComplete: true,
        canCancel: true
      })
    }
  },
  
  computed: {
    cardClasses() {
      return [
        `shift-${this.shift.status}`,
        {
          'shift-urgent': this.isUrgent,
          'shift-today': this.isToday
        }
      ]
    },
    
    isToday() {
      const today = new Date().toDateString()
      return new Date(this.shift.date).toDateString() === today
    },
    
    isUrgent() {
      const shiftDate = new Date(this.shift.date)
      const now = new Date()
      const diffHours = (shiftDate - now) / (1000 * 60 * 60)
      return diffHours < 24 && diffHours > 0
    },
    
    canViewShift() {
      return this.permissions.canView
    },
    
    canStartShift() {
      return this.permissions.canStart && this.shift.status === 'scheduled'
    },
    
    canCompleteShift() {
      return this.permissions.canComplete && this.shift.status === 'in_progress'
    },
    
    canEditShift() {
      return this.permissions.canEdit && ['scheduled', 'in_progress'].includes(this.shift.status)
    },
    
    canCancelShift() {
      return this.permissions.canCancel && this.shift.status !== 'completed' && this.shift.status !== 'cancelled'
    }
  },
  
  methods: {
    getParticipantName(participantId) {
      const participant = this.participants.find(p => p.id === participantId)
      return participant ? `${participant.first_name} ${participant.last_name}` : 'Unknown Participant'
    },
    
    getStaffName(staffId) {
      const staff = this.staffMembers.find(s => s.id === staffId)
      return staff ? `${staff.first_name} ${staff.last_name}` : 'Unassigned'
    },
    
    formatTime(timeString) {
      if (!timeString) return 'N/A'
      
      try {
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const minute = minutes || '00'
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour > 12 ? hour - 12 : hour || 12
        
        return `${displayHour}:${minute} ${period}`
      } catch (error) {
        return timeString
      }
    },
    
    getStatusLabel(status) {
      const statusMap = {
        scheduled: 'Scheduled',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        no_show: 'No Show'
      }
      return statusMap[status] || status
    },
    
    formatServiceType(type) {
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }
}
</script>

<style scoped>
.shift-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border-left: 4px solid #e5e7eb;
  position: relative;
}

.shift-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.shift-card.shift-scheduled {
  border-left-color: #3b82f6;
}

.shift-card.shift-in_progress {
  border-left-color: #f59e0b;
}

.shift-card.shift-completed {
  border-left-color: #10b981;
}

.shift-card.shift-cancelled {
  border-left-color: #ef4444;
  opacity: 0.8;
}

.shift-card.shift-urgent {
  border-left-color: #dc2626 !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%);
}

.shift-card.shift-today {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%);
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.shift-time {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.scheduled {
  background: #dbeafe;
  color: #1d4ed8;
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

.shift-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.shift-content > div {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.shift-content i {
  width: 16px;
  color: #9ca3af;
}

.shift-notes {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.shift-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-mini {
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.btn-view {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.btn-start {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-complete {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-edit {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-cancel {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-mini:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .shift-card {
    padding: 16px;
  }
  
  .shift-content {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .shift-actions {
    justify-content: center;
  }
}
</style>
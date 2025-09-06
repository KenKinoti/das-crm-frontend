<template>
  <div class="availability-container">
    <!-- Header Section -->
    <div class="page-header mb-6">
      <div class="header-content">
        <div>
          <h1 class="page-title">My Availability</h1>
          <p class="page-description">Set your preferred work hours and availability preferences</p>
        </div>
        <div class="header-actions">
          <button @click="saveAll" :disabled="loading" class="btn-primary">
            <i class="fas fa-save me-2"></i>
            {{ loading ? 'Saving...' : 'Save All Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="alert" :class="`alert-${messageType}`">
      <i class="fas" :class="messageType === 'success' ? 'fa-check-circle' : messageType === 'error' ? 'fa-exclamation-triangle' : messageType === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'"></i>
      {{ message }}
    </div>

    <!-- Main Content -->
    <div class="availability-grid">
      <!-- Weekly Availability Section -->
      <div class="availability-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-calendar-week me-2"></i>
            Weekly Availability
          </h2>
          <p class="section-description">Set your regular weekly working hours</p>
        </div>

        <div class="availability-form">
          <div v-for="day in weekDays" :key="day.value" class="day-row">
            <div class="day-header">
              <div class="day-toggle">
                <input 
                  :id="`day-${day.value}`"
                  type="checkbox" 
                  v-model="availability[day.value].available"
                  class="toggle-switch"
                >
                <label :for="`day-${day.value}`" class="toggle-label">
                  <span class="day-name">{{ day.name }}</span>
                </label>
              </div>
            </div>

            <div v-if="availability[day.value].available" class="time-slots">
              <div class="time-slot">
                <label class="time-label">Start Time</label>
                <input 
                  type="time" 
                  v-model="availability[day.value].start"
                  class="time-input"
                >
              </div>
              <div class="time-slot">
                <label class="time-label">End Time</label>
                <input 
                  type="time" 
                  v-model="availability[day.value].end"
                  class="time-input"
                >
              </div>
              <div class="capacity-slot">
                <label class="time-label">Max Hours</label>
                <input 
                  type="number" 
                  v-model.number="availability[day.value].maxHours"
                  min="1" 
                  max="12" 
                  class="capacity-input"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Work Preferences Section -->
      <div class="preferences-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-user-cog me-2"></i>
            Work Preferences
          </h2>
          <p class="section-description">Set your work preferences and capacity</p>
        </div>

        <div class="preferences-form">
          <!-- Preferred Hours Per Week -->
          <div class="preference-group">
            <label class="preference-label">
              <i class="fas fa-clock me-2"></i>
              Preferred Hours Per Week
            </label>
            <div class="slider-container">
              <input 
                type="range" 
                :value="preferences.preferred_hours_per_week"
                @input="updatePreference('preferred_hours_per_week', Number($event.target.value))"
                min="10" 
                max="40" 
                class="hours-slider"
              >
              <div class="slider-value">{{ preferences.preferred_hours_per_week }} hours</div>
            </div>
          </div>

          <!-- Maximum Hours Per Week -->
          <div class="preference-group">
            <label class="preference-label">
              <i class="fas fa-hourglass-half me-2"></i>
              Maximum Hours Per Week
            </label>
            <div class="slider-container">
              <input 
                type="range" 
                :value="preferences.max_hours_per_week"
                @input="updatePreference('max_hours_per_week', Number($event.target.value))"
                min="20" 
                max="50" 
                class="hours-slider"
              >
              <div class="slider-value">{{ preferences.max_hours_per_week }} hours</div>
            </div>
          </div>

          <!-- Simplified - removed for cleaner interface -->

          <!-- Weekend Work -->
          <div class="preference-group">
            <label class="preference-label">
              <i class="fas fa-calendar-weekend me-2"></i>
              Available for Weekend Work
            </label>
            <div class="toggle-container">
              <input 
                id="weekend-toggle"
                type="checkbox" 
                :checked="preferences.willing_weekend_work"
                @change="updatePreference('willing_weekend_work', $event.target.checked)"
                class="toggle-switch"
              >
              <label for="weekend-toggle" class="toggle-switch-label">
                <span>{{ preferences.willing_weekend_work ? 'Yes' : 'No' }}</span>
              </label>
            </div>
          </div>

          <!-- Evening Work -->
          <div class="preference-group">
            <label class="preference-label">
              <i class="fas fa-moon me-2"></i>
              Available for Evening Work
            </label>
            <div class="toggle-container">
              <input 
                id="evening-toggle"
                type="checkbox" 
                :checked="preferences.willing_evening_work"
                @change="updatePreference('willing_evening_work', $event.target.checked)"
                class="toggle-switch"
              >
              <label for="evening-toggle" class="toggle-switch-label">
                <span>{{ preferences.willing_evening_work ? 'Yes' : 'No' }}</span>
              </label>
            </div>
          </div>

          <!-- Simplified interface - keeping core preferences only -->
        </div>
      </div>

      <!-- Skills Section - simplified for care workers -->
      <div class="skills-section" v-if="false">
        <!-- Hidden to keep interface simple -->
      </div>

      <!-- Location Preferences Section - simplified for care workers -->
      <div class="locations-section" v-if="false">
        <!-- Hidden to keep interface simple -->
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Saving your availability settings...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useAvailabilityStore } from '@/stores/availability'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Availability',
  setup() {
    const availabilityStore = useAvailabilityStore()
    const authStore = useAuthStore()
    
    const message = ref('')
    const messageType = ref('success')
    const newSkill = ref({ name: '', level: 'intermediate' })
    const newLocation = ref('')

    const weekDays = [
      { name: 'Monday', value: 'monday' },
      { name: 'Tuesday', value: 'tuesday' },
      { name: 'Wednesday', value: 'wednesday' },
      { name: 'Thursday', value: 'thursday' },
      { name: 'Friday', value: 'friday' },
      { name: 'Saturday', value: 'saturday' },
      { name: 'Sunday', value: 'sunday' }
    ]

    // Computed properties for easy access
    const availability = computed(() => availabilityStore.availabilityForm)
    const preferences = computed(() => availabilityStore.preferences || availabilityStore.preferencesDefaults)
    const skills = computed(() => availabilityStore.skills)
    const locations = computed(() => availabilityStore.locationPreferences)
    const loading = computed(() => availabilityStore.isLoading)

    const showMessage = (msg, type = 'success') => {
      message.value = msg
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }

    const loadAvailabilityData = async () => {
      try {
        await availabilityStore.initializeAvailability()
        if (availabilityStore.hasConfiguredAvailability) {
          availabilityStore.populateFormFromAvailability()
        }
      } catch (error) {
        console.error('Error loading availability data:', error)
        showMessage('⚠️ Failed to load your availability data. Please refresh the page.', 'error')
      }
    }

    const saveAll = async () => {
      try {
        console.log('Save button clicked!')
        console.log('Current availability form data:', availability.value)
        
        // Show immediate feedback with loading state
        showMessage('💾 Saving your availability settings...', 'info')
        
        // Validate that at least one day is selected
        const hasAvailableDay = Object.values(availability.value).some(day => day.available)
        console.log('Has available day:', hasAvailableDay)
        
        if (!hasAvailableDay) {
          showMessage('⚠️ Please select at least one available day before saving your preferences.', 'error')
          return
        }

        console.log('Calling saveAvailabilityFromForm...')
        // Save availability from form
        await availabilityStore.saveAvailabilityFromForm()
        console.log('saveAvailabilityFromForm completed successfully')

        // Save preferences if they exist
        if (availabilityStore.preferences) {
          console.log('Saving preferences:', availabilityStore.preferences)
          await availabilityStore.saveWorkerPreferences(availabilityStore.preferences)
        }

        // Show professional success message with status
        showMessage('✅ Excellent! Your availability has been saved successfully. You\'re all set to receive shift assignments during your available hours.', 'success')

      } catch (error) {
        console.error('Error saving availability:', error)
        console.error('Error details:', error.response?.data)
        showMessage('❌ ' + (availabilityStore.error || error.response?.data?.error?.message || 'Unable to save your availability at the moment. Please check your internet connection and try again.'), 'error')
      }
    }

    const addSkill = async () => {
      if (newSkill.value.name.trim()) {
        try {
          await availabilityStore.addWorkerSkill({
            skill_category: 'General',
            skill_name: newSkill.value.name.trim(),
            proficiency_level: newSkill.value.level
          })
          newSkill.value = { name: '', level: 'intermediate' }
          showMessage('🏆 Skill added successfully to your profile!', 'success')
        } catch (error) {
          console.error('Error adding skill:', error)
          showMessage('❌ Failed to add skill to your profile', 'error')
        }
      }
    }

    const removeSkill = async (skill) => {
      try {
        await availabilityStore.deleteWorkerSkill(skill.id)
        showMessage('🗑️ Skill removed successfully from your profile!', 'success')
      } catch (error) {
        console.error('Error removing skill:', error)
        showMessage('❌ Failed to remove skill from your profile', 'error')
      }
    }

    const addLocation = async () => {
      if (newLocation.value.trim()) {
        try {
          // Note: This would need to be implemented in the store/service
          // For now, we'll just show a message
          showMessage('🚧 Location preferences feature coming soon!', 'warning')
          newLocation.value = ''
        } catch (error) {
          console.error('Error adding location:', error)
          showMessage('Failed to add location preference', 'error')
        }
      }
    }

    const removeLocation = async (location) => {
      try {
        // Note: This would need to be implemented in the store/service
        showMessage('🚧 Location preferences feature coming soon!', 'warning')
      } catch (error) {
        console.error('Error removing location:', error)
        showMessage('Failed to remove location preference', 'error')
      }
    }

    // Update preferences reactively
    const updatePreference = (key, value) => {
      if (availabilityStore.preferences) {
        availabilityStore.preferences[key] = value
      } else {
        availabilityStore.preferencesDefaults[key] = value
      }
    }

    onMounted(() => {
      loadAvailabilityData()
    })

    return {
      loading,
      message,
      messageType,
      weekDays,
      availability,
      preferences,
      skills,
      newSkill,
      locations,
      newLocation,
      saveAll,
      addSkill,
      removeSkill,
      addLocation,
      removeLocation,
      updatePreference,
      // Store getters
      hasConfiguredAvailability: computed(() => availabilityStore.hasConfiguredAvailability),
      totalWeeklyHours: computed(() => availabilityStore.totalWeeklyHours),
      capacitySummary: computed(() => availabilityStore.capacitySummary),
    }
  }
}
</script>

<style scoped>
.availability-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.25rem;
  min-height: 100vh;
}

/* Header Styling */
.page-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

[data-theme="dark"] .page-header {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(71, 85, 105, 0.8);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

[data-theme="dark"] .page-title {
  color: #f8fafc;
}

.page-description {
  color: #64748b;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
}

[data-theme="dark"] .page-description {
  color: #94a3b8;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Button Styling */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alert Styling */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-info {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

/* Grid Layout */
.availability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

/* Section Styling */
.availability-section,
.preferences-section,
.skills-section,
.locations-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

[data-theme="dark"] .availability-section,
[data-theme="dark"] .preferences-section,
[data-theme="dark"] .skills-section,
[data-theme="dark"] .locations-section {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(71, 85, 105, 0.8);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
}

[data-theme="dark"] .section-title {
  color: #f8fafc;
}

.section-description {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

[data-theme="dark"] .section-description {
  color: #94a3b8;
}

/* Day Row Styling */
.day-row {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: all 0.3s ease;
}

[data-theme="dark"] .day-row {
  background: rgba(51, 65, 85, 0.8);
  border-color: rgba(71, 85, 105, 0.6);
}

.day-row:hover {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(148, 163, 184, 0.8);
}

[data-theme="dark"] .day-row:hover {
  background: rgba(71, 85, 105, 0.9);
  border-color: rgba(100, 116, 139, 0.8);
}

.day-header {
  min-width: 120px;
}

.day-toggle {
  display: flex;
  align-items: center;
}

.toggle-switch {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #cbd5e1;
  position: relative;
  cursor: pointer;
  margin-right: 0.75rem;
}

.toggle-switch:checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.toggle-switch:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.day-name {
  font-weight: 500;
  color: #374151;
}

[data-theme="dark"] .day-name {
  color: #f3f4f6;
}

.time-slots {
  display: flex;
  gap: 1rem;
  flex: 1;
  margin-left: 1rem;
}

.time-slot,
.capacity-slot {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

[data-theme="dark"] .time-label {
  color: #9ca3af;
}

.time-input,
.capacity-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
}

[data-theme="dark"] .time-input,
[data-theme="dark"] .capacity-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.capacity-input {
  width: 80px;
}

/* Preferences Styling */
.preference-group {
  margin-bottom: 1.5rem;
}

.preference-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

[data-theme="dark"] .preference-label {
  color: #f3f4f6;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hours-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
}

.hours-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hours-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-value {
  min-width: 80px;
  text-align: right;
  font-weight: 500;
  color: #667eea;
  font-size: 0.875rem;
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  margin-left: 0.75rem;
}

/* Skills Styling */
.skill-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skill-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
}

[data-theme="dark"] .skill-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.skill-level {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  min-width: 120px;
}

[data-theme="dark"] .skill-level {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.btn-add-skill,
.btn-add-location {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 44px;
}

.btn-add-skill:hover,
.btn-add-location:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.skills-list,
.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag,
.location-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  font-size: 0.875rem;
}

.skill-name,
.location-name {
  font-weight: 500;
}

.skill-level-badge {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.level-beginner { background: rgba(239, 68, 68, 0.2); color: #dc2626; }
.level-intermediate { background: rgba(245, 158, 11, 0.2); color: #d97706; }
.level-advanced { background: rgba(16, 185, 129, 0.2); color: #059669; }
.level-expert { background: rgba(99, 102, 241, 0.2); color: #6366f1; }

.skill-remove,
.location-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.skill-remove:hover,
.location-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Locations Styling */
.location-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.location-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
}

[data-theme="dark"] .location-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

/* Loading Overlay */
.loading-overlay {
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

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .loading-spinner {
  background: #1e293b;
  color: #f8fafc;
}

.loading-spinner i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.loading-spinner p {
  margin: 0;
  color: #64748b;
  font-weight: 500;
}

[data-theme="dark"] .loading-spinner p {
  color: #94a3b8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .availability-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-slots {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .day-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .skill-input-group,
  .location-input-group {
    flex-direction: column;
  }
}
</style>
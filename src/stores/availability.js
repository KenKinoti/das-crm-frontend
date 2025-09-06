/**
 * =============================================================================
 * Worker Availability Store - DASYIN PRO Healthcare Management System
 * =============================================================================
 * 
 * This store manages worker availability patterns, preferences, skills,
 * and capacity data across the application.
 * 
 * =============================================================================
 */

import { defineStore } from 'pinia'
import { availabilityService } from '../services/availability'
import { useAuthStore } from './auth'

export const useAvailabilityStore = defineStore('availability', {
  state: () => ({
    // Availability patterns
    weeklyAvailability: [],
    availabilityTemplate: null,
    
    // Worker preferences
    preferences: null,
    preferencesDefaults: {
      max_hours_per_week: 38.0,
      preferred_hours_per_week: 30.0,
      max_consecutive_days: 5,
      min_hours_between_shifts: 10,
      max_travel_distance_km: 50,
      preferred_shift_types: [],
      willing_weekend_work: true,
      willing_evening_work: true,
      willing_early_morning_work: true,
      requires_own_transport: false,
      has_own_vehicle: true,
      special_skills: [],
      client_preferences: '',
      notification_preferences: {
        email: true,
        sms: true,
        app: true,
        shift_reminders: true,
        schedule_updates: true
      }
    },
    
    // Worker skills
    skills: [],
    skillCategories: [
      'Safety', 'Healthcare', 'Physical', 'Communication', 'Transport',
      'Administration', 'Technology', 'Specialized Care', 'Emergency Response'
    ],
    expiringSkills: [],
    
    // Location preferences
    locationPreferences: [],
    
    // Availability exceptions (time off, special availability)
    exceptions: [],
    
    // Capacity data
    capacitySummary: null,
    weeklyCapacity: [],
    availabilityConflicts: [],
    
    // UI state
    isLoading: false,
    error: null,
    isEditing: false,
    currentUserId: null,
    
    // Form data for the availability setup
    availabilityForm: {
      monday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
      tuesday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
      wednesday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
      thursday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
      friday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
      saturday: { available: false, start: '09:00', end: '14:00', maxHours: 5, preferredHours: 4 },
      sunday: { available: false, start: '10:00', end: '16:00', maxHours: 6, preferredHours: 4 }
    }
  }),

  getters: {
    // Check if user has configured their availability
    hasConfiguredAvailability: (state) => {
      return state.weeklyAvailability && state.weeklyAvailability.length > 0
    },

    // Check if user has configured their preferences
    hasConfiguredPreferences: (state) => {
      return state.preferences !== null && !state.preferences.is_default
    },

    // Get available days count
    availableDaysCount: (state) => {
      return state.weeklyAvailability.filter(day => day.is_available).length
    },

    // Calculate total weekly hours
    totalWeeklyHours: (state) => {
      return state.weeklyAvailability.reduce((total, day) => {
        if (day.is_available) {
          // Parse time strings to calculate hours
          const [startHour, startMin] = day.start_time.split(':').map(Number)
          const [endHour, endMin] = day.end_time.split(':').map(Number)
          const startMinutes = startHour * 60 + startMin
          const endMinutes = endHour * 60 + endMin
          const dayHours = (endMinutes - startMinutes - (day.break_duration_minutes || 30)) / 60
          return total + Math.max(0, dayHours)
        }
        return total
      }, 0)
    },

    // Get formatted availability for display
    formattedWeeklyAvailability: (state) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      
      return dayNames.map((dayName, index) => {
        const availability = state.weeklyAvailability.find(day => day.day_of_week === index)
        return {
          dayName,
          dayOfWeek: index,
          ...availability,
          isConfigured: !!availability
        }
      })
    },

    // Get capacity utilization percentage
    capacityUtilization: (state) => {
      if (!state.capacitySummary?.capacity?.weekly_available_hours || 
          !state.capacitySummary?.capacity?.weekly_preferred_hours) {
        return 0
      }
      
      return Math.round(
        (state.capacitySummary.capacity.weekly_preferred_hours / 
         state.capacitySummary.capacity.weekly_available_hours) * 100
      )
    },

    // Get skills by category
    skillsByCategory: (state) => {
      return state.skillCategories.reduce((acc, category) => {
        acc[category] = state.skills.filter(skill => skill.skill_category === category)
        return acc
      }, {})
    },

    // Get expired skills
    expiredSkills: (state) => {
      return state.skills.filter(skill => skill.is_expired)
    },

    // Get skills expiring soon
    skillsExpiringSoon: (state) => {
      return state.skills.filter(skill => skill.is_expiring_soon && !skill.is_expired)
    },

    // Check if availability setup is complete
    isAvailabilitySetupComplete: (state) => {
      return state.hasConfiguredAvailability && 
             state.hasConfiguredPreferences && 
             state.skills.length > 0
    }
  },

  actions: {
    // Initialize availability data for a user
    async initializeAvailability(userId = null) {
      this.isLoading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        this.currentUserId = userId || authStore.user?.id
        
        // Load all availability data in parallel
        await Promise.all([
          this.fetchAvailability(this.currentUserId),
          this.fetchWorkerPreferences(this.currentUserId),
          this.fetchWorkerSkills(this.currentUserId),
          this.fetchLocationPreferences(this.currentUserId),
          this.fetchCapacitySummary(this.currentUserId)
        ])

        // Load template if no availability exists
        if (!this.hasConfiguredAvailability) {
          await this.fetchAvailabilityTemplate()
        }

      } catch (error) {
        console.error('Failed to initialize availability:', error)
        this.error = error.response?.data?.error?.message || error.message
      } finally {
        this.isLoading = false
      }
    },

    // Fetch weekly availability patterns
    async fetchAvailability(userId = null) {
      try {
        const response = await availabilityService.getAvailability(userId)
        this.weeklyAvailability = response.data.availability || []
      } catch (error) {
        console.error('Failed to fetch availability:', error)
        throw error
      }
    },

    // Create or update availability
    async saveAvailability(availabilityData, replaceAll = true) {
      this.isLoading = true
      this.error = null

      try {
        const response = await availabilityService.bulkUpdateAvailability({
          availability: availabilityData,
          replace_all: replaceAll
        })
        
        this.weeklyAvailability = response.data.availability || []
        
        // Refresh capacity summary
        await this.fetchCapacitySummary(this.currentUserId)
        
        return response.data
      } catch (error) {
        console.error('Failed to save availability:', error)
        this.error = error.response?.data?.error?.message || error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Save availability from form data
    async saveAvailabilityFromForm() {
      console.log('saveAvailabilityFromForm called')
      console.log('Form data:', this.availabilityForm)
      
      const availabilityData = []
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      
      dayNames.forEach((dayName, index) => {
        const dayData = this.availabilityForm[dayName]
        if (dayData) {
          availabilityData.push({
            day_of_week: index,
            day_name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            start_time: dayData.start,
            end_time: dayData.end,
            is_available: dayData.available,
            max_hours_per_day: dayData.maxHours || 8,
            preferred_hours_per_day: dayData.preferredHours || 6,
            break_duration_minutes: 30,
            travel_time_minutes: 30
          })
        }
      })

      console.log('Processed availability data:', availabilityData)
      return await this.saveAvailability(availabilityData)
    },

    // Fetch availability template
    async fetchAvailabilityTemplate() {
      try {
        const response = await availabilityService.getAvailabilityTemplate()
        this.availabilityTemplate = response.data.template
        
        // Update form with template data if no current availability
        if (!this.hasConfiguredAvailability && this.availabilityTemplate) {
          this.populateFormFromTemplate()
        }
      } catch (error) {
        console.error('Failed to fetch availability template:', error)
      }
    },

    // Populate form from template
    populateFormFromTemplate() {
      if (!this.availabilityTemplate) return

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      
      this.availabilityTemplate.forEach(templateDay => {
        const dayName = dayNames[templateDay.day_of_week]
        if (dayName && this.availabilityForm[dayName]) {
          this.availabilityForm[dayName] = {
            available: templateDay.is_available,
            start: templateDay.start_time,
            end: templateDay.end_time,
            maxHours: templateDay.max_hours_per_day,
            preferredHours: templateDay.preferred_hours_per_day
          }
        }
      })
    },

    // Populate form from existing availability
    populateFormFromAvailability() {
      if (!this.weeklyAvailability.length) return

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      
      // Reset form first
      this.resetAvailabilityForm()

      this.weeklyAvailability.forEach(availability => {
        const dayName = dayNames[availability.day_of_week]
        if (dayName && this.availabilityForm[dayName]) {
          this.availabilityForm[dayName] = {
            available: availability.is_available,
            start: availability.start_time,
            end: availability.end_time,
            maxHours: availability.max_hours_per_day,
            preferredHours: availability.preferred_hours_per_day
          }
        }
      })
    },

    // Reset availability form
    resetAvailabilityForm() {
      this.availabilityForm = {
        monday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
        tuesday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
        wednesday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
        thursday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
        friday: { available: true, start: '08:00', end: '17:00', maxHours: 8, preferredHours: 6 },
        saturday: { available: false, start: '09:00', end: '14:00', maxHours: 5, preferredHours: 4 },
        sunday: { available: false, start: '10:00', end: '16:00', maxHours: 6, preferredHours: 4 }
      }
    },

    // Worker Preferences Actions
    async fetchWorkerPreferences(userId = null) {
      try {
        const response = await availabilityService.getWorkerPreferences(userId)
        this.preferences = response.data.preferences
      } catch (error) {
        console.error('Failed to fetch worker preferences:', error)
        throw error
      }
    },

    async saveWorkerPreferences(preferencesData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await availabilityService.createOrUpdateWorkerPreferences(preferencesData)
        this.preferences = response.data.preferences
        
        // Refresh capacity summary
        await this.fetchCapacitySummary(this.currentUserId)
        
        return response.data
      } catch (error) {
        console.error('Failed to save worker preferences:', error)
        this.error = error.response?.data?.error?.message || error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Worker Skills Actions
    async fetchWorkerSkills(userId = null) {
      try {
        const response = await availabilityService.getWorkerSkills(userId)
        this.skills = response.data.skills || []
      } catch (error) {
        console.error('Failed to fetch worker skills:', error)
        throw error
      }
    },

    async addWorkerSkill(skillData) {
      try {
        const response = await availabilityService.createWorkerSkill(skillData)
        this.skills.push(response.data.skill)
        return response.data
      } catch (error) {
        console.error('Failed to add worker skill:', error)
        this.error = error.response?.data?.error?.message || error.message
        throw error
      }
    },

    async updateWorkerSkill(skillId, skillData) {
      try {
        const response = await availabilityService.updateWorkerSkill(skillId, skillData)
        const index = this.skills.findIndex(skill => skill.id === skillId)
        if (index !== -1) {
          this.skills[index] = response.data.skill
        }
        return response.data
      } catch (error) {
        console.error('Failed to update worker skill:', error)
        this.error = error.response?.data?.error?.message || error.message
        throw error
      }
    },

    async deleteWorkerSkill(skillId) {
      try {
        await availabilityService.deleteWorkerSkill(skillId)
        this.skills = this.skills.filter(skill => skill.id !== skillId)
      } catch (error) {
        console.error('Failed to delete worker skill:', error)
        this.error = error.response?.data?.error?.message || error.message
        throw error
      }
    },

    // Location Preferences Actions
    async fetchLocationPreferences(userId = null) {
      try {
        const response = await availabilityService.getLocationPreferences(userId)
        this.locationPreferences = response.data.locations || []
      } catch (error) {
        console.error('Failed to fetch location preferences:', error)
        throw error
      }
    },

    // Capacity Actions
    async fetchCapacitySummary(userId = null) {
      try {
        const response = await availabilityService.getCapacitySummary(userId)
        this.capacitySummary = response.data
      } catch (error) {
        console.error('Failed to fetch capacity summary:', error)
        throw error
      }
    },

    // Start editing mode
    startEditing() {
      this.isEditing = true
      if (this.hasConfiguredAvailability) {
        this.populateFormFromAvailability()
      } else if (this.availabilityTemplate) {
        this.populateFormFromTemplate()
      }
    },

    // Cancel editing mode
    cancelEditing() {
      this.isEditing = false
      this.error = null
      this.resetAvailabilityForm()
    },

    // Clear all data
    clearStore() {
      this.weeklyAvailability = []
      this.availabilityTemplate = null
      this.preferences = null
      this.skills = []
      this.locationPreferences = []
      this.exceptions = []
      this.capacitySummary = null
      this.weeklyCapacity = []
      this.availabilityConflicts = []
      this.isLoading = false
      this.error = null
      this.isEditing = false
      this.currentUserId = null
      this.resetAvailabilityForm()
    }
  }
})

export default useAvailabilityStore
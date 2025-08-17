import { defineStore } from 'pinia'
import { shiftsService } from '../services/shifts'

export const useShiftsStore = defineStore('shifts', {
  state: () => ({
    shifts: [],
    currentShift: null,
    isLoading: false,
    error: null,
    filters: {
      status: '',
      dateRange: '',
      participantId: '',
      staffId: ''
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    filteredShifts: (state) => {
      let filtered = [...state.shifts]
      
      if (state.filters.status) {
        filtered = filtered.filter(shift => shift.status === state.filters.status)
      }
      
      if (state.filters.participantId) {
        filtered = filtered.filter(shift => shift.participant_id === state.filters.participantId)
      }
      
      if (state.filters.staffId) {
        filtered = filtered.filter(shift => shift.staff_id === state.filters.staffId)
      }
      
      return filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    },

    todayShifts: (state) => {
      const today = new Date().toDateString()
      return state.shifts.filter(shift => 
        new Date(shift.start_time).toDateString() === today
      )
    },

    upcomingShifts: (state) => {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return state.shifts.filter(shift => {
        const shiftDate = new Date(shift.start_time)
        return shiftDate >= now && shiftDate <= nextWeek
      })
    },

    shiftsByStatus: (state) => {
      return state.shifts.reduce((acc, shift) => {
        acc[shift.status] = (acc[shift.status] || 0) + 1
        return acc
      }, {})
    }
  },

  actions: {
    async fetchShifts(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await shiftsService.getAll(params)
        this.shifts = response.data.shifts || response.data
        this.pagination = response.data.pagination || this.pagination
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch shifts'
        console.error('Error fetching shifts:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchShift(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await shiftsService.getById(id)
        this.currentShift = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch shift'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createShift(shiftData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await shiftsService.create(shiftData)
        this.shifts.unshift(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create shift'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateShift(id, shiftData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await shiftsService.update(id, shiftData)
        const index = this.shifts.findIndex(shift => shift.id === id)
        if (index !== -1) {
          this.shifts[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update shift'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateShiftStatus(id, status, additionalData = {}) {
      try {
        const response = await shiftsService.updateStatus(id, { status, ...additionalData })
        const index = this.shifts.findIndex(shift => shift.id === id)
        if (index !== -1) {
          this.shifts[index] = { ...this.shifts[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update shift status'
        throw error
      }
    },

    async startShift(id) {
      return this.updateShiftStatus(id, 'in_progress', {
        actual_start_time: new Date().toISOString()
      })
    },

    async completeShift(id, completionNotes = '') {
      return this.updateShiftStatus(id, 'completed', {
        actual_end_time: new Date().toISOString(),
        completion_notes: completionNotes
      })
    },

    async cancelShift(id, reason = '') {
      return this.updateShiftStatus(id, 'cancelled', { cancellation_reason: reason })
    },

    async deleteShift(id) {
      try {
        await shiftsService.delete(id)
        this.shifts = this.shifts.filter(shift => shift.id !== id)
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete shift'
        throw error
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        status: '',
        dateRange: '',
        participantId: '',
        staffId: ''
      }
    },

    clearError() {
      this.error = null
    }
  }
})
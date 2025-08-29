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
        // Handle different response structures
        const responseData = response.data || response
        this.shifts = responseData.shifts || responseData || []
        this.pagination = responseData.pagination || this.pagination
      } catch (error) {
        console.error('Error fetching shifts:', error)
        this.error = error.response?.data?.message || error.message || 'Failed to fetch shifts'
        // Set empty array on error to prevent UI issues
        this.shifts = []
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
        console.log('Store: Creating shift via API...')
        console.log('Store: Shift data being sent:', shiftData)
        const response = await shiftsService.create(shiftData)
        console.log('Store: API response received:', response)
        const newShift = response.data || response
        this.shifts.unshift(newShift)
        return newShift
      } catch (error) {
        console.error('Store: Error creating shift:', error)
        console.error('Store: Error config URL:', error.config?.url)
        console.error('Store: Error response data:', error.response?.data)
        console.error('Store: Error response status:', error.response?.status)
        console.error('Store: Error response headers:', error.response?.headers)
        this.error = error.response?.data?.message || error.message || 'Failed to create shift'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateShift(id, shiftData) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Store: Updating shift via API...')
        console.log('Store: Shift ID:', id)
        console.log('Store: Update data being sent:', shiftData)
        const response = await shiftsService.update(id, shiftData)
        console.log('Store: API response received:', response)
        const updatedShift = response.data || response
        const index = this.shifts.findIndex(shift => shift.id === id)
        if (index !== -1) {
          this.shifts[index] = { ...this.shifts[index], ...updatedShift }
        }
        return updatedShift
      } catch (error) {
        console.error('Store: Error updating shift:', error)
        console.error('Store: Error config URL:', error.config?.url)
        console.error('Store: Error response data:', error.response?.data)
        console.error('Store: Error response status:', error.response?.status)
        console.error('Store: Error response headers:', error.response?.headers)
        this.error = error.response?.data?.message || error.message || 'Failed to update shift'
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
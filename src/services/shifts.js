import api from './api'

export const shiftsService = {
  getAll(params = {}) {
    return api.get('/shifts', { params })
  },

  getById(id) {
    return api.get(`/shifts/${id}`)
  },

  create(shift) {
    return api.post('/shifts', shift)
  },

  update(id, shift) {
    return api.put(`/shifts/${id}`, shift)
  },

  updateStatus(id, status) {
    return api.patch(`/shifts/${id}/status`, status)
  },

  startShift(id) {
    return api.patch(`/shifts/${id}/status`, {
      status: 'in_progress',
      actual_start_time: new Date().toISOString()
    })
  },

  completeShift(id, completionData = {}) {
    return api.patch(`/shifts/${id}/status`, {
      status: 'completed',
      actual_end_time: new Date().toISOString(),
      ...completionData
    })
  },

  cancelShift(id, reason = '') {
    return api.patch(`/shifts/${id}/status`, {
      status: 'cancelled',
      completion_notes: reason
    })
  },

  delete(id) {
    return api.delete(`/shifts/${id}`)
  },

  // Get shifts by date range
  getByDateRange(startDate, endDate, params = {}) {
    return api.get('/shifts', {
      params: {
        start_date: startDate,
        end_date: endDate,
        ...params
      }
    })
  },

  // Get shifts for specific participant
  getByParticipant(participantId, params = {}) {
    return api.get('/shifts', {
      params: {
        participant_id: participantId,
        ...params
      }
    })
  },

  // Get shifts for specific staff member
  getByStaff(staffId, params = {}) {
    return api.get('/shifts', {
      params: {
        staff_id: staffId,
        ...params
      }
    })
  },

  // Get today's shifts
  getToday(params = {}) {
    const today = new Date().toISOString().split('T')[0]
    return this.getByDateRange(today, today, params)
  },

  // Get upcoming shifts
  getUpcoming(days = 7, params = {}) {
    const today = new Date()
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
    return this.getByDateRange(
      today.toISOString().split('T')[0],
      futureDate.toISOString().split('T')[0],
      params
    )
  }
}
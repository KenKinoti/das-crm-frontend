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

  delete(id) {
    return api.delete(`/shifts/${id}`)
  }
}

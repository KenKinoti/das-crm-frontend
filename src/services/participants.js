import api from './api'

export const participantsService = {
  getAll(params = {}) {
    return api.get('/participants', { params })
  },

  getById(id) {
    return api.get(`/participants/${id}`)
  },

  create(participant) {
    return api.post('/participants', participant)
  },

  update(id, participant) {
    return api.put(`/participants/${id}`, participant)
  },

  delete(id) {
    return api.delete(`/participants/${id}`)
  }
}

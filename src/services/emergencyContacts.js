import api from './api'

export const emergencyContactsService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/emergency-contacts', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/emergency-contacts/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async create(contactData) {
    try {
      const response = await api.post('/emergency-contacts', contactData)
      return response
    } catch (error) {
      throw error
    }
  },

  async update(id, contactData) {
    try {
      const response = await api.put(`/emergency-contacts/${id}`, contactData)
      return response
    } catch (error) {
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/emergency-contacts/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get emergency contacts by participant
  async getByParticipant(participantId, params = {}) {
    try {
      const response = await api.get('/emergency-contacts', {
        params: {
          participant_id: participantId,
          ...params
        }
      })
      return response
    } catch (error) {
      throw error
    }
  }
}
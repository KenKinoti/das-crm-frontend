import api from './api'

export const carePlansService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/care-plans', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/care-plans/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async create(carePlanData) {
    try {
      const response = await api.post('/care-plans', carePlanData)
      return response
    } catch (error) {
      throw error
    }
  },

  async update(id, carePlanData) {
    try {
      const response = await api.put(`/care-plans/${id}`, carePlanData)
      return response
    } catch (error) {
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/care-plans/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async approve(id, approvalData) {
    try {
      const response = await api.patch(`/care-plans/${id}/approve`, approvalData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get care plans by participant
  async getByParticipant(participantId, params = {}) {
    try {
      const response = await api.get('/care-plans', {
        params: {
          participant_id: participantId,
          ...params
        }
      })
      return response
    } catch (error) {
      throw error
    }
  },

  // Get care plans by status
  async getByStatus(status, params = {}) {
    try {
      const response = await api.get('/care-plans', {
        params: {
          status,
          ...params
        }
      })
      return response
    } catch (error) {
      throw error
    }
  }
}
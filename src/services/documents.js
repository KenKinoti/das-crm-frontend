import api from './api'

export const documentsService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/documents', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/documents/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async upload(formData) {
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async update(id, documentData) {
    try {
      const response = await api.put(`/documents/${id}`, documentData)
      return response
    } catch (error) {
      throw error
    }
  },

  async download(id) {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/documents/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get documents by participant
  async getByParticipant(participantId, params = {}) {
    try {
      const response = await api.get('/documents', {
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

  // Get documents by category
  async getByCategory(category, params = {}) {
    try {
      const response = await api.get('/documents', {
        params: {
          category,
          ...params
        }
      })
      return response
    } catch (error) {
      throw error
    }
  }
}
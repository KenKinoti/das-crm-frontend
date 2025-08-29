import api from './api'

export const organizationService = {
  async get() {
    try {
      const response = await api.get('/organization')
      return response
    } catch (error) {
      throw error
    }
  },

  async update(organizationData) {
    try {
      const response = await api.put('/organization', organizationData)
      return response
    } catch (error) {
      throw error
    }
  }
}
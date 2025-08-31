import api from './api'

export const superAdminOrganizationService = {
  async getAllOrganizations(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (search) {
        params.append('search', search)
      }
      
      const response = await api.get(`/super-admin/organizations?${params}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async createOrganization(organizationData) {
    try {
      const response = await api.post('/super-admin/organizations', organizationData)
      return response
    } catch (error) {
      throw error
    }
  },

  async updateOrganizationStatus(organizationId, status) {
    try {
      const response = await api.patch(`/super-admin/organizations/${organizationId}/status`, { status })
      return response
    } catch (error) {
      throw error
    }
  },

  async getOrganizationById(organizationId) {
    try {
      const response = await api.get(`/super-admin/organizations/${organizationId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async deleteOrganization(organizationId) {
    try {
      const response = await api.delete(`/super-admin/organizations/${organizationId}`)
      return response
    } catch (error) {
      throw error
    }
  }
}
import api from './api'

export const reportsService = {
  // Dashboard overview statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/reports/dashboard')
      return response
    } catch (error) {
      throw error
    }
  },

  // Financial reports
  async getRevenueReport(params = {}) {
    try {
      const response = await api.get('/reports/revenue', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getBillingReport(params = {}) {
    try {
      const response = await api.get('/reports/billing', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  // Service delivery reports
  async getShiftsReport(params = {}) {
    try {
      const response = await api.get('/reports/shifts', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getServiceHoursReport(params = {}) {
    try {
      const response = await api.get('/reports/service-hours', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  // Participant reports
  async getParticipantReport(params = {}) {
    try {
      const response = await api.get('/reports/participants', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getParticipantEngagement(params = {}) {
    try {
      const response = await api.get('/reports/participant-engagement', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  // Staff reports
  async getStaffPerformance(params = {}) {
    try {
      const response = await api.get('/reports/staff-performance', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getStaffUtilization(params = {}) {
    try {
      const response = await api.get('/reports/staff-utilization', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  // Custom reports
  async generateCustomReport(reportConfig) {
    try {
      const response = await api.post('/reports/custom', reportConfig)
      return response
    } catch (error) {
      throw error
    }
  },

  // Export reports
  async exportReport(reportType, params = {}, format = 'pdf') {
    try {
      const response = await api.get(`/reports/${reportType}/export`, {
        params: {
          ...params,
          format
        },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  // Get report templates
  async getReportTemplates() {
    try {
      const response = await api.get('/reports/templates')
      return response
    } catch (error) {
      throw error
    }
  }
}
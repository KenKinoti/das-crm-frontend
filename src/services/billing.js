import api from './api'

export const billingService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/billing', { params })
      return response
    } catch (error) {
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/billing/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  async create(billingData) {
    try {
      const response = await api.post('/billing', billingData)
      return response
    } catch (error) {
      throw error
    }
  },

  async update(id, billingData) {
    try {
      const response = await api.put(`/billing/${id}`, billingData)
      return response
    } catch (error) {
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/billing/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Generate invoice from shifts
  async generateInvoice(invoiceData) {
    try {
      const response = await api.post('/billing/generate', invoiceData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get billing by participant
  async getByParticipant(participantId, params = {}) {
    try {
      const response = await api.get('/billing', {
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

  // Get billing by date range
  async getByDateRange(startDate, endDate, params = {}) {
    try {
      const response = await api.get('/billing', {
        params: {
          start_date: startDate,
          end_date: endDate,
          ...params
        }
      })
      return response
    } catch (error) {
      throw error
    }
  },

  // Mark as paid
  async markAsPaid(id, paymentData) {
    try {
      const response = await api.post(`/billing/${id}/payment`, paymentData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Download invoice PDF
  async downloadInvoice(id) {
    try {
      const response = await api.get(`/billing/${id}/download`, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}
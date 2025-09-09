import api from './api'

const ENDPOINTS = {
  incidentReports: '/incident-reports',
  incidentReportStats: '/incident-reports/stats'
}

export const incidentReportService = {
  // Get all incident reports with optional filters
  async getIncidentReports(params = {}) {
    const response = await api.get(ENDPOINTS.incidentReports, { params })
    return response.data
  },

  // Get a single incident report
  async getIncidentReport(id) {
    const response = await api.get(`${ENDPOINTS.incidentReports}/${id}`)
    return response.data
  },

  // Create a new incident report (care workers)
  async createIncidentReport(incidentData) {
    const response = await api.post(ENDPOINTS.incidentReports, incidentData)
    return response.data
  },

  // Update an incident report (support coordinators only)
  async updateIncidentReport(id, updateData) {
    const response = await api.put(`${ENDPOINTS.incidentReports}/${id}`, updateData)
    return response.data
  },

  // Get incident report statistics
  async getIncidentReportStats() {
    const response = await api.get(ENDPOINTS.incidentReportStats)
    return response.data
  },

  // Get incident reports by status
  async getIncidentReportsByStatus(status) {
    return this.getIncidentReports({ status })
  },

  // Get incident reports by severity
  async getIncidentReportsBySeverity(severity) {
    return this.getIncidentReports({ severity })
  },

  // Get incident reports for a participant
  async getIncidentReportsForParticipant(participantId) {
    return this.getIncidentReports({ participant_id: participantId })
  }
}

export default incidentReportService
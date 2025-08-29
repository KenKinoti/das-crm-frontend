import { defineStore } from 'pinia'
import { reportsService } from '../services/reports'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    dashboardStats: {},
    revenueReport: {},
    billingReport: {},
    shiftsReport: {},
    serviceHoursReport: {},
    participantReport: {},
    staffReport: {},
    customReports: [],
    reportTemplates: [],
    isLoading: false,
    error: null
  }),

  getters: {
    totalRevenue: (state) => {
      return state.revenueReport.total || 0
    },

    totalShifts: (state) => {
      return state.shiftsReport.total_shifts || 0
    },

    totalServiceHours: (state) => {
      return state.serviceHoursReport.total_hours || 0
    },

    activeParticipants: (state) => {
      return state.participantReport.active_count || 0
    },

    averageRevenuePerMonth: (state) => {
      const revenue = state.revenueReport.monthly_data || []
      if (revenue.length === 0) return 0
      const total = revenue.reduce((sum, month) => sum + (month.revenue || 0), 0)
      return total / revenue.length
    },

    topServiceTypes: (state) => {
      return state.shiftsReport.service_breakdown || []
    }
  },

  actions: {
    async fetchDashboardStats() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getDashboardStats()
        this.dashboardStats = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch dashboard stats'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchRevenueReport(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getRevenueReport(params)
        this.revenueReport = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch revenue report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchBillingReport(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getBillingReport(params)
        this.billingReport = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch billing report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchShiftsReport(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getShiftsReport(params)
        this.shiftsReport = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch shifts report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchServiceHoursReport(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getServiceHoursReport(params)
        this.serviceHoursReport = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch service hours report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchParticipantReport(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getParticipantReport(params)
        this.participantReport = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch participant report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchStaffReport(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getStaffPerformance(params)
        this.staffReport = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch staff report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async generateCustomReport(reportConfig) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.generateCustomReport(reportConfig)
        this.customReports.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to generate custom report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async exportReport(reportType, params = {}, format = 'pdf') {
      try {
        const response = await reportsService.exportReport(reportType, params, format)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to export report'
        throw error
      }
    },

    async fetchReportTemplates() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await reportsService.getReportTemplates()
        this.reportTemplates = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch report templates'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchAllReports(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        await Promise.all([
          this.fetchDashboardStats(),
          this.fetchRevenueReport(params),
          this.fetchBillingReport(params),
          this.fetchShiftsReport(params),
          this.fetchServiceHoursReport(params),
          this.fetchParticipantReport(params),
          this.fetchStaffReport(params)
        ])
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch reports'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})
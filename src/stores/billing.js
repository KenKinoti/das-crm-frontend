import { defineStore } from 'pinia'
import { billingService } from '../services/billing'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    bills: [],
    currentBill: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    paidBills: (state) => {
      if (!Array.isArray(state.bills)) return []
      return state.bills.filter(bill => bill.status === 'paid')
    },

    unpaidBills: (state) => {
      if (!Array.isArray(state.bills)) return []
      return state.bills.filter(bill => bill.status === 'pending' || bill.status === 'overdue')
    },

    overdueBills: (state) => {
      if (!Array.isArray(state.bills)) return []
      return state.bills.filter(bill => {
        if (bill.status !== 'pending') return false
        return new Date(bill.due_date) < new Date()
      })
    },

    totalRevenue: (state) => {
      if (!Array.isArray(state.bills)) return 0
      return state.bills
        .filter(bill => bill.status === 'paid')
        .reduce((total, bill) => total + parseFloat(bill.total_amount || 0), 0)
    },

    pendingRevenue: (state) => {
      if (!Array.isArray(state.bills)) return 0
      return state.bills
        .filter(bill => bill.status === 'pending' || bill.status === 'overdue')
        .reduce((total, bill) => total + parseFloat(bill.total_amount || 0), 0)
    }
  },

  actions: {
    async fetchBills(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await billingService.getAll(params)
        const bills = response.data.bills || response.data || []
        this.bills = Array.isArray(bills) ? bills : []
        this.pagination = response.data.pagination || this.pagination
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch billing records'
        this.bills = [] // Ensure bills is always an array even on error
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchBill(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await billingService.getById(id)
        this.currentBill = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch billing record'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createBill(billData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await billingService.create(billData)
        this.bills.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create billing record'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateBill(id, billData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await billingService.update(id, billData)
        const index = this.bills.findIndex(b => b.id === id)
        if (index !== -1) {
          this.bills[index] = response.data
        }
        if (this.currentBill?.id === id) {
          this.currentBill = response.data
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update billing record'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteBill(id) {
      this.isLoading = true
      this.error = null
      
      try {
        await billingService.delete(id)
        this.bills = this.bills.filter(b => b.id !== id)
        if (this.currentBill?.id === id) {
          this.currentBill = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete billing record'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async generateInvoice(invoiceData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await billingService.generateInvoice(invoiceData)
        this.bills.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to generate invoice'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async markAsPaid(id, paymentData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await billingService.markAsPaid(id, paymentData)
        const index = this.bills.findIndex(b => b.id === id)
        if (index !== -1) {
          this.bills[index] = response.data
        }
        if (this.currentBill?.id === id) {
          this.currentBill = response.data
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to mark as paid'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async downloadInvoice(id) {
      try {
        const response = await billingService.downloadInvoice(id)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to download invoice'
        throw error
      }
    }
  }
})
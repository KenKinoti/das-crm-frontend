import { defineStore } from 'pinia'
import { carePlansService } from '../services/carePlans'

export const useCarePlansStore = defineStore('carePlans', {
  state: () => ({
    carePlans: [],
    currentCarePlan: null,
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
    carePlansByStatus: (state) => {
      return state.carePlans.reduce((acc, plan) => {
        acc[plan.status] = acc[plan.status] || []
        acc[plan.status].push(plan)
        return acc
      }, {})
    },

    activePlans: (state) => {
      return state.carePlans.filter(plan => plan.status === 'active')
    },

    pendingApproval: (state) => {
      return state.carePlans.filter(plan => plan.status === 'pending_approval')
    }
  },

  actions: {
    async fetchCarePlans(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await carePlansService.getAll(params)
        this.carePlans = response.data.care_plans || response.data
        this.pagination = response.data.pagination || this.pagination
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch care plans'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchCarePlan(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await carePlansService.getById(id)
        this.currentCarePlan = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch care plan'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createCarePlan(carePlanData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await carePlansService.create(carePlanData)
        this.carePlans.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create care plan'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateCarePlan(id, carePlanData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await carePlansService.update(id, carePlanData)
        const index = this.carePlans.findIndex(cp => cp.id === id)
        if (index !== -1) {
          this.carePlans[index] = response.data
        }
        if (this.currentCarePlan?.id === id) {
          this.currentCarePlan = response.data
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update care plan'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async approveCarePlan(id, approvalData = { approval_action: 'approve' }) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await carePlansService.approve(id, approvalData)
        const index = this.carePlans.findIndex(cp => cp.id === id)
        if (index !== -1) {
          this.carePlans[index] = response.data
        }
        if (this.currentCarePlan?.id === id) {
          this.currentCarePlan = response.data
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to approve care plan'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteCarePlan(id) {
      this.isLoading = true
      this.error = null
      
      try {
        await carePlansService.delete(id)
        this.carePlans = this.carePlans.filter(cp => cp.id !== id)
        if (this.currentCarePlan?.id === id) {
          this.currentCarePlan = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete care plan'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchCarePlansByParticipant(participantId, params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await carePlansService.getByParticipant(participantId, params)
        return response.data.care_plans || response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch participant care plans'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})
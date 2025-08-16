import { defineStore } from 'pinia'
import { participantsService } from '../services/participants'

export const useParticipantsStore = defineStore('participants', {
  state: () => ({
    participants: [],
    currentParticipant: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  }),

  actions: {
    async fetchParticipants(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await participantsService.getAll(params)
        this.participants = response.data.participants
        this.pagination = response.data.pagination
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch participants'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchParticipant(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await participantsService.getById(id)
        this.currentParticipant = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch participant'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createParticipant(participant) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await participantsService.create(participant)
        this.participants.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create participant'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})

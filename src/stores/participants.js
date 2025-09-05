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
        const responseData = response.data || response
        this.participants = responseData.participants || responseData || []
        this.pagination = responseData.pagination || this.pagination
      } catch (error) {
        console.error('Error fetching participants:', error)
        this.error = error.response?.data?.message || error.message || 'Failed to fetch participants'
        this.participants = []
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
      console.log('🏪 STORE: createParticipant called with data:', participant)
      this.isLoading = true
      this.error = null
      
      try {
        console.log('🏪 STORE: Calling participantsService.create')
        const response = await participantsService.create(participant)
        console.log('🏪 STORE: Service call successful, response:', response)
        
        this.participants.unshift(response.data)
        console.log('🏪 STORE: Participant added to store, new count:', this.participants.length)
        return response
      } catch (error) {
        console.error('🏪 STORE: Error in createParticipant:', error)
        console.error('🏪 STORE: Full error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          url: error.config?.url,
          method: error.config?.method,
          requestData: error.config?.data
        })
        
        // Log the backend error message specifically
        if (error.response?.data) {
          console.error('🚨 BACKEND ERROR MESSAGE:', JSON.stringify(error.response.data, null, 2))
        }
        
        // Also log what we sent to help debug
        if (error.config?.data) {
          console.error('📤 DATA SENT TO API:', JSON.stringify(JSON.parse(error.config.data), null, 2))
        }
        this.error = error.response?.data?.message || 'Failed to create participant'
        throw error
      } finally {
        this.isLoading = false
        console.log('🏪 STORE: createParticipant completed, loading state reset')
      }
    },

    async updateParticipant(id, participant) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await participantsService.update(id, participant)
        const index = this.participants.findIndex(p => p.id === id)
        if (index !== -1) {
          this.participants[index] = response.data
        }
        if (this.currentParticipant?.id === id) {
          this.currentParticipant = response.data
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update participant'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteParticipant(id) {
      this.isLoading = true
      this.error = null
      
      try {
        await participantsService.delete(id)
        this.participants = this.participants.filter(p => p.id !== id)
        if (this.currentParticipant?.id === id) {
          this.currentParticipant = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete participant'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})

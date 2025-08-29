import { defineStore } from 'pinia'
import { documentsService } from '../services/documents'

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [],
    currentDocument: null,
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
    documentsByCategory: (state) => {
      return state.documents.reduce((acc, doc) => {
        acc[doc.category] = acc[doc.category] || []
        acc[doc.category].push(doc)
        return acc
      }, {})
    },

    activeDocuments: (state) => {
      return state.documents.filter(doc => doc.is_active)
    },

    expiringDocuments: (state) => {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      return state.documents.filter(doc => {
        if (!doc.expiry_date) return false
        return new Date(doc.expiry_date) <= thirtyDaysFromNow
      })
    }
  },

  actions: {
    async fetchDocuments(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await documentsService.getAll(params)
        this.documents = response.data.documents || response.data
        this.pagination = response.data.pagination || this.pagination
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch documents'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchDocument(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await documentsService.getById(id)
        this.currentDocument = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch document'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async uploadDocument(formData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await documentsService.upload(formData)
        this.documents.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to upload document'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateDocument(id, documentData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await documentsService.update(id, documentData)
        const index = this.documents.findIndex(d => d.id === id)
        if (index !== -1) {
          this.documents[index] = response.data
        }
        if (this.currentDocument?.id === id) {
          this.currentDocument = response.data
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update document'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async downloadDocument(id) {
      try {
        const response = await documentsService.download(id)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to download document'
        throw error
      }
    },

    async deleteDocument(id) {
      this.isLoading = true
      this.error = null
      
      try {
        await documentsService.delete(id)
        this.documents = this.documents.filter(d => d.id !== id)
        if (this.currentDocument?.id === id) {
          this.currentDocument = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete document'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchDocumentsByParticipant(participantId, params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await documentsService.getByParticipant(participantId, params)
        return response.data.documents || response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch participant documents'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})